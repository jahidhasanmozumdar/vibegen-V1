import type { NewRow, SeoFields } from "@/lib/data/types";

export const defaultBlogCategories: NewRow<"blog_categories">[] = [
  {
    name: "Meta Ads",
    slug: "meta-ads",
    description: "Practical guidance on Facebook and Instagram advertising: structure, audiences, retargeting and conversion tracking.",
  },
  {
    name: "Google Ads",
    slug: "google-ads",
    description: "Search campaigns, keywords, negatives, bidding and budgets for Google Ads.",
  },
  {
    name: "Landing Pages",
    slug: "landing-pages",
    description: "Building campaign landing pages that match the ad and convert paid traffic.",
  },
  {
    name: "CRO",
    slug: "cro",
    description: "Conversion rate optimization that goes beyond button colors: research, friction, trust and testing.",
  },
  {
    name: "Analytics & Tracking",
    slug: "analytics-tracking",
    description: "GA4, GTM, UTMs, conversion events and attribution, explained for business owners.",
  },
  {
    name: "Paid Acquisition",
    slug: "paid-acquisition",
    description: "Budgets, lead quality, unit economics and how paid channels fit together.",
  },
];

export type SeedBlogPost = Omit<NewRow<"blog_posts">, "category_id"> & { category_slug: string };

const seo = (seo_title: string, seo_description: string): SeoFields => ({
  seo_title,
  seo_description,
  canonical_url: null,
  og_title: null,
  og_description: null,
  og_image: null,
  noindex: false,
});

/** words / 220, rounded up. */
function readingMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function post(
  p: Omit<SeedBlogPost, "reading_minutes" | "author" | "status" | "is_demo" | "featured_image" | keyof SeoFields> & {
    seo_title: string;
    seo_description: string;
  }
): SeedBlogPost {
  const { seo_title, seo_description, ...rest } = p;
  return {
    ...rest,
    featured_image: null,
    author: "VibeGen",
    status: "published",
    is_demo: false,
    reading_minutes: readingMinutes(p.content),
    ...seo(seo_title, seo_description),
  };
}

/* ------------------------------------------------------------------ */
/* Articles                                                             */
/* ------------------------------------------------------------------ */

const metaClicksNoLeads = `If your Meta ads are getting clicks but your inbox is empty, the ads are probably not the only problem. Clicks mean the ad did its first job: it stopped the scroll and earned some curiosity. What happens after the click is where most leads are lost.

This is one of the most common situations we see in audits. The good news is that it is usually fixable, and the fixes are rarely about "better targeting".

## Start by checking the tracking

Before changing anything, make sure the problem is real. A surprising number of accounts that "get no leads" are actually getting some leads that are not being recorded.

Check three things:

1. **Is the Meta Pixel firing on the thank-you page or form submission?** Submit a test lead and watch Events Manager.
2. **Is the right event marked as the conversion?** If the campaign is optimizing for "Lead" but the Pixel only sends "PageView", Meta has nothing useful to learn from.
3. **Do leads in your CRM or inbox line up with what Meta reports?** Some difference is normal. A total mismatch is not.

If tracking is broken, fix that first. Our [Analytics & Tracking service](/services/analytics) exists for exactly this reason. Everything else in this article assumes the data is roughly right.

## The click and the page are telling different stories

The most common cause of clicks without leads is poor message match. The ad promises one thing, and the landing page talks about something else, or about everything at once.

For example, an ad says "Free roof inspection this month" and sends people to a homepage with a slider, a company history and five service links. The visitor came for the free inspection. They cannot find it quickly, so they leave.

A good rule of thumb: someone who clicks your ad should see the same offer, in similar words, within the first screen of the page. If they have to hunt, many will not bother.

### Quick check

Put your ad and your landing page side by side. Ask:

- Does the headline repeat or clearly continue the ad's promise?
- Is the offer visible without scrolling on a phone?
- Is there one obvious next step?

If any answer is no, that is your first fix. We cover this in more detail in our guide to [message match on landing pages](/blog/message-match-landing-pages).

## The offer is too big a step for cold traffic

Meta is mostly interruption. People were watching videos or catching up with friends, not searching for your service. Asking a cold audience to "book a 60-minute consultation" is a big ask.

Consider whether a smaller first step would work better:

- A price guide or checklist
- A short quiz or calculator
- A free estimate that takes two minutes to request
- A short video walkthrough before a call

This does not mean giving everything away. It means matching the size of the ask to how warm the audience is. Retargeting audiences, who already know you, can handle the bigger ask.

## The form is doing too much

Every extra field costs you some completions. Sometimes that is worth it, because qualifying questions improve lead quality. But many forms ask for things nobody uses.

Look at your form and remove anything your sales process does not actually need at the first stage. Check it on a phone. Tiny fields, dropdowns that are hard to tap and unclear error messages lose more leads than most people realize.

## Meta is optimizing for the wrong thing

If your campaign objective is Traffic or Engagement, Meta will find people who click and engage. Those are often not the same people who fill in forms.

Where you have enough volume, optimize for leads or a lead-quality event. If you have very few conversions, you may need to optimize for a higher-volume event closer to the lead, such as a form start, while you build up data. That is a trade-off, not a rule, and it depends on budget.

## The audience is wrong, but not how you think

When people see clicks without leads, they often assume the targeting is off and start stacking interests. In practice, audience is less often the root cause than the page and offer. Broad audiences frequently perform well when the conversion signal is clean, because Meta can find converters on its own.

That said, some creative attracts the wrong crowd. An ad with a giveaway feel may pull in curious clickers with no intent. Look at which ads have high CTR but no conversions. Those are often the ones sending people who were never going to buy.

## What to do this week

1. Test your tracking with a real form submission.
2. Put each ad next to its landing page and check the message match.
3. Remove at least one unnecessary form field.
4. Check your campaign objective matches the outcome you want.
5. Pause ads with high CTR and no conversions after they have had fair spend.

None of these are clever tricks. They are the basics that most accounts skip. If you want a second pair of eyes on it, our [free growth audit](/free-growth-audit) looks at the ads, the page and the tracking together, because the problem is usually in the gaps between them.`;

const negativeKeywords = `Negative keywords are one of the least exciting parts of Google Ads and one of the most important. They stop your ads showing for searches you do not want to pay for. In most accounts we audit, there is money being spent on searches that were never going to become customers.

This guide walks through a practical negative keyword audit you can run yourself in an hour or two.

## Why negatives matter more than they used to

Google has loosened how match types work over the years. Phrase match and broad match now cover a wider range of "close variants" and related meanings than they once did. That can find useful new searches. It can also match your ads to things that are only loosely related.

The only way to see what is really happening is the **search terms report**. Keywords are what you bid on. Search terms are what people actually typed.

## Step 1: Pull the search terms report

In Google Ads, go to Insights and reports, then Search terms. Set the date range to the last 90 days, or longer for low-volume accounts. Add columns for cost, clicks, conversions and cost per conversion.

Sort by cost, highest first. You are looking for terms that have spent real money without converting, or that clearly do not match what you sell.

## Step 2: Sort terms into buckets

As you go through the list, most irrelevant searches fall into a few groups:

- **Wrong intent.** "How to", "DIY", "free", "template", "course", "salary".
- **Job seekers.** "Jobs", "careers", "hiring", "apprenticeship".
- **Wrong product or service.** Things you do not offer, even though they sound similar.
- **Wrong location.** Towns or regions you do not serve.
- **Competitors or brands** you do not want to bid on.
- **Wrong customer type.** For example, "residential" when you only do commercial work.

For example, a commercial cleaning company might find it is paying for "house cleaning near me", "cleaning jobs" and "how to clean office carpets". Each of those can be blocked.

## Step 3: Decide the right match type for each negative

Negative keywords have their own match types, and they behave differently from normal keywords. They do not include close variants the way positive keywords do.

- **Negative broad** blocks searches that contain all the words, in any order.
- **Negative phrase** blocks searches that contain the words in that exact order.
- **Negative exact** blocks only that exact search.

In practice:

1. Use negative broad for single words that are always irrelevant, like "jobs" or "free".
2. Use negative phrase when word order matters, like "how to install".
3. Use negative exact when you want to block one specific search without affecting longer, useful ones.

Be careful with singular and plural forms. Negatives may not catch every variation, so add both where it matters.

## Step 4: Build shared negative lists

Rather than adding negatives campaign by campaign, create shared lists in the Shared Library and apply them across campaigns:

- An account-wide list for things that are never relevant (jobs, free, DIY).
- A list of locations you do not serve.
- A competitor list, if you choose not to bid on competitors.

This keeps things tidy and means new campaigns start protected.

## Step 5: Stop campaigns competing with each other

Negatives are not only for blocking bad traffic. They also control which campaign or ad group handles a search.

If you have a campaign for "emergency plumber" and one for "plumber", the general campaign might pick up emergency searches with a less relevant ad. Adding "emergency" as a negative in the general campaign sends those searches to the right place, with the right ad and landing page.

## Step 6: Watch out for over-blocking

It is possible to go too far. A few warning signs:

- Impressions drop sharply after adding negatives.
- You have blocked a word that also appears in good searches. "Cheap" might be irrelevant for a luxury brand but important for a budget one.
- A negative in a shared list is quietly blocking a campaign it was never meant for.

After a big round of negatives, check impression and click volume over the next week or two.

## How often should you do this?

For most accounts, a weekly search term review is a good habit, even if it only takes 15 minutes. New accounts and accounts using broad match need it more often. Mature accounts with tight structure may need less.

It is also worth a deeper quarterly review. Search behavior shifts, new competitors appear, and your own services change.

## What a clean account looks like

A well-maintained account does not have zero wasted spend. Some exploration is healthy, because it is how you discover new converting searches. The goal is that most spend goes to searches that match what you sell, and that obvious waste gets caught quickly.

If you want help with this, our [Google Ads service](/services/google-ads) includes ongoing search term reviews and negative keyword management. Or start with a [free growth audit](/free-growth-audit) and we will show you where the waste is.`;

const messageMatch = `Message match is a simple idea: the landing page should continue the conversation the ad started. When it does, visitors feel they are in the right place. When it does not, they hesitate, and many leave.

It sounds obvious. Yet one of the most common problems in paid campaigns is sending every ad, for every audience and every offer, to the same page.

## The path every paid click follows

Every paid campaign has the same basic path:

1. **Ad.** Someone sees a promise and clicks.
2. **Landing page.** They decide within seconds whether this is what they expected.
3. **Conversion.** They take the next step, or they do not.

The landing page is the bridge. If it is weak, the ad is paying for visitors who never cross.

## Six things that need to match

When we review campaigns, we check six things between the ad and the page.

### 1. Intent

What did the visitor want when they clicked? Someone searching "emergency AC repair" wants help today. Someone clicking a Meta ad about "lower summer energy bills" is thinking about something else. The page should address the reason they came.

### 2. Offer

If the ad says "Free quote in 24 hours", the page should lead with a free quote in 24 hours. Not a different offer, not a generic contact form, not a list of services.

### 3. Message

Use the same language. If the ad talks about "cutting onboarding time", the headline should say something similar. Changing the words forces the visitor to translate, and many will not.

### 4. Audience

An ad aimed at small business owners should not land on a page written for enterprise buyers. If you run ads to different audiences, they may need different pages, or at least different headlines.

### 5. CTA

The main action on the page should be the natural next step after the ad. If the ad says "Book a demo", do not make "Start free trial" the biggest button.

### 6. Tracking

This one is easy to forget. The page must record the conversion and send it back to the ad platform. Without that, you cannot tell which ads and pages work together.

## What good message match looks like

Here is a hypothetical example for a bookkeeping firm.

> Ad: "Behind on your books? Get caught up before tax season. Fixed-price catch-up bookkeeping for small businesses."

A weak landing page opens with "Welcome to Smith & Co Accounting, serving the community since 2004" and a menu of eight services.

A strong landing page opens with "Catch-up bookkeeping at a fixed price, done before tax deadlines", a short line on who it is for, a clear "Get your fixed quote" button, and a few real client reviews.

Same business, same traffic. The second page is far more likely to convert because the visitor instantly sees the thing they clicked for.

## Common mismatches we see

- **Everything goes to the homepage.** Homepages are built for many audiences, so they rarely match any specific ad well.
- **The offer disappears.** The ad mentions a discount or free consultation, but the page does not.
- **The tone changes.** A casual, friendly ad leads to a formal, corporate page.
- **The page is desktop-first.** Most social ad traffic is on mobile. If the offer and CTA are below several screens of content on a phone, they may as well not exist.
- **Proof is missing.** The ad makes a claim, and the page gives no reason to believe it.

## How to fix it without building 50 pages

You do not need a unique page for every ad. Start by grouping ads by offer and audience. Most accounts only need a handful of pages:

- One per main offer (for example, "free inspection" and "replacement quote").
- One per clearly different audience, if the pitch genuinely changes.
- Dynamic headlines, where your page tool supports them, to echo the search term or ad angle.

Then check each page against the six points above.

## A quick self-audit

Open your top-spending ad and its landing page on your phone. Give yourself five seconds on the page. Can you answer these?

- Is this what the ad promised?
- Who is it for?
- What do I do next?

If not, that page is probably costing you leads.

## Where this fits

Message match is one of the first things we look at because it affects everything downstream. Better match usually improves conversion rate, and on Google it can also help ad relevance. Our [Landing Pages service](/services/landing-pages) is built around it, and our [CRO work](/services/cro) often starts there too.

If you are not sure how your ads and pages line up, a [free growth audit](/free-growth-audit) will show you where the gaps are.`;

const croLowTraffic = `A/B testing gets a lot of attention in conversion rate optimization. Change a headline, split the traffic, pick the winner. It sounds simple and scientific.

The problem is that many businesses do not have enough traffic or conversions for A/B tests to tell them anything reliable. That does not mean CRO is off the table. It means doing it differently.

## Why A/B tests need volume

An A/B test compares two versions of a page. To say with any confidence that one is better, you need enough visitors and enough conversions in each version that the difference is unlikely to be random.

Think of it like flipping a coin. Flip it ten times and you might get seven heads. That does not mean the coin is biased. Flip it a thousand times and a big imbalance starts to mean something.

For a landing page that gets, for example, 1,500 visitors and 30 leads a month, a test looking for a modest improvement could need many months to reach a clear answer. In that time your offer, seasonality, ad targeting and competitors will all have changed. The test result becomes hard to trust.

Online sample size calculators can show you roughly how much traffic you would need for your own numbers. It is worth checking before you start a test.

## What goes wrong when you test anyway

When low-traffic sites run A/B tests, a few things tend to happen:

- **Tests get stopped early** when one version looks ahead. Early leads often disappear with more data.
- **False winners get rolled out.** A change that did nothing, or even hurt, gets declared a success.
- **Time is wasted.** Months of waiting for a test to finish could have been spent on changes more likely to help.

This is why we do not promise a fixed number of tests each month. Testing only makes sense when the numbers support it.

## Research-led CRO: what to do instead

For lower-traffic sites, the approach shifts from "test everything" to "research first, then make confident changes". Here is how that works.

### 1. Look at where people drop off

Even with modest traffic, GA4 can show you where visitors leave. Which pages have high exit rates? Where do form starts not turn into submissions? Which traffic sources convert poorly?

### 2. Watch what people actually do

Heatmaps and session recordings, from tools like Microsoft Clarity or Hotjar, show how people behave on the page. You do not need huge numbers to spot patterns. Twenty recordings of people abandoning a form can reveal the same confusing field again and again.

### 3. Ask people

Short on-page surveys ("What stopped you from booking today?") and conversations with your sales team are valuable. Your team hears objections every day. Those objections should shape the page.

### 4. Fix the obvious problems first

Research usually turns up issues that do not need a test to justify fixing:

- The offer is unclear or buried.
- The page does not match the ad.
- The form asks for too much.
- There is no proof, or the proof is weak.
- The page is slow or broken on mobile.
- The next step is confusing.

These are not opinions about button colors. They are clear friction points. Fixing them is low-risk.

### 5. Make bigger changes, not tiny ones

With limited traffic, small tweaks will not produce a visible difference. Focus on changes that could plausibly have a big effect: a clearer offer, a restructured page, a shorter form, a different first step.

## How to measure without a formal test

When you cannot run an A/B test, you can still measure. It just needs more care.

- **Compare before and after** over similar time periods, with the same traffic sources and budget.
- **Watch for outside factors** such as seasonality, promotions and ad changes that happened at the same time.
- **Look at the funnel, not just the final number.** If form starts rise and completions rise with them, that is a more convincing signal.
- **Be honest about uncertainty.** A before-and-after comparison is weaker evidence than a controlled test. Treat results as directional.

## When testing does make sense

A/B testing becomes worthwhile when you have steady traffic and enough conversions per week that a test can finish in a reasonable time. Higher-traffic pages, like e-commerce product pages or a main lead gen page with significant ad spend, are the natural place to start.

Even then, research comes first. The best tests are built on evidence about what is going wrong, not on guesses.

## The bottom line

CRO is not about running as many tests as possible. It is about understanding why visitors do not convert and fixing those reasons. For low-traffic sites, research-led changes are often the most sensible option.

Our [CRO service](/services/cro) is built this way: research first, testing where traffic allows. If you want to know which approach fits your site, start with a [free growth audit](/free-growth-audit).`;

const ga4Checklist = `If you run paid ads, your conversion tracking is doing two jobs. It tells you what is working, and it tells Google and Meta who to find more of. When it is wrong, both jobs fail quietly.

This checklist covers the setup we look for when auditing GA4 and Google Tag Manager. It is written for business owners and marketers, not developers, so you can check the basics yourself.

## Before you start

Make sure you have access to:

- Your GA4 property (Editor or Administrator)
- Your GTM container (Publish access)
- Google Ads and Meta Events Manager, if you run ads there
- A test device and the ability to submit a real form

The single most useful tool is GTM's **Preview mode**, which shows you exactly which tags fire on each page and action.

## Part 1: Foundations

1. **One GA4 tag, installed once.** Check the site is not loading GA4 twice, for example directly in the site code and again through GTM. Duplicate tags lead to doubled page views and events.
2. **GTM is on every page.** Including landing pages built on separate tools, thank-you pages and booking pages.
3. **Internal traffic is filtered.** Your own team's visits should not count as leads or sessions.
4. **Cross-domain tracking is set up** if users move between domains, such as your site and a booking or checkout tool.
5. **Consent is handled.** If you have visitors from the UK or EU, your consent tool and Google Consent Mode should be configured. Confirm your specific obligations with a legal advisor.

## Part 2: Conversion events

This is where most problems live.

1. **List the actions that matter.** Typically: form submissions, calls, bookings, purchases. Write them down before building anything.
2. **Track the real action, not a page view.** A "thank-you page view" can work, but it can also be triggered by people refreshing, bookmarking or landing on it directly. A form submission event that fires on successful submit is usually more reliable.
3. **Use clear, consistent names.** For example, generate_lead for forms, book_call for bookings. Avoid a mix of "Lead", "lead_form", "Submit" and "FormSubmit".
4. **Mark only the right events as key events.** In GA4, key events are what you treat as conversions. Scrolls and clicks on the logo are not conversions.
5. **Test every form.** Submit each one and confirm the event appears in GTM Preview and in GA4's DebugView.

### Common problems

- Form events firing on button click, even when the form fails validation.
- Events firing twice because both a GTM tag and a plugin send them.
- Embedded forms, like HubSpot or Calendly, that need their own listeners.
- Conversions that stopped firing after a website update and nobody noticed.

## Part 3: Google Ads conversion tracking

1. **Decide the source.** You can import GA4 key events into Google Ads, or use the Google Ads conversion tag in GTM. Either can work. Be careful not to use both for the same action, or you may count conversions twice.
2. **Set the conversion linker tag** in GTM so click IDs are stored properly.
3. **Choose which conversions are primary.** Only primary conversions are used for bidding. If page views or micro-actions are primary, automated bidding will chase them.
4. **Set sensible values** if you use value-based bidding. Even rough values per lead type are better than none, if they reflect reality.
5. **Enable enhanced conversions** where appropriate, to improve matching.

## Part 4: Meta Pixel

1. **Pixel installed once**, through GTM or a platform integration, not both.
2. **Standard events used** for key actions, such as Lead, Schedule or Purchase.
3. **Events fire on the real action**, the same principle as GA4.
4. **Conversions API considered** if browser tracking is missing events. See our guide on [the Meta Conversions API](/blog/meta-conversions-api-explained).
5. **Deduplication set up** if you send the same event from both the Pixel and the Conversions API.

## Part 5: Source tracking

1. **Consistent UTM parameters** on all paid links. Our [UTM naming guide](/blog/utm-naming-conventions) covers this.
2. **Auto-tagging on** in Google Ads.
3. **Lead source captured with each lead**, for example through hidden form fields, so your CRM knows where each lead came from.

## Part 6: Ongoing checks

Tracking is not a one-time job. Things break when websites change, plugins update or forms are replaced.

- Check conversion counts weekly against real leads.
- Re-test key forms after any site change.
- Watch for sudden drops or spikes, which usually mean tracking changed, not performance.

## If something is broken

Fix tracking before making big budget decisions. If platforms have been learning from bad data, expect some adjustment after the fix. Reported conversions may even fall, because inflated numbers are removed. That is a more accurate picture, not a worse one.

This is the core of our [Analytics & Tracking service](/services/analytics). If you would like us to check your setup, request a [free growth audit](/free-growth-audit).`;

const utmNaming = `UTM parameters are the small tags added to the end of a link that tell your analytics where a visitor came from. They are simple. They are also one of the first things to fall apart when several people, tools and agencies touch the same account.

When UTMs are inconsistent, GA4 splits the same traffic into several rows and your reports stop making sense. This guide gives you a naming convention you can adopt today.

## The five UTM parameters

- **utm_source**: where the traffic comes from. For example, google, facebook, newsletter.
- **utm_medium**: the type of traffic. For example, cpc, paid_social, email.
- **utm_campaign**: the campaign name.
- **utm_content**: which ad or link variation. Useful for comparing ads.
- **utm_term**: the keyword, mostly used for paid search.

Source, medium and campaign are the ones that matter most. Content and term add detail.

## Why consistency matters

GA4 treats every variation as a separate value. "Facebook", "facebook" and "fb" are three different sources. "cpc", "CPC" and "paid" are three different mediums.

GA4 also uses source and medium to decide which channel a visit belongs to, such as Paid Search, Paid Social or Email. If the medium is not something GA4 recognizes, traffic can end up in "Unassigned" and disappear from your channel reports.

## A simple convention

Here is a convention that works for most businesses. Adjust it to fit, but write it down and stick to it.

### Rules for every parameter

1. **All lowercase.** Always.
2. **No spaces.** Use underscores or hyphens, and pick one.
3. **No special characters.** Letters, numbers, underscores and hyphens only.
4. **Short but clear.** Someone else should understand it without asking you.

### Source

Use the platform name:

- google
- facebook
- instagram
- linkedin
- newsletter

For Meta ads, some teams use "facebook" or "meta" for all placements. That is fine, as long as everyone uses the same one.

### Medium

Use a small, fixed list that GA4 recognizes:

- cpc for paid search
- paid_social for paid social ads
- email for email
- referral for partner links
- organic_social for unpaid social posts

### Campaign

This is where most mess happens. A useful structure is:

**objective_audience_offer_date**

For example:

- leads_homeowners_freeinspection_2026-04
- demo_saas-ops_calculator_2026-q2
- sales_retargeting_springsale_2026-05

This lets you filter and group campaigns in reports. You can see all lead campaigns, all retargeting campaigns, or all campaigns for one offer.

### Content

Use it to identify the ad or creative:

- video_testimonial_v1
- static_beforeafter_v2
- carousel_services

When you compare ads in GA4, this is how you tell them apart.

## Google Ads and auto-tagging

For Google Ads, turn on auto-tagging. It adds a click ID that GA4 uses to pull in detailed campaign data automatically. In most cases you do not need manual UTMs on Google Ads as well. If you do add them, make sure they do not conflict with auto-tagging.

## Meta and dynamic parameters

Meta supports dynamic URL parameters, which fill in names automatically. For example, you can set utm_campaign to the campaign name and utm_content to the ad name. That saves time, but it means your Meta campaign and ad names need to follow the convention too. Messy names in Meta become messy UTMs in GA4.

## Keep a shared UTM sheet

The easiest way to stay consistent is a simple spreadsheet:

- A tab listing the allowed sources and mediums.
- A tab where every tagged link is logged with its parameters.
- A link builder formula, so nobody types parameters by hand.

Everyone who creates links, including freelancers and agencies, should use the same sheet.

## Common mistakes

- Tagging internal links on your own website. This overwrites the original source and breaks attribution.
- Using different spellings for the same thing across campaigns.
- Putting spaces or capital letters in parameters.
- Forgetting to tag email and partner links, so they show up as direct traffic.
- Changing the convention halfway through a quarter without noting it.

## Capturing UTMs with your leads

UTMs in GA4 are useful. UTMs stored with each lead in your CRM are more useful. When a lead fills in a form, hidden fields can capture the source, medium and campaign. Later, when that lead becomes a customer, you can trace revenue back to the campaign that produced it.

That is how you move from "this campaign got clicks" to "this campaign produced customers". It is part of how we set up tracking in our [Analytics & Tracking service](/services/analytics).

## Start small

If your current UTMs are a mess, you do not need to fix history. Agree a convention, apply it to all new links from today, and clean up the most important active campaigns first. Within a month or two, your reports will be much easier to read.

If you want a hand setting up source tracking properly, a [free growth audit](/free-growth-audit) is a good place to start.`;

const googleAdsBudget = `"How much should I spend on Google Ads?" is one of the first questions business owners ask. The honest answer is that it depends. But it depends on a few specific numbers you can work out, not on guesswork.

This guide shows how to think about a starting budget so your first months produce useful data rather than a vague sense that "Google didn't work".

## Start with what a customer is worth

Before looking at click costs, work out roughly what a new customer is worth to you. For a simple estimate:

- **Average first sale value**, or average job value.
- **Gross margin** on that sale.
- **Repeat or lifetime value**, if customers come back.

This tells you how much you can afford to pay to acquire a customer (your target CAC) and still make money. Without this number, you cannot judge whether any cost per lead is good or bad.

## Then estimate the funnel

Next, estimate how clicks turn into customers. For example, with hypothetical numbers:

1. Average cost per click: $6
2. Landing page conversion rate: 5%
3. Lead to customer rate: 20%

From that:

- Cost per lead is roughly $6 / 0.05 = $120
- Cost per customer is roughly $120 / 0.20 = $600

If a customer is worth $3,000 in gross profit, that could be very healthy. If a customer is worth $400, it is not, and you need to change something before spending more.

You can get realistic CPC estimates from Google's Keyword Planner. Conversion rates are harder to predict before launch. Use your current website conversion rate, if you know it, and be conservative.

## The data problem with small budgets

The biggest risk with a very small budget is not losing money. It is learning nothing.

If you spend a small amount and get a handful of clicks a day, it could take months to see enough conversions to know which keywords and ads work. Automated bidding strategies also need conversion data to perform well. Too little data and they struggle.

A useful rule of thumb: your main campaign should get enough budget for a meaningful number of clicks per day, and ideally enough conversions per month for patterns to emerge. The exact figure depends on your CPC. In a market where clicks cost $2, a modest budget goes a long way. Where clicks cost $30, the same budget buys very little.

## Focus the budget, do not spread it

If budget is limited, concentrate it:

- **Start with your highest-intent keywords.** Searches like "roof repair near me" or "payroll software pricing" are more likely to convert than broad research terms.
- **Limit the number of campaigns.** One or two well-funded campaigns beat six underfunded ones.
- **Limit locations** to where your best customers are.
- **Use ad scheduling** if leads only matter during business hours, for example if you need to answer calls.

It is better to dominate a narrow set of valuable searches than to appear occasionally across a wide set.

## Budget for learning, then for scaling

Think of your first two or three months in two phases.

### Phase 1: learning

The goal is data. Which search terms convert? What does a lead really cost? Which landing pages work? Expect some wasted spend as you find out. Negative keywords and search term reviews are essential here. Our [negative keyword audit guide](/blog/google-ads-negative-keywords-audit) covers how.

### Phase 2: scaling what works

Once you know your real cost per lead and lead quality, you can increase budget on what works. Increase in steps and watch whether cost per lead holds. It often rises as you scale into less targeted searches.

## Do not forget the rest of the funnel

A budget question is often a funnel question in disguise. If your landing page converts poorly, more budget just buys more expensive failures. If leads are not followed up quickly, the best campaigns cannot save them.

Before increasing spend, check:

- Is conversion tracking set up and accurate?
- Does each ad group go to a relevant landing page?
- Is someone following up with leads quickly?

## What about management fees?

If you work with an agency, fees should be proportionate to spend. When ad spend is very low, management fees can become a large share of the total. That is one reason our [pricing](/pricing) starts with plans suited to businesses spending around $2,500 a month or more on ads.

## A simple way to set your first budget

1. Estimate what a customer is worth.
2. Estimate CPC, conversion rate and close rate.
3. Work out your likely cost per customer.
4. Set a budget that gets your main campaign enough daily clicks to learn.
5. Commit to a learning period before judging results.

If the numbers look tight, that is useful information too. It may mean improving the offer or landing page first. We can help you work through this in a [free growth audit](/free-growth-audit), or see how we run [Google Ads campaigns](/services/google-ads).`;

const retargeting = `Retargeting shows ads to people who have already visited your website or engaged with your content. Done well, it is a helpful reminder to someone who was interested. Done badly, it follows people around the internet with the same ad for weeks and takes credit for sales that would have happened anyway.

Here is how to get the useful part without the waste.

## Why retargeting can look better than it is

Retargeting audiences are warm. They already know you. Many were going to come back anyway. So retargeting campaigns often report low CPA and high ROAS.

Some of that is real. Some is the ad platform claiming credit for a conversion the ad did not cause. If someone visits your site, sees a retargeting ad, then searches your brand name and buys, both Meta and Google may count that sale.

This does not mean retargeting is useless. It means you should not judge it on platform-reported ROAS alone, and you should not put the majority of your budget into it just because the numbers look good.

## Set sensible frequency

Frequency is how many times, on average, each person sees your ads. With small retargeting audiences, frequency climbs fast. Someone who sees the same ad 15 times in a week is not being persuaded. They are being annoyed.

Practical steps:

- Watch frequency weekly in Meta Ads Manager.
- Rotate ads so the same person does not see the same creative repeatedly.
- If frequency is high and results are falling, reduce budget or widen the audience.

## Segment by how recently and how deeply people engaged

Not all visitors are equal. Someone who read one blog post six weeks ago is different from someone who started your booking form yesterday.

A simple structure:

1. **Hot**: visited a pricing, booking or checkout page in the last 7 days.
2. **Warm**: visited key service or product pages in the last 30 days.
3. **Cool**: engaged with videos or social content, or visited any page, in the last 60–90 days.

Each group can get a different message and a different budget. Hot audiences might get a direct offer. Cool audiences might get proof or education.

## Exclude people who already converted

This is the most common waste we see. If someone has already booked a call or bought, showing them "Book your free consultation" again wastes money and looks careless.

Exclude recent converters from retargeting. For e-commerce, you might retarget past buyers with different products or a repeat purchase offer, but in a separate campaign with its own purpose.

## Say something new

The same ad that did not convert someone the first time is unlikely to convert them the fifth time. Retargeting works better when it answers the question the visitor still had.

Ideas, using assets you already have:

- A customer testimonial or review.
- An answer to a common objection, such as price or timing.
- A short explainer of how the process works.
- A reminder of a specific offer and its deadline, if the deadline is real.

Do not invent urgency. Fake countdowns and "only 2 left" messages damage trust.

## Keep it respectful

Retargeting can feel intrusive, especially for sensitive categories. A few principles:

- Do not reference personal circumstances in the ad ("Still worried about your debt?").
- Keep windows reasonable. Following people for six months rarely helps.
- Respect consent. If visitors in the UK or EU decline marketing cookies, they should not be added to retargeting audiences.

Ad platforms also have their own rules on sensitive targeting, so check them for your category.

## How much budget should go to retargeting?

There is no fixed percentage. It depends on how much traffic your prospecting brings in. Retargeting audiences are only as big as the traffic that feeds them.

A useful check: if retargeting spend is growing but new visitor traffic is not, you are spending more to reach the same small group of people. That is usually a sign to shift budget back toward prospecting.

## Measuring whether it works

Because platform numbers can overstate retargeting, look for other signals:

- Does overall conversion volume change when retargeting is paused or reduced?
- Are retargeting conversions mostly from people who would likely return anyway, such as brand searchers?
- Is blended cost per acquisition across all channels improving?

Where you have enough volume, Meta and Google offer lift tests that compare people who saw ads with people who did not. These give a more honest view.

## Getting it right

Good retargeting is a small, well-managed part of a larger system. It follows up with interested people, says something useful, and stops when the job is done.

If you want your prospecting and retargeting working together, see our [Meta Ads service](/services/meta-ads). Or request a [free growth audit](/free-growth-audit) and we will review how your retargeting is set up.`;

const leadQuality = `Cost per lead is easy to measure and easy to celebrate. It is also one of the most misleading numbers in paid advertising if you look at it on its own.

A campaign with a $40 CPL can be worse for your business than one with a $120 CPL. It depends entirely on what happens to those leads next.

## Why CPL is so tempting

CPL is available right away. It is in every ad platform dashboard, it goes down when things "improve", and it is easy to compare month to month. Sales outcomes take longer to see and are often stored somewhere else, like a CRM or a spreadsheet.

So campaigns get judged on CPL, and optimized for it. And ad platforms are very good at finding cheap leads, if that is what you ask for.

## How cheap leads happen

When a campaign is told to maximize leads, the platform looks for people who fill in forms. Some of those people are genuine buyers. Others:

- Fill in forms out of curiosity.
- Want free advice with no intention of paying.
- Are outside your service area or target market.
- Mistype their details, or enter fake ones.
- Are competitors or job seekers.

If the form is very easy, the offer is very broad, and nothing tells the platform which leads were good, the algorithm will happily find more of all of them.

## A better way to measure

Instead of stopping at CPL, follow leads further down the funnel. For example, with hypothetical numbers:

- **Campaign A:** $40 CPL. 10% of leads become qualified. Cost per qualified lead: $400.
- **Campaign B:** $120 CPL. 50% of leads become qualified. Cost per qualified lead: $240.

Campaign B looks worse on CPL and is clearly better for the business. It also saves your sales team hours of calls with poor-fit prospects.

Useful metrics to add:

1. **Cost per qualified lead**: based on your own definition of qualified.
2. **Cost per opportunity or proposal**.
3. **Cost per customer (CAC)**.
4. **Revenue or pipeline per campaign**, where you can track it.

## Define what "qualified" means

This sounds obvious, but many teams have never written it down. Agree simple criteria with sales, for example:

- In the target location or market.
- Budget or company size above a certain level.
- A genuine need for the service within a reasonable timeframe.
- Real, reachable contact details.

Then make sure someone marks leads against these criteria consistently, whether in a CRM or a shared sheet.

## How to improve lead quality

### Adjust the page and form

A little friction can be healthy. Consider:

- Adding one or two qualifying questions, such as budget range or timeline.
- Being clearer about who you work with, and who you do not.
- Giving a price signal, like "Projects typically start from...", so poor-fit prospects self-select out.

This usually raises CPL a little. That is often a good trade.

### Target by intent

On Google, focus on searches that show buying intent rather than research. On Meta, make sure the offer and message speak to the people you want, not everyone.

### Feed outcomes back to the platforms

This is the most powerful step. When you send qualified leads or closed deals back to Google Ads and Meta as offline conversions, the platforms can learn what a good lead looks like, not just any lead. It needs lead source data captured at the form and a CRM that can send updates. Our [Analytics & Tracking service](/services/analytics) covers this where technically feasible.

### Follow up faster

Lead quality is not only about the lead. A good lead contacted three days late can look like a bad one. Check how quickly your team responds before blaming the campaign.

## Talk to your sales team

The people who call leads know more about lead quality than any dashboard. Ask them regularly:

- Which leads were a waste of time, and why?
- What questions do good prospects ask?
- Are there patterns, such as specific locations, job titles or offers?

Their answers should shape targeting, messaging and forms.

## Different industries, different balance

For a local service business, lead volume often matters because each job is modest in value and close rates are decent. For [professional services](/industries/professional-services) or B2B, a single good client can be worth a lot, so quality usually matters more than volume. There is no universal rule, only the economics of your business.

## The takeaway

Do not throw out CPL. It is still a useful early signal. Just never judge a campaign on it alone. Follow leads to qualification, and ideally to revenue.

If you are not sure how your campaigns are performing beyond CPL, a [free growth audit](/free-growth-audit) is a good place to start.`;

const metaCapi = `If you run Meta ads, you may have heard that you "need the Conversions API". It is often explained in technical terms that make it hard to know whether it matters for your business. Here is a plain-English version.

## The problem it solves

The Meta Pixel is a piece of code on your website. When someone takes an action, like submitting a form or buying something, the Pixel runs in their browser and tells Meta.

That worked well for years. It now misses more events than it used to, because:

- Some browsers restrict tracking by default.
- Ad blockers stop the Pixel from loading.
- Privacy settings on some devices limit what can be tracked.
- Slow pages or quick exits mean the Pixel does not always fire in time.

When events go missing, two things happen. Your reports under-count results, and Meta has less data to learn from when finding new people who are likely to convert.

## What the Conversions API does

The Conversions API (often shortened to CAPI) sends the same conversion information to Meta from a server instead of from the visitor's browser. Your website, platform or tracking server tells Meta directly: "a lead happened, here are the details".

Because it does not rely on the browser, it is not affected by ad blockers or browser restrictions in the same way. That usually means more complete data.

It is not a replacement for the Pixel. Most setups use both. The Pixel sends what it can from the browser, and the Conversions API fills in the gaps from the server.

## Deduplication: the part people get wrong

If both the Pixel and the Conversions API send the same event, Meta could count it twice. To prevent that, each event needs a shared **event ID**. When Meta receives the same event with the same ID from both sources, it keeps one.

If deduplication is not set up properly, you may see conversion numbers jump after installing CAPI. That is not a sudden improvement. It is double-counting. It is worth checking Events Manager after setup to confirm events are being deduplicated.

## Customer information and matching

For Meta to connect a conversion to the person who saw an ad, it needs some way to match them. The Conversions API can send customer information, such as an email address or phone number, in a hashed form. Hashing scrambles the data so it is not sent in plain text.

Better matching usually means better optimization. But you should only send what you have a lawful basis to share, and your privacy policy should reflect it. If you have UK or EU visitors, confirm your consent setup and obligations with your legal advisor.

## How it gets set up

There are a few common routes, from simplest to most flexible:

1. **Platform integrations.** Shopify, WooCommerce, and some other platforms offer built-in or plugin-based Conversions API connections. These are often the easiest option.
2. **Partner tools.** Some CRMs and form tools can send events to Meta directly.
3. **Server-side Google Tag Manager.** A server container receives events from your site and forwards them to Meta, Google and others. More setup, more control.
4. **Custom development.** Your developers send events from your own systems. Useful for complex cases, such as sending CRM stage changes.

The right choice depends on your website platform, your budget and what events you need to send.

## Sending more than website events

One of the more useful features is that the Conversions API can send events that do not happen on your website at all. For example:

- A lead becoming qualified in your CRM.
- A booked call that actually took place.
- A sale closed over the phone.

Sending these back helps Meta learn which leads turn into real business, not just which people fill in forms. We covered why that matters in our article on [lead quality vs CPL](/blog/lead-quality-vs-cpl).

## Do you need it?

The Conversions API is most worthwhile when:

- You spend meaningfully on Meta and rely on it for leads or sales.
- You suspect the Pixel is missing conversions, for example if Meta reports far fewer leads than you actually receive.
- You want to send offline or CRM events back to Meta.

It matters less if your Meta spend is small or experimental. In that case, getting the basic Pixel and conversion events right is the first priority.

## What it will not do

The Conversions API does not fix a weak offer, a poor landing page or a broken form. It does not guarantee better results. It gives Meta more complete information, which can help optimization and reporting, but it works alongside good campaigns rather than instead of them.

## Next steps

If you are not sure whether your Pixel is working properly, start there. Check Events Manager for your key events and compare the numbers with the leads you actually received. Our [GA4 and GTM tracking checklist](/blog/ga4-gtm-conversion-tracking-checklist) covers the basics.

We set up the Conversions API, where appropriate, as part of our [Analytics & Tracking service](/services/analytics). If you want to know whether it makes sense for you, a [free growth audit](/free-growth-audit) will tell you.`;

export const defaultBlogPosts: SeedBlogPost[] = [
  post({
    title: "Why Your Meta Ads Get Clicks but No Leads",
    slug: "meta-ads-clicks-but-no-leads",
    excerpt:
      "Clicks mean the ad worked. Missing leads usually mean something after the click is broken: tracking, message match, the offer or the form.",
    content: metaClicksNoLeads,
    category_slug: "meta-ads",
    tags: ["Meta Ads", "Lead generation", "Landing pages"],
    published_at: "2026-03-02T09:00:00.000Z",
    seo_title: "Why Your Meta Ads Get Clicks but No Leads | VibeGen",
    seo_description:
      "Getting Facebook and Instagram clicks but no leads? Check tracking, message match, your offer, your form and your campaign objective.",
  }),
  post({
    title: "How to Run a Negative Keyword Audit in Google Ads",
    slug: "google-ads-negative-keywords-audit",
    excerpt:
      "A practical, step-by-step way to find the searches wasting your Google Ads budget and block them without cutting off good traffic.",
    content: negativeKeywords,
    category_slug: "google-ads",
    tags: ["Google Ads", "Negative keywords", "Search terms"],
    published_at: "2026-03-23T09:00:00.000Z",
    seo_title: "Google Ads Negative Keyword Audit: A Practical Guide | VibeGen",
    seo_description:
      "Find and block wasted Google Ads spend with a search terms review, the right negative match types and shared negative lists.",
  }),
  post({
    title: "Message Match: Why Your Landing Page Should Finish What the Ad Started",
    slug: "message-match-landing-pages",
    excerpt:
      "Intent, offer, message, audience, CTA and tracking. Six things that need to line up between your ad and your landing page.",
    content: messageMatch,
    category_slug: "landing-pages",
    tags: ["Landing pages", "Message match", "CRO"],
    published_at: "2026-04-13T09:00:00.000Z",
    seo_title: "Message Match on Landing Pages: A Practical Guide | VibeGen",
    seo_description:
      "Why sending every ad to your homepage costs you leads, and how to match intent, offer, message, audience, CTA and tracking.",
  }),
  post({
    title: "CRO for Low-Traffic Sites: Why A/B Tests Aren't Always the Answer",
    slug: "cro-for-low-traffic-sites",
    excerpt:
      "Many sites don't have the traffic for reliable A/B tests. Here's how to improve conversion rate with research-led changes instead.",
    content: croLowTraffic,
    category_slug: "cro",
    tags: ["CRO", "A/B testing", "Research"],
    published_at: "2026-05-04T09:00:00.000Z",
    seo_title: "CRO for Low-Traffic Websites | VibeGen",
    seo_description:
      "Why A/B testing needs traffic and conversion volume, and how research-led CRO improves low-traffic sites without unreliable tests.",
  }),
  post({
    title: "The GA4 + GTM Conversion Tracking Checklist",
    slug: "ga4-gtm-conversion-tracking-checklist",
    excerpt:
      "A plain-English checklist for GA4, Google Tag Manager, Google Ads and Meta Pixel tracking, so your ad platforms learn from the right data.",
    content: ga4Checklist,
    category_slug: "analytics-tracking",
    tags: ["GA4", "Google Tag Manager", "Conversion tracking", "Meta Pixel"],
    published_at: "2026-05-26T09:00:00.000Z",
    seo_title: "GA4 & GTM Conversion Tracking Checklist | VibeGen",
    seo_description:
      "Check your GA4, GTM, Google Ads and Meta Pixel setup with this practical conversion tracking checklist for business owners and marketers.",
  }),
  post({
    title: "UTM Naming Conventions That Keep Your Reports Clean",
    slug: "utm-naming-conventions",
    excerpt:
      "Inconsistent UTMs split your traffic into dozens of rows. Here's a simple naming convention for source, medium, campaign and content.",
    content: utmNaming,
    category_slug: "analytics-tracking",
    tags: ["UTM tracking", "GA4", "Attribution"],
    published_at: "2026-06-16T09:00:00.000Z",
    seo_title: "UTM Naming Conventions: A Simple Guide | VibeGen",
    seo_description:
      "A practical UTM naming convention for source, medium, campaign and content, plus how to capture UTMs with your leads.",
  }),
  post({
    title: "How Much Should You Spend on Google Ads When You're Starting Out?",
    slug: "google-ads-starting-budget",
    excerpt:
      "Your starting budget should be based on customer value, click costs and how much data you need, not a round number that feels safe.",
    content: googleAdsBudget,
    category_slug: "paid-acquisition",
    tags: ["Google Ads", "Budget", "Paid acquisition"],
    published_at: "2026-07-07T09:00:00.000Z",
    seo_title: "How Much to Spend on Google Ads When Starting Out | VibeGen",
    seo_description:
      "Work out a starting Google Ads budget from customer value, CPC, conversion rate and the data you need to learn what works.",
  }),
  post({
    title: "Retargeting That Isn't Creepy or Wasteful",
    slug: "retargeting-without-waste",
    excerpt:
      "Retargeting can be a helpful reminder or an expensive way to annoy people who were going to buy anyway. Here's how to get it right.",
    content: retargeting,
    category_slug: "meta-ads",
    tags: ["Retargeting", "Meta Ads", "Frequency"],
    published_at: "2026-07-28T09:00:00.000Z",
    seo_title: "Retargeting Without the Waste | VibeGen",
    seo_description:
      "Set sensible frequency, segment by engagement, exclude converters and say something new, so retargeting helps instead of annoying.",
  }),
  post({
    title: "Lead Quality vs CPL: Why the Cheapest Leads Can Cost You the Most",
    slug: "lead-quality-vs-cpl",
    excerpt:
      "A low cost per lead means little if most leads never become customers. Here's how to measure and improve lead quality.",
    content: leadQuality,
    category_slug: "paid-acquisition",
    tags: ["Lead quality", "CPL", "Offline conversions"],
    published_at: "2026-08-18T09:00:00.000Z",
    seo_title: "Lead Quality vs Cost Per Lead | VibeGen",
    seo_description:
      "Why CPL alone is misleading, how to measure cost per qualified lead, and practical ways to improve lead quality from paid ads.",
  }),
  post({
    title: "The Meta Conversions API, Explained for Non-Developers",
    slug: "meta-conversions-api-explained",
    excerpt:
      "What the Conversions API does, why the Pixel alone misses events, and how to tell whether your business needs it.",
    content: metaCapi,
    category_slug: "analytics-tracking",
    tags: ["Meta Ads", "Conversions API", "Tracking"],
    published_at: "2026-09-15T09:00:00.000Z",
    seo_title: "Meta Conversions API Explained (Plain English) | VibeGen",
    seo_description:
      "A plain-English guide to the Meta Conversions API: what it does, deduplication, setup options and whether your business needs it.",
  }),
];
