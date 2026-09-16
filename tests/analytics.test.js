const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(new URL('../assets/analytics.js', `file://${__filename}`), 'utf8');
const funnelSource = fs.readFileSync(new URL('../assets/funnel.js', `file://${__filename}`), 'utf8');
const configSource = fs.readFileSync(new URL('../assets/site-config.js', `file://${__filename}`), 'utf8');
const configWindow = {};
vm.runInNewContext(configSource, { window: configWindow });
const website = configWindow.MeasuredConfig.umamiWebsiteId;
const appleCampaignURL = 'https://apps.apple.com/app/apple-store/id6776645651?pt=121386003&ct=measured_web_01&mt=8';

test('public website ID is configured with no private credentials', () => {
  assert.equal(website, '865c82cc-78ed-4b82-80a0-0f0343b24550');
  assert.equal(configWindow.MeasuredConfig.appStoreURL,
    'https://apps.apple.com/app/apple-store/id6776645651');
  assert.equal(configWindow.MeasuredConfig.providerToken, '121386003');
  assert.equal(configWindow.MeasuredConfig.defaultCampaignToken, 'measured_web_01');
  assert.deepEqual(Object.keys(configWindow.MeasuredConfig).sort(),
    ['appStoreURL', 'providerToken', 'defaultCampaignToken', 'umamiWebsiteId', 'eventSink'].sort());
});

function load(hostname, id) {
  const scripts = [];
  const sent = [];
  const window = { MeasuredConfig: { umamiWebsiteId: id }, umami: { track: item => sent.push(item) } };
  const document = {
    head: { append: script => scripts.push(script) },
    createElement: () => ({ dataset: {} })
  };
  vm.runInNewContext(source, { window, document, location: { hostname } });
  return { window, scripts, sent };
}

test('remote tracking stays off without a configured public website ID and on localhost', () => {
  for (const [host, id] of [['mickyjim.github.io', ''], ['127.0.0.1', website]]) {
    const { window, scripts } = load(host, id);
    assert.equal(window.MeasuredAnalytics.enabled, false);
    window.MeasuredAnalytics.track({ name: 'landing_view' });
    assert.equal(scripts.length, 0);
  }
});

test('Umami event payload contains only the explicit privacy allowlist', () => {
  const { window, scripts, sent } = load('mickyjim.github.io', website);
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].src, 'https://cloud.umami.is/script.js');
  assert.equal(scripts[0].dataset.websiteId, website);
  assert.equal(scripts[0].dataset.domains, 'mickyjim.github.io');
  assert.equal(scripts[0].dataset.autoTrack, 'false');
  const secret = 'PRELAUNCH_SECRET_SENTINEL_7941';
  window.MeasuredAnalytics.track({
    name: 'demo_completed', intent: 'professional', placement: 'demo',
    page: 'index.html', utm_source: 'reddit', utm_content: 'workplace',
    utm_term: 'invalid value with spaces', referrer: 'https://example.test/private?message=' + secret,
    message: secret, rawURL: '/?message=' + secret
  });
  assert.equal(sent.length, 0);
  scripts[0].onload();
  assert.equal(sent.length, 1);
  assert.equal(sent[0].website, website);
  assert.equal(sent[0].hostname, 'mickyjim.github.io');
  assert.equal(sent[0].url, '/measured-website/');
  assert.equal(sent[0].name, 'demo_completed');
  assert.equal(sent[0].data.intent, 'professional');
  assert.equal(sent[0].data.utm_source, 'reddit');
  assert.equal(sent[0].data.utm_content, 'workplace');
  assert.equal(sent[0].data.utm_term, undefined);
  assert.equal(JSON.stringify(sent).includes(secret), false);
  assert.equal(JSON.stringify(sent).includes('referrer'), false);
  window.MeasuredAnalytics.track({ name: 'unknown', message: secret });
  assert.equal(sent.length, 1);
});

test('all four funnel events use the configured Website ID', () => {
  const { window, scripts, sent } = load('mickyjim.github.io', website);
  for (const name of ['landing_view', 'demo_started']) {
    window.MeasuredAnalytics.track({ name, page: 'index.html' });
  }
  assert.equal(sent.length, 0);
  scripts[0].onload();
  for (const name of ['demo_completed', 'app_store_clicked']) {
    window.MeasuredAnalytics.track({ name, page: 'index.html' });
  }
  assert.deepEqual(sent.map(event => event.name || 'pageview'),
    ['pageview', 'landing_view', 'demo_started', 'demo_completed', 'app_store_clicked']);
  assert.equal(sent.every(event => event.website === website), true);
  assert.equal(sent[0].url, '/measured-website/');
  assert.equal(Object.hasOwn(sent[0], 'data'), false);
  assert.equal(Object.hasOwn(sent[0], 'name'), false);
  const secret = 'PRIVATE_MESSAGE_SENTINEL_7941';
  const event = { name: 'landing_view', page: 'reply-to-an-ex/',
    utm_source: 'reddit', referrer: `https://example.test/?message=${secret}`,
    rawURL: `/?message=${secret}`, message: secret };
  window.MeasuredAnalytics.track(event);
  const pageviews = sent.filter(payload => !payload.name);
  assert.equal(pageviews.length, 1);
  assert.equal(pageviews[0].url, '/measured-website/');
  assert.equal(JSON.stringify(sent).includes(secret), false);
  assert.equal(JSON.stringify(pageviews[0]).includes('utm_'), false);
});

test('demo never writes, logs or sends the pasted message', () => {
  const secret = 'PRELAUNCH_SECRET_SENTINEL_7941 deadline tonight';
  const handlers = {};
  const events = [];
  const writes = [];
  const logs = [];
  const requests = [];
  const makeElement = () => ({
    value: '', hidden: true, textContent: '',
    addEventListener(name, fn) { this.handlers ||= {}; this.handlers[name] = fn; },
    focus() {}
  });
  const message = makeElement();
  const intent = makeElement(); intent.value = 'professional';
  const result = makeElement();
  result.querySelector = () => makeElement();
  const status = makeElement();
  const example = makeElement();
  const clear = makeElement();
  const form = makeElement();
  form.querySelector = selector => selector === '#received-message' ? message : intent;
  form.reset = () => { intent.value = 'de-escalate'; };
  const document = {
    currentScript: { src: 'http://127.0.0.1:8124/assets/funnel.js' },
    referrer: '',
    querySelectorAll: () => [],
    querySelector(selector) {
      return { '[data-reply-demo]': form, '#demo-result': result,
        '#demo-status': status, '[data-use-example]': example,
        '[data-clear-demo]': clear }[selector];
    }
  };
  const storage = new Map();
  const localStorage = {
    getItem: key => storage.get(key) || null,
    setItem: (key, value) => { writes.push(value); storage.set(key, value); },
    removeItem: key => storage.delete(key)
  };
  const window = {
    MeasuredConfig: { ...configWindow.MeasuredConfig, eventSink: event => events.push(event) },
    addEventListener: (name, fn) => { handlers[name] = fn; }
  };
  vm.runInNewContext(funnelSource, {
    window, document, location: new URL('http://127.0.0.1:8124/?utm_source=reddit'),
    URL, URLSearchParams, localStorage, Promise,
    console: { debug: item => logs.push(item) },
    fetch: (...args) => requests.push(args),
    navigator: { sendBeacon: (...args) => requests.push(args) }
  });
  message.value = secret;
  message.handlers.input();
  form.handlers.submit({ preventDefault() {} });
  assert.equal(result.hidden, false);
  assert.equal(events.map(event => event.name).join(','),
    'landing_view,demo_started,demo_completed');
  assert.equal(JSON.stringify({ events, writes, logs, requests }).includes(secret), false);
  assert.equal(requests.length, 0);
  handlers.pagehide();
  assert.equal(message.value, '');
});

test('all App Store CTAs have the official attributed no-JavaScript fallback', () => {
  const pages = ['index.html', 'what-should-i-text-back/index.html',
    'reply-to-an-ex/index.html', 'reply-to-a-passive-aggressive-text/index.html',
    'set-a-boundary-over-text/index.html', 'reply-to-a-rude-coworker/index.html'];
  for (const page of pages) {
    const html = fs.readFileSync(new URL('../' + page, `file://${__filename}`), 'utf8');
    assert.match(html, /site-config\.js\?v=experiment-1-apple/, page);
    assert.match(html, /funnel\.js\?v=experiment-1-apple/, page);
    const links = [...html.matchAll(/<a\b[^>]*data-app-store[^>]*href="([^"]+)"/g)];
    assert.ok(links.length >= 2, `${page} has App Store CTAs`);
    for (const [, href] of links) {
      assert.equal(href.replaceAll('&amp;', '&'), appleCampaignURL, page);
    }
  }
});

test('homepage and five landing pages retain UTMs in site events, not Apple attribution', () => {
  const pages = [
    ['', 'reddit', 'conflict'],
    ['what-should-i-text-back/', 'reddit', 'general'],
    ['reply-to-an-ex/', 'quora', 'ex'],
    ['reply-to-a-passive-aggressive-text/', 'pinterest', 'tone'],
    ['set-a-boundary-over-text/', 'linkedin', 'boundary'],
    ['reply-to-a-rude-coworker/', 'blog', 'workplace']
  ];
  for (const [page, source, content] of pages) {
    const tracked = [];
    const link = (href, appStore) => ({
      href, dataset: { placement: 'content' }, handlers: {},
      hasAttribute: key => appStore && key === 'data-app-store',
      addEventListener(name, fn) { this.handlers[name] = fn; }
    });
    const app = link(appleCampaignURL, true);
    const demo = link('http://127.0.0.1:8124/index.html#demo', false);
    const document = {
      currentScript: { src: 'http://127.0.0.1:8124/assets/funnel.js' },
      referrer: '', querySelectorAll: () => [app, demo], querySelector: () => null
    };
    const location = new URL(`http://127.0.0.1:8124/${page}?utm_source=${source}&utm_medium=organic&utm_campaign=reply_test_01&utm_content=${content}&utm_term=experiment`);
    const storage = new Map();
    const window = {
      MeasuredConfig: { ...configWindow.MeasuredConfig, eventSink: event => tracked.push(event) }
    };
    vm.runInNewContext(funnelSource, {
      window, document, location, URL, URLSearchParams, Promise,
      localStorage: {
        getItem: key => storage.get(key) || null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: key => storage.delete(key)
      },
      console: { debug() {} }
    });
    assert.equal(window.MeasuredFunnel.appStoreURL(), appleCampaignURL, page);
    assert.equal(app.href, appleCampaignURL, page);
    assert.equal(new URL(demo.href).searchParams.get('utm_source'), source, page);
    assert.equal(new URL(demo.href).searchParams.get('utm_content'), content, page);
    app.handlers.click();
    assert.deepEqual(tracked.map(event => event.name), ['landing_view', 'app_store_clicked']);
    for (const event of tracked) {
      assert.equal(event.utm_source, source, page);
      assert.equal(event.utm_content, content, page);
      assert.equal(event.utm_term, 'experiment', page);
    }
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      assert.equal(new URL(app.href).searchParams.has(key), false, page);
    }
  }
});
