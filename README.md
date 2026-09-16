# Measured Website

This is the public static website for Measured. It is deployed from the root of the public `Mickyjim/measured-website` repository on GitHub Pages at https://mickyjim.github.io/measured-website/. Existing support, privacy, and article URLs remain at their original paths. The private app/backend source remains in its separate repository.

## Preview

From this repository root, run:

```sh
python3 -m http.server 8124 --bind 127.0.0.1
```

Then open http://127.0.0.1:8124/. There is no build step and no paid dependency.

## Deploy

Review the files locally. When you explicitly decide to publish, confirm in GitHub **Settings → Pages** that the source is `main` at `/ (root)`, then commit the approved website changes in this public repository and push `main` to `origin`. The live site currently resolves at the repository Pages URL, and `.nojekyll` is retained; the private Pages settings were not available during the pre-launch audit. Check the live homepage, five guide URLs, and existing `/privacy.html` and `/support.html` after Pages updates. The app repository is separate and should not be deployed for this site.

## Acquisition experiment

The homepage tests the question “What should I reply to this?” It contains a browser-only deterministic demo. The reply samples are fixed, educational examples and do not process the real context as live AI. The message text is never included in analytics, stored, or sent. Browser-local counters are useful for development verification, not cross-visitor reporting.

`assets/site-config.js` holds the App Store destination and public analytics website ID. App Store anchors have a static fallback URL for visitors with JavaScript disabled; `assets/funnel.js` sets every App Store CTA from the central config at runtime. When the App Store URL changes, update the constant and the static fallback URLs together. `MeasuredFunnel.getCounts()` reads aggregate counts in the local browser console; `MeasuredFunnel.resetCounts()` clears them. The event object is allowlisted to name, selected intent, page, referrer **origin**, campaign tags and CTA placement. `assets/analytics.js` builds a second, narrower allowlist for remote events. Never add pasted message text to either.

Supported events: `landing_view`, `demo_started`, `demo_completed`, `app_store_clicked`. Local aggregate counts persist in `localStorage`; events are printed only on localhost. `demo_completed` fires once per page load after a result is shown. A click tracks intent and position but does not prove an App Store install.

## Free sitewide analytics setup

The site is prepared for **Umami Cloud Hobby**, a free plan with no paid service dependency. The public Website ID is configured in `assets/site-config.js`; the tracker runs only on the production hostname. Keep the Umami website's domain set to `mickyjim.github.io` in the dashboard, and choose the EU region for EU data hosting. Do not paste an Umami API key, Apple API key, or signing file into this public repository. Do not select a paid trial or paid plan.

The tracker runs only on `mickyjim.github.io`, never in local preview. It disables automatic tracking and submits only the four named events with a known page path and optional allowlisted intent, CTA placement, and UTM slugs. It sends no message, raw query string, referrer, account ID or email. The script is cookie-free and honors Do Not Track. Browser privacy controls or blockers can still suppress collection. Umami's free-plan usage counts each custom event and each event data property, so review the Hobby allowance in your account before launch.

After deployment, open the site in two separate browser profiles, run the demo and click a CTA, then confirm that all four event totals appear in the Umami dashboard and are visible together across both profiles. Until that live check succeeds, do not treat the funnel as measured. The local counters are not a substitute for this test.

## Campaign links

Use tagged URLs to the homepage or any guide. Valid UTM values are preserved on internal website links and included in the site's own analytics events; they are **not** appended to App Store links or converted into Apple's `ct`. Values are restricted to letters, numbers, underscores and hyphens (64 characters maximum). For example:

```text
https://mickyjim.github.io/measured-website/?utm_source=reddit&utm_medium=organic&utm_campaign=reply_test_01&utm_content=conflict
https://mickyjim.github.io/measured-website/?utm_source=linkedin&utm_medium=organic&utm_campaign=reply_test_01&utm_content=workplace
```

`utm_term` is also supported. The App Store CTAs use Apple's official public campaign link for app ID `6776645651`, provider token `121386003`, campaign token `measured_web_01`, and media type `8`:

```text
https://apps.apple.com/app/apple-store/id6776645651?pt=121386003&ct=measured_web_01&mt=8
```

`assets/funnel.js` builds this link from `assets/site-config.js`; static HTML links carry the same parameters for visitors without JavaScript. Website UTMs remain separate in Umami and never change Apple's campaign token. The public `pt` and `ct` are marketing URL identifiers, not API credentials. The Apple API issuer ID, API key ID and especially the `.p8` signing key belong to a private server workflow and must never be put in site JavaScript. Apple campaign reports have minimum volume thresholds.

Five Experiment #1 campaign URLs, verified against the local preview:

```text
https://mickyjim.github.io/measured-website/what-should-i-text-back/?utm_source=reddit&utm_medium=organic&utm_campaign=reply_test_01&utm_content=general
https://mickyjim.github.io/measured-website/reply-to-an-ex/?utm_source=quora&utm_medium=organic&utm_campaign=reply_test_01&utm_content=ex
https://mickyjim.github.io/measured-website/reply-to-a-passive-aggressive-text/?utm_source=pinterest&utm_medium=organic&utm_campaign=reply_test_01&utm_content=tone
https://mickyjim.github.io/measured-website/set-a-boundary-over-text/?utm_source=linkedin&utm_medium=organic&utm_campaign=reply_test_01&utm_content=boundary
https://mickyjim.github.io/measured-website/reply-to-a-rude-coworker/?utm_source=blog&utm_medium=organic&utm_campaign=reply_test_01&utm_content=workplace
```

The primary comparison is landing views → demo starts → completions → App Store clicks, segmented by source/content and intent in Umami once configured and verified. Browser-local counters cannot show sitewide conversion on their own.

## Pages

- `index.html`: acquisition homepage and demo
- `what-should-i-text-back/`, `reply-to-an-ex/`, `reply-to-a-passive-aggressive-text/`, `set-a-boundary-over-text/`, `reply-to-a-rude-coworker/`: focused search guides
- `articles/`: existing articles
- `privacy.html`, `support.html`: existing public app support and privacy URLs
- `assets/site.css`, `assets/site.js`: existing design and support behavior
- `assets/acquisition.css`, `assets/site-config.js`, `assets/analytics.js`, `assets/funnel.js`: experiment styling and behavior
- `tests/analytics.test.js`: analytics privacy and configuration checks (`node --test tests/*.test.js`)
