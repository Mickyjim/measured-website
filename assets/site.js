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
