# Pinterest creative hook test — prepared, not published

These four variants replace the earlier `boundary_pin_a.png` and `tone_pin_b.png` drafts. The two earlier files remain for reference only. No Pin has been published.

## Experiment #1 freeze and baseline — 17 September 2026, 10:00 CEST

The approved final variants are A1=`pinterest_boundary_a1`, A2=`pinterest_boundary_a2`, B1=`pinterest_tone_b1`, and B2=`pinterest_tone_b2`. The exact images, titles, descriptions, guide destinations and UTM values below are frozen for this experiment. Website campaign: `utm_source=pinterest`, `utm_medium=organic`, `utm_campaign=pinterest_org_01`; `utm_content` distinguishes each Pin. Umami public Website ID: `865c82cc-78ed-4b82-80a0-0f0343b24550`. Apple attribution remains `pt=121386003&ct=measured_web_01&mt=8` for app ID `6776645651`. No Pinterest account or post was created or changed.

Final image SHA-256 fingerprints:

| Variant | SHA-256 |
| --- | --- |
| A1 | `c0fe6494f3afbb16df040aeb3f55e9b276967be14852fb0bcbe0a4380e424ff4` |
| A2 | `6680e61bdea41e789c3ae3c1f8ceb7e1777f9df9eea725caf6900f074a839530` |
| B1 | `2360c8fc5a938a2e2b6e60dccc55e391e3896307f027c76389cd1018e6c5c400` |
| B2 | `de8c336676ef49f3c1a386c27ba4c8e58fbd0d56162ae9a602558b8bf7246bf3` |

Before publication, the authenticated Umami **Today** view showed 1 visitor, 1 visit, 2 pageviews and 2 `landing_view` events; no `demo_started`, `demo_completed` or `app_store_clicked` event appeared in today's view. The two viewed paths were the boundary and ambiguous-text guides, consistent with our own `internal_test` mobile checks. These sitewide numbers must **not** be counted as external experiment results. In the Events filter, the `utm_campaign` custom-event property had no `pinterest_org_01` value (the last-24-hour list contained only earlier test campaigns); the experiment's four UTM-tagged event counts therefore have an **observed baseline of zero** in Umami as of this snapshot. Pinterest impressions and outbound clicks are **not yet available**, since no Pin has been posted. A measured zero in this dashboard does not guarantee that blockers or reporting delay could not hide a visit.

All four use the same Measured cream/white/teal identity, portrait 2:3 composition, useful example, CTA (“See more calm reply examples →”), visible image footer (“Promotional • Measured iPhone app”), and disclosure at the start of the Pin description. The CTA describes what the linked guide and free sample demo offer, without claiming live analysis or guaranteed outcomes.

Within each pair, the **image hook is the intended tested variable**. Keep the title, description, destination page, board, and publication approach the same within the pair. Organic timing and Pinterest distribution can still confound results; compare outbound-click rate only when exposure is sufficient and similar, and treat small samples as inconclusive.

| Variant | Rendered file | Image hook | Exact Pin title | Exact Pin description | Destination URL | Unique UTM identifier |
| --- | --- | --- | --- | --- | --- | --- |
| A1 | [`creative/pinterest_boundary_a1.png`](creative/pinterest_boundary_a1.png) | Need to set a boundary without starting a fight? | How to set a boundary over text | Promotional post for Measured, an iPhone app I built. A calm boundary example you can adapt, plus a focused guide and free sample demo. | `https://mickyjim.github.io/measured-website/set-a-boundary-over-text/?utm_source=pinterest&utm_medium=organic&utm_campaign=pinterest_org_01&utm_content=pinterest_boundary_a1` | `pinterest_boundary_a1` |
| A2 | [`creative/pinterest_boundary_a2.png`](creative/pinterest_boundary_a2.png) | One clear sentence for saying no. | How to set a boundary over text | Promotional post for Measured, an iPhone app I built. A calm boundary example you can adapt, plus a focused guide and free sample demo. | `https://mickyjim.github.io/measured-website/set-a-boundary-over-text/?utm_source=pinterest&utm_medium=organic&utm_campaign=pinterest_org_01&utm_content=pinterest_boundary_a2` | `pinterest_boundary_a2` |
| B1 | [`creative/pinterest_tone_b1.png`](creative/pinterest_tone_b1.png) | Not sure what their text actually means? | How to reply when tone is unclear | Promotional post for Measured, an iPhone app I built. Ask about the concrete request instead of guessing tone. Read the guide and try the free sample demo. | `https://mickyjim.github.io/measured-website/reply-to-a-passive-aggressive-text/?utm_source=pinterest&utm_medium=organic&utm_campaign=pinterest_org_01&utm_content=pinterest_tone_b1` | `pinterest_tone_b1` |
| B2 | [`creative/pinterest_tone_b2.png`](creative/pinterest_tone_b2.png) | Don't decode the tone. Clarify the request. | How to reply when tone is unclear | Promotional post for Measured, an iPhone app I built. Ask about the concrete request instead of guessing tone. Read the guide and try the free sample demo. | `https://mickyjim.github.io/measured-website/reply-to-a-passive-aggressive-text/?utm_source=pinterest&utm_medium=organic&utm_campaign=pinterest_org_01&utm_content=pinterest_tone_b2` | `pinterest_tone_b2` |

The shared `utm_campaign=pinterest_org_01` groups the pilot. The unique `utm_content` value identifies each creative in Umami's `landing_view`, `demo_started`, `demo_completed`, and `app_store_clicked` events. Internal website navigation preserves those tags. Apple's App Store CTAs retain the independent public `pt=121386003&ct=measured_web_01&mt=8` parameters; no UTM is appended to the App Store link. The links contain no personal information.

At a 240-pixel feed width, all four hooks, example text, CTAs and enlarged promotional footers remain readable, with safe margins and no crop. The exact Pin descriptions also begin with a clear promotional disclosure. Both destination guides were checked in a 390×844 mobile viewport. The examples and free sample demo are available; each guide's App Store CTA retains the official attribution link. Any browser visits used for diagnostics used `utm_campaign=internal_test`, not a pilot variant.

To compare without choosing by taste, record for each Pin: publication time, board, impressions, outbound clicks, outbound-click rate, Umami landing views, demo starts, demo completions, and App Store clicks. Exclude internal tests. Do not infer installs from clicks, and do not declare a winner from tiny or differently exposed samples. Before publishing, verify Pinterest's current commercial-content and spam rules and approve each post. Avoid repeated bulk posting of near-duplicate Pins.

Render method: built-in imagegen edits of the existing PNG drafts. A2 is an edit of A1 and B2 an edit of B1 to hold visual elements as steady as possible. Generated PNGs are saved here as new files; the original two drafts were not overwritten.
