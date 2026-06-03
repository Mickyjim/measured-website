const revealTargets = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealTargets.forEach(target => observer.observe(target));
} else {
  revealTargets.forEach(target => target.classList.add("is-visible"));
}

document.querySelectorAll("[data-current-year]").forEach(target => {
  target.textContent = new Date().getFullYear();
});

// Hero "live preview": auto-play the coaching sequence and loop it.
document.querySelectorAll("[data-demo]").forEach(demo => {
  const step = name => demo.querySelector(`[data-step="${name}"]`);
  const all = Array.from(demo.querySelectorAll("[data-step]"));
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) {
    all.forEach(el => el.classList.add("is-shown"));
    return;
  }

  const show = name => step(name) && step(name).classList.add("is-shown");
  const hide = name => step(name) && step(name).classList.remove("is-shown");
  let timers = [];
  const at = (ms, fn) => timers.push(window.setTimeout(fn, ms));

  // The incoming message stays put; the coaching → reply sequence loops, so the
  // phone never sits fully empty.
  function cycle() {
    timers.forEach(window.clearTimeout);
    timers = [];
    ["reading", "card1", "card2", "typing", "reply"].forEach(hide);

    at(700, () => show("reading"));
    at(2400, () => { hide("reading"); show("card1"); });
    at(3700, () => show("card2"));
    at(5100, () => show("typing"));
    at(6200, () => { hide("typing"); show("reply"); });
    at(10200, cycle); // hold the reply, then replay
  }

  function play() {
    show("incoming");
    window.setTimeout(cycle, 650);
  }

  // Start once the phone scrolls into view; keep it cheap if off-screen.
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { play(); obs.disconnect(); }
      });
    }, { threshold: 0.3 });
    io.observe(demo);
  } else {
    play();
  }
});

document.querySelectorAll("[data-contact-form]").forEach(form => {
  form.addEventListener("submit", event => {
    event.preventDefault();

    const destination = form.dataset.contactEmail;
    const status = form.querySelector("[data-contact-status]");
    const data = new FormData(form);
    const topic = String(data.get("topic") || "Website contact").trim();
    const replyEmail = String(data.get("replyEmail") || "").trim();
    const subject = String(data.get("subject") || "").trim();
    const message = String(data.get("message") || "").trim();

    const emailSubject = `[Measured] ${topic}: ${subject || "Website contact"}`;
    const emailBody = [
      `Topic: ${topic}`,
      `Reply email: ${replyEmail || "Not provided"}`,
      "",
      "Message:",
      message,
      "",
      "--",
      "Sent from the Measured public website contact form."
    ].join("\n");

    window.location.href = `mailto:${destination}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    if (status) {
      status.textContent = "Your email app should open with the message ready to send. If it does not, use the direct email link below the form.";
    }
  });
});
