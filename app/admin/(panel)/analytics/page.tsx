import type { Metadata } from "next";

import { DateRangePicker } from "@/components/admin/date-range-picker";
import { KpiCard, KpiGrid } from "@/components/admin/kpi-card";
import { PageHeader } from "@/components/admin/page-header";
import { BarList } from "@/components/charts/bar-list";
import { ChartCard } from "@/components/charts/chart-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { formatValue } from "@/components/charts/utils";
import { Card, CardHeader } from "@/components/ui/card";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { requireUser } from "@/lib/auth/session";
import { publicEnv } from "@/lib/config/env";
import { getAnalyticsSummary } from "@/lib/services/admin/analytics";
import { parseDateRange } from "@/lib/services/admin/date-range";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage(props: PageProps<"/admin/analytics">) {
  await requireUser();
  const sp = await props.searchParams;
  const range = parseDateRange(sp, "90d");
  const data = await getAnalyticsSummary(range);
  const demo = publicEnv.demoMode;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description={`${range.label} · leads, conversion and attribution from your own CRM data`}
        demo={demo}
        actions={<DateRangePicker basePath="/admin/analytics" range={range} />}
      />

      <section aria-labelledby="analytics-kpis" className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="analytics-kpis" className="font-sans text-[13px] font-semibold tracking-normal text-fg-2">
            Funnel · {range.label}
          </h2>
        </div>
        <KpiGrid className="grid-cols-2 md:grid-cols-4">
          {data.kpis.map((k) => (
            <KpiCard key={k.key} kpi={k} />
          ))}
        </KpiGrid>
      </section>

      <ChartCard title="Monthly trend" description="Leads created per month, and how many reached Qualified or later">
        <TrendChart
          title="Monthly leads and qualified leads"
          labels={data.monthly.map((m) => m.label)}
          series={[
            { name: "Leads", values: data.monthly.map((m) => m.leads) },
            { name: "Qualified or later", values: data.monthly.map((m) => m.qualified) },
          ]}
          height={240}
          emptyMessage="No leads in these months yet."
        />
        <div className="mt-4 overflow-x-auto border-t border-hair pt-3">
          <table className="w-full text-[12.5px]">
            <caption className="sr-only">Monthly leads, qualified, won and conversion rate</caption>
            <thead>
              <tr className="text-fg-2">
                <th scope="col" className="py-1 pr-3 text-left font-medium">
                  Month
                </th>
                {data.monthly.map((m) => (
                  <th key={m.key} scope="col" className="px-2 py-1 text-right font-medium">
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="tabular">
              {(
                [
                  ["Leads", (m: (typeof data.monthly)[number]) => formatValue(m.leads)],
                  ["Qualified+", (m: (typeof data.monthly)[number]) => formatValue(m.qualified)],
                  ["Won", (m: (typeof data.monthly)[number]) => formatValue(m.won)],
                  ["Lead → won", (m: (typeof data.monthly)[number]) => (m.leads ? formatValue(m.won / m.leads, "percent") : "—")],
                ] as const
              ).map(([label, fn]) => (
                <tr key={label} className="border-t border-hair">
                  <th scope="row" className="py-1.5 pr-3 text-left font-medium text-fg-2">
                    {label}
                  </th>
                  {data.monthly.map((m) => (
                    <td key={m.key} className="px-2 py-1.5 text-right text-fg">
                      {fn(m)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ChartCard title="Top lead sources" description="Leads by source in this period">
          <BarList title="Top lead sources" items={data.topSources} showShare valueLabel="Leads" emptyMessage="No leads in this period." />
        </ChartCard>
        <ChartCard title="Top services" description="Services requested (a lead can pick several)">
          <BarList title="Top services requested" items={data.topServices} valueLabel="Leads interested" emptyMessage="No service requests in this period." />
        </ChartCard>
        <ChartCard title="Top industries" description="As entered on the forms">
          <BarList title="Top industries" items={data.topIndustries} showShare valueLabel="Leads" emptyMessage="No industry data in this period." />
        </ChartCard>
        <ChartCard title="Top landing pages" description="Where converting visitors first landed">
          <BarList title="Top landing pages" items={data.topLandingPages} valueLabel="Leads" emptyMessage="No landing page data yet. It's captured once visitors accept analytics cookies." />
        </ChartCard>
      </div>

      <Card>
        <CardHeader title="UTM performance" description="Leads created in this period, grouped by UTM source / medium / campaign. CVR = won ÷ leads." />
        {data.utm.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-fg-2">No leads in this period yet.</p>
        ) : (
          <Table className="text-[13px]">
            <THead>
              <tr>
                <TH>Source</TH>
                <TH>Medium</TH>
                <TH>Campaign</TH>
                <TH className="text-right">Leads</TH>
                <TH className="text-right">Qualified</TH>
                <TH className="text-right">Won</TH>
                <TH className="text-right">CVR</TH>
              </tr>
            </THead>
            <tbody className="tabular">
              {data.utm.map((r) => (
                <TR key={`${r.source}|${r.medium}|${r.campaign}`}>
                  <TD className={r.source === "(none)" ? "text-fg-3" : "font-medium text-fg"}>{r.source}</TD>
                  <TD className={r.medium === "(none)" ? "text-fg-3" : undefined}>{r.medium}</TD>
                  <TD className={r.campaign === "(none)" ? "text-fg-3" : undefined}>{r.campaign}</TD>
                  <TD className="text-right text-fg">{r.leads}</TD>
                  <TD className="text-right">{r.qualified}</TD>
                  <TD className="text-right">{r.won}</TD>
                  <TD className="text-right font-medium text-fg">{formatValue(r.cvr, "percent")}</TD>
                </TR>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
      <p className="text-[12px] text-fg-3">
        Figures come from leads, audits and bookings stored in this dashboard, not from ad platforms. &ldquo;(none)&rdquo; means no UTM parameters were captured (organic, direct or referral
        traffic, or tracking was declined).
      </p>
    </div>
  );
}
