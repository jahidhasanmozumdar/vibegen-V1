import Link from "next/link";

import { LegalShell } from "@/components/sections/legal-shell";
import { CookieSettingsLink } from "@/components/tracking/cookie-settings-link";
import { buttonClasses } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Cookie Policy",
  description: "The cookies and browser storage VibeGen uses, what each one does, how long it lasts and how to change your choices.",
  path: "/cookie-policy",
});

const toc = [
  { id: "what", label: "What cookies are" },
  { id: "choices", label: "Your choices" },
  { id: "list", label: "What we use" },
  { id: "browser", label: "Browser controls" },
  { id: "changes", label: "Changes" },
  { id: "contact", label: "Contact" },
];

interface StorageItem {
  name: string;
  provider: string;
  type: string;
  purpose: string;
  duration: string;
}

const categories: { id: string; title: string; description: string; items: StorageItem[] }[] = [
  {
    id: "necessary",
    title: "Strictly necessary",
    description: "Always on. These make the site work and remember your choices. They don't track you across other sites.",
    items: [
      { name: "vg_consent", provider: "VibeGen", type: "Local storage", purpose: "Remembers your cookie choices", duration: "Until you clear it or change your choice" },
      { name: "vg_last_touch", provider: "VibeGen", type: "Session storage", purpose: "Remembers the campaign or referrer that brought you here, so it can be attached to a form you submit", duration: "Until you close the tab" },
      { name: "vg_sid", provider: "VibeGen", type: "Session storage", purpose: "Random session ID that groups page events in one visit", duration: "Until you close the tab" },
    ],
  },
  {
    id: "analytics",
    title: "Analytics",
    description: "Only with your consent. These help us understand which pages and campaigns are useful.",
    items: [
      { name: "vg_first_touch", provider: "VibeGen", type: "Local storage", purpose: "Remembers how you first found the site, for attribution", duration: "Until you clear it" },
      { name: "_ga, _ga_*", provider: "Google Analytics 4", type: "Cookie", purpose: "Distinguishes visitors and sessions for site statistics", duration: "Up to 2 years" },
      { name: "Google Tag Manager", provider: "Google", type: "Script", purpose: "Loads the analytics and advertising tags you've agreed to", duration: "Does not set its own cookies" },
    ],
  },
  {
    id: "advertising",
    title: "Advertising",
    description: "Only with your consent. These measure whether our ads lead to enquiries.",
    items: [
      { name: "_fbp", provider: "Meta (Meta Pixel)", type: "Cookie", purpose: "Measures visits and conversions from Meta ads", duration: "Up to 90 days" },
      { name: "_gcl_au, _gcl_aw", provider: "Google Ads", type: "Cookie", purpose: "Measures conversions from Google ads", duration: "Up to 90 days" },
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalShell
      title="Cookie Policy"
      path="/cookie-policy"
      toc={toc}
      intro={
        <p>
          This policy explains the cookies and similar browser storage used on this site. We keep it short: a few items the site needs to work, and analytics and
          advertising tools that only load if you say yes.
        </p>
      }
    >
      <h2 id="what">What cookies are</h2>
      <p>
        Cookies are small files a website stores in your browser. Local storage and session storage are similar browser features. Session storage is cleared when you
        close the tab; local storage stays until you clear it.
      </p>

      <h2 id="choices">Your choices</h2>
      <p>
        When you first visit, you can accept all, reject non-essential, or choose categories. Nothing in the analytics or advertising categories loads until you agree.
        You can change your mind at any time:
      </p>
      <div>
        <CookieSettingsLink className={buttonClasses("outline", "md")} />
      </div>

      <h2 id="list">What we use</h2>
      {categories.map((cat) => (
        <section key={cat.id} aria-labelledby={`cat-${cat.id}`} className="[&>*+*]:mt-3">
          <h3 id={`cat-${cat.id}`}>{cat.title}</h3>
          <p>{cat.description}</p>
          <div className="mt-4 overflow-x-auto rounded-[16px] border border-hair">
            <table className="w-full min-w-[620px] text-left text-[13.5px] leading-snug">
              <thead className="border-b border-hair bg-soft text-[12.5px] text-fg-3">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Provider
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Purpose
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hair">
                {cat.items.map((item) => (
                  <tr key={item.name} className="align-top">
                    <th scope="row" className="px-4 py-3 font-mono text-[12.5px] font-medium whitespace-nowrap text-fg">
                      {item.name}
                    </th>
                    <td className="px-4 py-3 text-fg-2">{item.provider}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-fg-2">{item.type}</td>
                    <td className="px-4 py-3 text-fg-2">{item.purpose}</td>
                    <td className="px-4 py-3 text-fg-3">{item.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      <p>
        Third-party providers may change the names and lifetimes of their cookies. Check Google&apos;s and Meta&apos;s own policies for their current details. Tracking
        tools only load if the relevant ID is configured on this site.
      </p>

      <h2 id="browser">Browser controls</h2>
      <p>
        Most browsers let you block or delete cookies and site data. Blocking strictly necessary storage may mean the site forgets your cookie choices. Blocking
        analytics or advertising cookies won&apos;t affect how the site works.
      </p>

      <h2 id="changes">Changes</h2>
      <p>We&apos;ll update this page if the tools we use change, and revise the &ldquo;last updated&rdquo; date above.</p>

      <h2 id="contact">Contact</h2>
      <p>
        Questions? See our <Link href="/privacy">Privacy Policy</Link> or use our <Link href="/contact">contact page</Link>.
      </p>
    </LegalShell>
  );
}
