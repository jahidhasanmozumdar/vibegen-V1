import Link from "next/link";

import { LegalShell } from "@/components/sections/legal-shell";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Terms of Use",
  description: "The terms that apply when you use the VibeGen website, request a growth audit or book a call.",
  path: "/terms",
});

const toc = [
  { id: "about", label: "About these terms" },
  { id: "use", label: "Using the site" },
  { id: "audits", label: "Free audits and calls" },
  { id: "no-guarantees", label: "No guarantees" },
  { id: "content", label: "Our content" },
  { id: "your-info", label: "Information you send us" },
  { id: "third-parties", label: "Third-party links and tools" },
  { id: "liability", label: "Liability" },
  { id: "services", label: "Client services" },
  { id: "changes", label: "Changes" },
  { id: "law", label: "Governing law" },
  { id: "contact", label: "Contact" },
];

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Use"
      path="/terms"
      toc={toc}
      intro={<p>These terms apply to your use of this website and to any free growth audit or strategy call you request through it. Please read them before using the site.</p>}
    >
      <h2 id="about">About these terms</h2>
      <p>
        This website is operated by VibeGen (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By using the site, you agree to these terms. If you
        don&apos;t agree, please don&apos;t use the site.
      </p>

      <h2 id="use">Using the site</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the site in a way that breaks any law or regulation</li>
        <li>Submit false information, spam or content that belongs to someone else without permission</li>
        <li>Try to gain unauthorized access to the site, its admin area or its systems</li>
        <li>Interfere with the site&apos;s operation, including through automated scraping or excessive requests</li>
      </ul>
      <p>We may limit or block access if we reasonably believe these terms are being broken.</p>

      <h2 id="audits">Free audits and calls</h2>
      <p>
        A free growth audit or strategy call is an initial, no-obligation review based on the information you give us and anything publicly visible. It is not a full
        engagement. We may decline a request, for example if we don&apos;t think we can help.
      </p>
      <p>
        Recommendations are general in nature and made in good faith. You decide whether and how to act on them, and you remain responsible for your ad accounts,
        website and budgets.
      </p>

      <h2 id="no-guarantees">No guarantees</h2>
      <p>
        Nothing on this site, in an audit or on a call is a guarantee of leads, sales, revenue, return on ad spend, cost per acquisition or conversion rate. Results
        depend on many factors outside our control, including your market, offer, competition, budget, website, pricing, sales process, lead follow-up, tracking and
        changes made by advertising platforms.
      </p>
      <p>
        Case studies marked &ldquo;Illustrative Example — Demo Data&rdquo; are hypothetical and do not describe real clients or results.
      </p>

      <h2 id="content">Our content</h2>
      <p>
        The text, design, graphics and code on this site belong to VibeGen or its licensors. You may read, share links to and quote short excerpts from our
        articles with attribution. Please don&apos;t copy or republish substantial parts of the site without permission.
      </p>
      <p>Articles are for general information only and are not professional advice for your specific situation.</p>

      <h2 id="your-info">Information you send us</h2>
      <p>
        You confirm that information you submit is accurate and that you&apos;re allowed to share it. How we handle personal data is explained in our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2 id="third-parties">Third-party links and tools</h2>
      <p>
        The site may link to or embed third-party services, such as a scheduling tool. Those services have their own terms and privacy policies, and we&apos;re not
        responsible for their content or availability.
      </p>

      <h2 id="liability">Liability</h2>
      <p>
        The site is provided &ldquo;as is&rdquo;. To the extent permitted by law, we exclude all warranties and are not liable for indirect or consequential loss, or for
        loss of profit, revenue, data or business arising from your use of the site or reliance on its content.
      </p>
      <p>
        Nothing in these terms limits liability that cannot be limited by law, such as liability for death or personal injury caused by negligence, or for fraud.
      </p>

      <h2 id="services">Client services</h2>
      <p>
        Paid services are governed by a separate proposal and agreement. If there is a conflict between these terms and a signed agreement, the agreement applies.
        Advertising spend is paid directly by clients to the platforms and is not part of our fees.
      </p>

      <h2 id="changes">Changes</h2>
      <p>We may update these terms from time to time. The &ldquo;last updated&rdquo; date above shows when they last changed.</p>

      <h2 id="law">Governing law</h2>
      <p>
        {/* TODO(legal): set the governing law and courts once the business's jurisdiction is confirmed. */}
        These terms are governed by the laws of the jurisdiction in which VibeGen is established, and disputes will be handled by the courts of that jurisdiction,
        unless the law where you live gives you the right to bring a claim locally.
      </p>

      <h2 id="contact">Contact</h2>
      <p>
        Questions about these terms? Use our <Link href="/contact">contact page</Link>.
      </p>
    </LegalShell>
  );
}
