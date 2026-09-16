/* Canonical App Store configuration. Static hrefs are no-JavaScript fallbacks. */
window.MeasuredConfig = Object.freeze({
  appStoreURL: "https://apps.apple.com/app/apple-store/id6776645651",
  // Public identifiers from the official App Store Connect campaign link.
  providerToken: "121386003",
  defaultCampaignToken: "measured_web_01",
  // Public Umami website ID from the free Hobby account; never put an API key here.
  umamiWebsiteId: "865c82cc-78ed-4b82-80a0-0f0343b24550",
  // Optional local/test adapter. Production collection uses assets/analytics.js.
  eventSink: null
});
