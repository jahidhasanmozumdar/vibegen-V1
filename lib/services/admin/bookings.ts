import "server-only";

import { adminStore, StoreError, type DataStore } from "@/lib/data";
import { meetingTypeLabels } from "@/lib/data/labels";
import { BOOKING_STATUSES, MEETING_TYPES, type Booking, type BookingStatus, type MeetingType } from "@/lib/data/types";
import { createNotification } from "@/lib/services/notifications";
import { formatDateTime } from "@/lib/utils/format";
import { logLeadActivity, type Actor } from "./leads";
import {
  DEFAULT_PAGE_SIZE,
  DEMO_FILTERS,
  dateParam,
  enumParam,
  matchesDemo,
  matchesQuery,
  pageParam,
  paginate,
  param,
  withinDates,
  type DemoFilter,
  type Paged,
  type SearchParamsRecord,
} from "./query";

export interface BookingFilters {
  q?: string;
  status?: BookingStatus;
  type?: MeetingType;
  when?: "upcoming" | "past";
  demo?: DemoFilter;
  from?: string;
  to?: string;
  /** Booking to highlight; when no page is given, the list jumps to its page. */
  highlight?: string;
  explicitPage: boolean;
  page: number;
  pageSize: number;
}

export function parseBookingFilters(sp: SearchParamsRecord): BookingFilters {
  return {
    q: param(sp, "q"),
    status: enumParam(sp, "status", BOOKING_STATUSES),
    type: enumParam(sp, "type", MEETING_TYPES),
    when: enumParam(sp, "when", ["upcoming", "past"] as const),
    demo: enumParam(sp, "demo", DEMO_FILTERS),
    from: dateParam(sp, "from"),
    to: dateParam(sp, "to"),
    highlight: param(sp, "highlight"),
    explicitPage: Boolean(param(sp, "page")),
    page: pageParam(sp),
    pageSize: DEFAULT_PAGE_SIZE,
  };
}

export function hasActiveBookingFilters(f: BookingFilters): boolean {
  return Boolean(f.q || f.status || f.type || f.when || f.demo || f.from || f.to);
}

/** Upcoming first (soonest at top), then past (most recent first), then undated. */
function bookingOrder(a: Booking, b: Booking, now: number): number {
  const ta = a.meeting_at ? new Date(a.meeting_at).getTime() : null;
  const tb = b.meeting_at ? new Date(b.meeting_at).getTime() : null;
  if (ta === null && tb === null) return b.created_at.localeCompare(a.created_at);
  if (ta === null) return 1;
  if (tb === null) return -1;
  const fa = ta >= now;
  const fb = tb >= now;
  if (fa !== fb) return fa ? -1 : 1;
  return fa ? ta - tb : tb - ta;
}

export async function listBookings(filters: BookingFilters): Promise<Paged<Booking> & { now: string }> {
  const store = await adminStore();
  const now = Date.now();
  const all = await store.list("bookings");
  const rows = all
    .filter((b) => matchesQuery(filters.q, b.name, b.email, b.company))
    .filter((b) => !filters.status || b.status === filters.status)
    .filter((b) => !filters.type || b.meeting_type === filters.type)
    .filter((b) => {
      if (!filters.when) return true;
      if (!b.meeting_at) return false;
      const t = new Date(b.meeting_at).getTime();
      return filters.when === "upcoming" ? t >= now : t < now;
    })
    .filter((b) => matchesDemo(b.is_demo, filters.demo))
    .filter((b) => withinDates(b.meeting_at, filters.from, filters.to))
    .sort((a, b) => bookingOrder(a, b, now));
  let page = filters.page;
  if (filters.highlight && !filters.explicitPage) {
    const index = rows.findIndex((b) => b.id === filters.highlight);
    if (index >= 0) page = Math.floor(index / filters.pageSize) + 1;
  }
  return { ...paginate(rows, page, filters.pageSize), now: new Date(now).toISOString() };
}

export async function getBooking(id: string): Promise<Booking | null> {
  const store = await adminStore();
  const booking = await store.get("bookings", id);
  return booking && !booking.deleted_at ? booking : null;
}

export interface BookingInput {
  name: string;
  email: string;
  company: string | null;
  meeting_at: string | null;
  meeting_type: MeetingType;
  status: BookingStatus;
  notes: string | null;
}

async function requireBooking(store: DataStore, id: string): Promise<Booking> {
  const booking = await store.get("bookings", id);
  if (!booking || booking.deleted_at) throw new StoreError("Booking not found.", "not_found");
  return booking;
}

/** Manual booking. Links to an existing lead with the same email when there is one. */
export async function createBooking(input: BookingInput, actor: Actor): Promise<Booking> {
  const store = await adminStore();
  const lead = await store.findOne("leads", { email: input.email, deleted_at: null });
  const booking = await store.insert("bookings", {
    ...input,
    lead_id: lead?.id ?? null,
    source: lead?.source ?? "direct",
    provider: "manual",
    external_id: null,
    is_demo: false,
    deleted_at: null,
  });
  if (lead) {
    const when = input.meeting_at ? ` for ${formatDateTime(input.meeting_at)}` : "";
    await logLeadActivity(store, lead.id, "call_booked", `${meetingTypeLabels[input.meeting_type]} booked${when}`, actor, { booking_id: booking.id });
  }
  await createNotification(store, {
    type: "new_booking",
    title: "New booking",
    body: `${input.name}${input.company ? ` (${input.company})` : ""}: ${meetingTypeLabels[input.meeting_type].toLowerCase()}${input.meeting_at ? ` on ${formatDateTime(input.meeting_at)}` : ""}.`,
    link: `/admin/bookings?highlight=${booking.id}`,
  });
  return booking;
}

export async function updateBooking(id: string, input: BookingInput): Promise<Booking> {
  const store = await adminStore();
  await requireBooking(store, id);
  return store.update("bookings", id, input);
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
  const store = await adminStore();
  await requireBooking(store, id);
  return store.update("bookings", id, { status });
}

/** Soft delete. */
export async function deleteBooking(id: string): Promise<void> {
  const store = await adminStore();
  await requireBooking(store, id);
  await store.update("bookings", id, { deleted_at: new Date().toISOString() });
}
