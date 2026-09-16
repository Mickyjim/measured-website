/* Privacy-limited Umami Cloud adapter. The website ID is public, never a credential. */
(() => {
  "use strict";
  const website = window.MeasuredConfig?.umamiWebsiteId || "";
  const allowedEvents = new Set(["landing_view", "demo_started", "demo_completed", "app_store_clicked"]);
  const allowedIntents = new Set(["de-escalate", "boundary", "firm", "professional", "end"]);
  const allowedPlacements = new Set(["top", "demo", "bottom", "content", "legacy"]);
  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const enabled = location.hostname === "mickyjim.github.io" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(website);
  const pending = [];
  let ready = false;

  function send(event) {
    if (!enabled || !allowedEvents.has(event?.name)) return;
    // Rebuild the payload from an explicit allowlist. Never forward the event wholesale.
    const data = {};
    if (allowedIntents.has(event.intent)) data.intent = event.intent;
    if (allowedPlacements.has(event.placement)) data.placement = event.placement;
    for (const key of utmKeys) {
      if (/^[a-z0-9_-]{1,64}$/i.test(event[key] || "")) data[key] = event[key];
    }
    const page = /^(index\.html|(?:what-should-i-text-back|reply-to-an-ex|reply-to-a-passive-aggressive-text|set-a-boundary-over-text|reply-to-a-rude-coworker)\/)$/.test(event.page)
      ? event.page : "other";
    const payload = {
      website,
      url: "/measured-website/" + (page === "index.html" ? "" : page),
      name: event.name,
      data
    };
    if (ready && window.umami?.track) window.umami.track(payload);
    else if (pending.length < 20) pending.push(payload);
  }

  window.MeasuredAnalytics = Object.freeze({ track: send, enabled });
  if (!enabled) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://cloud.umami.is/script.js";
  script.dataset.websiteId = website;
  script.dataset.domains = "mickyjim.github.io";
  // Only explicitly allowlisted custom events; no automatic pageviews or click capture.
  script.dataset.autoTrack = "false";
  script.dataset.excludeSearch = "true";
  script.dataset.excludeHash = "true";
  script.dataset.doNotTrack = "true";
  script.onload = () => {
    ready = typeof window.umami?.track === "function";
    if (ready) for (const payload of pending.splice(0)) window.umami.track(payload);
  };
  script.onerror = () => { pending.length = 0; };
  document.head.append(script);
})();
