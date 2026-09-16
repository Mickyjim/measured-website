(() => {
  "use strict";
  const config = window.MeasuredConfig;
  if (!config) return;
  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const intents = ["de-escalate", "boundary", "firm", "professional", "end"];
  const events = ["landing_view", "demo_started", "demo_completed", "app_store_clicked"];
  const storageKey = "measured:funnel:v1";
  const baseURL = new URL("../", document.currentScript.src);
  const params = new URLSearchParams(location.search);
  // Only campaign slugs, never arbitrary query strings or message content.
  const attribution = Object.fromEntries(utmKeys.map(key => {
    const value = params.get(key) || "";
    return [key, /^[a-z0-9_-]{1,64}$/i.test(value) ? value : ""];
  }));
  let referrer = "";
  try { referrer = document.referrer ? new URL(document.referrer).origin : ""; } catch {}
  let selectedIntent = "";
  let started = false;
  let completed = false;
  let adapter = typeof config.eventSink === "function" ? config.eventSink : window.MeasuredAnalytics?.track;
  const development = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
  const allowedPages = new Set(["", "index.html", "privacy.html", "support.html",
    "what-should-i-text-back/", "reply-to-an-ex/", "reply-to-a-passive-aggressive-text/",
    "set-a-boundary-over-text/", "reply-to-a-rude-coworker/"]);
  const relativePage = location.pathname.startsWith(baseURL.pathname)
    ? location.pathname.slice(baseURL.pathname.length) : "";
  const page = allowedPages.has(relativePage) ? relativePage || "index.html"
    : /^articles\/[a-z0-9-]+\.html$/.test(relativePage) ? relativePage : "other";

  function readCounts() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
      const result = {};
      // Do not re-persist injected or older unknown fields.
      for (const name of events) {
        const value = stored[name];
        result[name] = Number.isSafeInteger(value) && value >= 0 ? value : 0;
      }
      result.byIntent = {};
      for (const intent of intents) {
        const value = stored.byIntent?.[intent];
        result.byIntent[intent] = Number.isSafeInteger(value) && value >= 0 ? value : 0;
      }
      return result;
    } catch {
      return Object.assign(Object.fromEntries(events.map(name => [name, 0])),
        {byIntent: Object.fromEntries(intents.map(intent => [intent, 0]))});
    }
  }

  function track(name, placement = "") {
    if (!events.includes(name)) return;
    const event = Object.freeze({
      name, intent: selectedIntent, page, referrer, ...attribution,
      placement: ["top", "demo", "bottom", "content", "legacy"].includes(placement) ? placement : ""
    });
    // Persist aggregate counters only: no raw events, URLs, timestamps or identifiers.
    try {
      const counts = readCounts();
      counts[name] += 1;
      if (name === "demo_completed" && selectedIntent) counts.byIntent[selectedIntent] += 1;
      localStorage.setItem(storageKey, JSON.stringify(counts));
    } catch { /* Storage may be blocked. Demo and links must still work. */ }
    if (development) console.debug("[Measured funnel] " + JSON.stringify(event));
    if (adapter) {
      try {
        Promise.resolve(adapter(event)).catch(() => {
          if (development) console.debug("[Measured funnel] adapter unavailable");
        });
      } catch { /* Analytics must never block navigation. */ }
    }
  }

  function appStoreURL() {
    const url = new URL(config.appStoreURL);
    // Apple attribution is independent of our website UTMs, which stay in analytics.
    if (/^[0-9]+$/.test(config.providerToken) &&
        /^[a-z0-9_-]{1,30}$/i.test(config.defaultCampaignToken)) {
      url.searchParams.set("pt", config.providerToken);
      url.searchParams.set("ct", config.defaultCampaignToken);
      url.searchParams.set("mt", "8");
    }
    return url.href;
  }

  document.querySelectorAll("a[href]").forEach(link => {
    const url = new URL(link.href);
    if (link.hasAttribute("data-app-store") ||
        (url.hostname === "apps.apple.com" && url.pathname.includes("id6776645651"))) {
      link.href = appStoreURL();
      link.rel = "noopener noreferrer";
      link.addEventListener("click", () => track("app_store_clicked", link.dataset.placement || "legacy"));
      link.addEventListener("auxclick", event => {
        if (event.button === 1) track("app_store_clicked", link.dataset.placement || "legacy");
      });
    } else if (url.origin === location.origin && url.pathname.startsWith(baseURL.pathname)) {
      for (const key of utmKeys) if (attribution[key]) url.searchParams.set(key, attribution[key]);
      link.href = url.href;
    }
  });

  window.MeasuredFunnel = Object.freeze({
    getCounts: readCounts,
    resetCounts() { try { localStorage.removeItem(storageKey); } catch {} },
    setAdapter(fn) { adapter = typeof fn === "function" ? fn : null; },
    appStoreURL
  });
  track("landing_view");

  const form = document.querySelector("[data-reply-demo]");
  if (!form) return;
  const message = form.querySelector("#received-message");
  const intentSelect = form.querySelector("#reply-intent");
  const result = document.querySelector("#demo-result");
  const status = document.querySelector("#demo-status");
  const begin = () => {
    selectedIntent = intents.includes(intentSelect.value) ? intentSelect.value : "de-escalate";
    if (!started) { started = true; track("demo_started"); }
  };
  message.addEventListener("input", begin);
  intentSelect.addEventListener("change", () => {
    begin();
    result.hidden = true;
    status.textContent = "Goal changed. Run the demo again for new samples.";
  });
  message.addEventListener("input", () => { result.hidden = true; status.textContent = ""; });
  document.querySelector("[data-use-example]").addEventListener("click", () => {
    message.value = "After everything I've done for you, you can't even make time for me?";
    begin();
    result.hidden = true;
    status.textContent = "Example loaded. Choose your goal, then run the demo.";
    message.focus();
  });
  document.querySelector("[data-clear-demo]").addEventListener("click", () => {
    form.reset();
    message.value = "";
    result.hidden = true;
    status.textContent = "Message cleared.";
    selectedIntent = "";
    message.focus();
  });

  // Fixed educational templates: never interpolate, log or retain user text.
  const replies = {
    "de-escalate": ["I want to understand what upset you. Can we focus on one thing at a time?",
      "I'm willing to talk about this. Let's pause and come back when we can both be clear."],
    boundary: ["I can talk about this, but I need us to keep it respectful.",
      "I'm not continuing this conversation while it includes personal remarks. I'll pause here."],
    firm: ["I understand you see this differently. My decision is still the same.",
      "I've explained my decision. I'm not going to debate it further."],
    professional: ["Could you clarify the specific change you need and the deadline?",
      "I can take this on once we agree what should move down the priority list."],
    end: ["I don't have anything more to add right now. I'm going to step away.",
      "I'm ending this conversation here. I won't be responding further on this topic."]
  };
  function sample(text, intent) {
    if (/\b(kill|hurt you|hurt myself|suicide|weapon|stalk|afraid|unsafe|threat)\b/i.test(text)) {
      return {
        analysis: "Some words can relate to safety. This sample cannot assess danger or tell whether a message is safe.",
        avoid: "Prioritising a polished reply over your safety.",
        calm: "You do not need to send a reply. Prioritise getting to a safe place and reaching trusted support.",
        firm: "If there is immediate danger, contact local emergency services.",
        safety: true
      };
    }
    let analysis = "A single message cannot establish someone's intent. Choose the outcome you want before deciding what to say.";
    let avoid = "Guessing motives or answering every point at once.";
    let pair = replies[intent];
    if (/\b(deadline|boss|work|client|project|tonight|asap)\b/i.test(text)) {
      analysis = "There may be time or work pressure. A useful next step is to clarify priorities and what you can commit to.";
      avoid = "Promising a deadline you cannot meet just to end the pressure.";
      if (intent === "de-escalate") pair = ["I understand this is time-sensitive. Can we agree the most important next step?",
        "I can help once we clarify the deadline and what can wait."];
    } else if (/\b(pickup|pick-up|school|children|kids|co-parent)\b/i.test(text)) {
      analysis = "This may involve shared responsibilities. Keeping the reply about a specific practical arrangement can help.";
      avoid = "Mixing the practical question with older disagreements.";
      if (intent === "de-escalate") pair = ["Let's focus on the arrangement. What time are you proposing?",
        "I'm happy to discuss the schedule. Let's keep this exchange about the practical details."];
    } else if (/\b(always|never|after everything|if you cared|owe|your fault)\b/i.test(text)) {
      analysis = "Broad claims or references to obligation may feel pressuring. That does not establish the sender's motives.";
      avoid = "Defending your whole history instead of addressing the current issue.";
    } else if (/\b(whatever|fine|obviously|must be nice|as usual)\b/i.test(text)) {
      analysis = "Tone can be ambiguous in a short text. Ask about the concrete concern before assuming sarcasm or hostility.";
      avoid = "Replying with sarcasm or treating your interpretation as a fact.";
    }
    return {analysis, avoid, calm: pair[0], firm: pair[1], safety: false};
  }
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!message.value.trim()) {
      status.textContent = "Paste a message or use the example first.";
      message.focus();
      return;
    }
    begin();
    const output = sample(message.value, selectedIntent);
    result.querySelector("[data-analysis]").textContent = output.analysis;
    result.querySelector("[data-avoid]").textContent = output.avoid;
    result.querySelector("[data-calm]").textContent = output.calm;
    result.querySelector("[data-firm]").textContent = output.firm;
    result.querySelector("[data-calm-title]").textContent = output.safety ? "Safety comes first" : "A calm reply";
    result.querySelector("[data-firm-title]").textContent = output.safety ? "Getting support" : "A firmer reply";
    result.querySelector("[data-demo-cta]").hidden = output.safety;
    result.hidden = false;
    status.textContent = "Sample ready. These are fixed examples, not a live AI analysis.";
    result.focus();
    // A funnel completion is counted once per page load, not once per retry.
    if (!completed) { completed = true; track("demo_completed"); }
  });
  window.addEventListener("pagehide", () => {
    message.value = "";
    result.hidden = true;
  });
})();
