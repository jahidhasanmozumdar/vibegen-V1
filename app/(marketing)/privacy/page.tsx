import Link from "next/link";

import { LegalShell } from "@/components/sections/legal-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import { getSiteSettings } from "@/lib/services/settings";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "What personal data VibeGen collects through this website, why, who processes it, how long we keep it and the choices you have.",
  path: "/privacy",
});

const toc = [
  { id: "who-we-are", label: "Who we are" },
  { id: "what-we-collect", label: "What we collect" },
  { id: "attribution", label: "Attribution data" },
  { id: "cookies", label: "Cookies and similar technologies" },
  { id: "how-we-use", label: "How we use your data" },
  { id: "legal-bases", label: "Legal bases" },
  { id: "processors", label: "Who processes your data" },
  { id: "transfers", label: "International transfers" },
  { id: "retention", label: "How long we keep it" },
  { id: "security", label: "Security" },
  { id: "your-rights", label: "Your rights" },
  { id: "children", label: "Children" },
  { id: "changes", label: "Changes to this policy" },
  { id: "contact", label: "Contact us" },
];

export default async function PrivacyPage() {
  const { contact_email: email } = await getSiteSettings();

  return (
    <LegalShell
      title="Privacy Policy"
      path="/privacy"
      toc={toc}
      intro={
        <p>
          This policy explains what personal data VibeGen collects when you use this website or contact us, why we collect it, and what you can do about it. We
          try to collect only what we need to respond to you and to understand which marketing is working.
        </p>
      }
    >
      <h2 id="who-we-are">Who we are</h2>
      <p>
        VibeGen (&ldquo;we&rdquo;, &ldquo;us&rdquo;) provides performance marketing services: Meta Ads, Google Ads, landing pages,
        conversion rate optimization and analytics. For the personal data described here, we act as the controller.
      </p>
      <p>
        {/* TODO(legal): add the registered business name, address and any registration numbers once confirmed. */}
        Our registered business details will be listed here. Until then, you can reach us through our <Link href="/contact">contact page</Link>.
      </p>

      <h2 id="what-we-collect">What we collect</h2>
      <p>We collect the information you choose to send us through the forms on this site:</p>
      <ul>
        <li>
          <strong>Free Growth Audit form:</strong> full name, work email, company, website URL, country, industry, approximate monthly ad spend, primary advertising
          platform, your current challenge, the services you&apos;re interested in, an optional message, and your consent to be contacted.
        </li>
        <li>
          <strong>Contact form:</strong> name, business email, and optionally company, website, country, business type, approximate monthly ad spend, services of
          interest, and your message.
        </li>
        <li>
          <strong>Call request form:</strong> name, email, and optionally company, website, preferred times and the topics you&apos;d like to cover, and your consent to
          be contacted.
        </li>
      </ul>
      <p>
        Please don&apos;t send passwords, payment details or sensitive personal data through these forms. If we later need access to your ad or analytics accounts,
        we&apos;ll ask you to grant it through the platform&apos;s own access controls.
      </p>
      <p>
        To protect the forms from spam and abuse, we also process technical data such as your IP address (used briefly for rate limiting and not stored with your
        submission) and the time the form was loaded.
      </p>

      <h2 id="attribution">Attribution data</h2>
      <p>When you submit a form, we store some information about how you found us, so we can tell which marketing is working:</p>
      <ul>
        <li>Campaign parameters in the link you arrived from (UTM source, medium, campaign, term and content, or an ad click identifier)</li>
        <li>The referring website, if your browser shares it</li>
        <li>The first page you landed on and the time of your first and most recent visit in this session</li>
        <li>Device type (mobile, tablet or desktop), derived from your browser&apos;s user agent</li>
        <li>Approximate country, where our hosting provider supplies it from your IP address</li>
      </ul>
      <p>
        This information is only linked to you if you submit a form. We don&apos;t use it to build advertising profiles.
      </p>

      <h2 id="cookies">Cookies and similar technologies</h2>
      <p>
        We use a small amount of browser storage that the site needs to work, such as remembering your cookie choices and the campaign that brought you here during your
        visit. Analytics and advertising tools only load if you agree to them:
      </p>
      <ul>
        <li>
          <strong>Analytics</strong> (with your consent): Google Analytics 4 and Google Tag Manager, and our own first-party event log, which records page views and
          form events without cookies.
        </li>
        <li>
          <strong>Advertising</strong> (with your consent): Meta Pixel and Google Ads conversion tracking, which help us measure whether our ads lead to enquiries.
        </li>
      </ul>
      <p>
        You can change your choice at any time. Our <Link href="/cookie-policy">Cookie Policy</Link> lists each item and how long it lasts.
      </p>

      <h2 id="how-we-use">How we use your data</h2>
      <ul>
        <li>To reply to your enquiry, prepare your growth audit, or arrange a call you requested</li>
        <li>To manage our relationship with you if you become a client</li>
        <li>To understand which pages and campaigns bring enquiries, so we can improve our marketing</li>
        <li>To protect the site against spam, fraud and abuse</li>
        <li>To meet legal, accounting and regulatory obligations</li>
      </ul>
      <p>We don&apos;t sell your personal data, and we don&apos;t share it with other businesses for their own marketing.</p>

      <h2 id="legal-bases">Legal bases</h2>
      <p>Where the law requires a legal basis for processing, we generally rely on:</p>
      <ul>
        <li>
          <strong>Consent</strong> — for analytics and advertising cookies, and for contacting you about an audit or call request where you ticked the consent box
        </li>
        <li>
          <strong>Steps before a contract</strong> — when you ask us about working together
        </li>
        <li>
          <strong>Legitimate interests</strong> — to run and secure the website, respond to general enquiries and understand our marketing performance
        </li>
        <li>
          <strong>Legal obligation</strong> — where we must keep records
        </li>
      </ul>
      <p>Which of these apply to you depends on where you live and the laws that apply there.</p>

      <h2 id="processors">Who processes your data</h2>
      <p>We use trusted service providers to run this site. They process data on our behalf and under our instructions:</p>
      <ul>
        <li>
          <strong>Website hosting</strong> — serves the site and may process technical data such as IP address and request logs
        </li>
        <li>
          <strong>Database hosting (PostgreSQL)</strong> — stores form submissions and related records
        </li>
        <li>
          <strong>Email provider</strong> — sends notifications to our team and, where applicable, a confirmation to you
        </li>
        <li>
          <strong>Analytics and advertising providers</strong> (Google and Meta) — only if you consent to those cookies
        </li>
      </ul>
      <p>We may also disclose data if required by law, or to professional advisers such as lawyers and accountants under confidentiality obligations.</p>

      <h2 id="transfers">International transfers</h2>
      <p>
        Some of our providers may process data outside your country, including in the United States. Where required, we rely on appropriate safeguards offered by those
        providers, such as standard contractual clauses.
      </p>

      <h2 id="retention">How long we keep it</h2>
      <ul>
        <li>Enquiries and audit requests that don&apos;t lead to work: typically up to 24 months after our last contact, then deleted or anonymized</li>
        <li>Client records: for the length of the engagement and as long afterwards as tax and accounting rules require</li>
        <li>First-party analytics events: kept in aggregate form for reporting; they don&apos;t contain your name or email</li>
      </ul>
      <p>You can ask us to delete your data sooner, subject to any legal obligation to keep it.</p>

      <h2 id="security">Security</h2>
      <p>
        We use access controls, encrypted connections and reputable providers to protect your data. No system is completely secure, so we can&apos;t guarantee absolute
        security, but we&apos;ll act promptly if something goes wrong.
      </p>

      <h2 id="your-rights">Your rights</h2>
      <p>Depending on where you live, you may have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you</li>
        <li>Correct inaccurate data</li>
        <li>Ask us to delete your data</li>
        <li>Object to or restrict certain processing</li>
        <li>Receive your data in a portable format</li>
        <li>Withdraw consent at any time, without affecting processing that already happened</li>
        <li>Complain to your local data protection authority</li>
      </ul>
      <p>To exercise any of these, contact us using the details below. We may need to confirm your identity before acting on a request.</p>

      <h2 id="children">Children</h2>
      <p>This site is for businesses and isn&apos;t directed at children. We don&apos;t knowingly collect data from anyone under 16.</p>

      <h2 id="changes">Changes to this policy</h2>
      <p>We&apos;ll update this page when our practices change and revise the &ldquo;last updated&rdquo; date above.</p>

      <h2 id="contact">Contact us</h2>
      <p>
        For privacy questions or requests, use our <Link href="/contact">contact page</Link>
        {email ? (
          <>
            {" "}
            or email <a href={`mailto:${email}`}>{email}</a>
          </>
        ) : null}
        .
      </p>
    </LegalShell>
  );
}
