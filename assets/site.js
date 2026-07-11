document.addEventListener("DOMContentLoaded", () => {
  const enableInternalPagePrefetch = () => {
    const MAX_IDLE_PREFETCH_COUNT = 6;
    const prefetched = new Set();
    const supportsPrefetch = (() => {
      const link = document.createElement("link");
      return link.relList?.supports?.("prefetch") === true;
    })();

    if (!supportsPrefetch) {
      return;
    }

    const normalizePath = (href) => {
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return null;
        if (url.hash && url.pathname === window.location.pathname) return null;
        const path = url.pathname.toLowerCase();
        if (!path.endsWith(".html") && path !== "/" && path !== "") return null;
        return url.href;
      } catch (_) {
        return null;
      }
    };

    const prefetchHref = (href) => {
      const normalizedHref = normalizePath(href);
      if (!normalizedHref || prefetched.has(normalizedHref)) {
        return;
      }

      prefetched.add(normalizedHref);
      const prefetchLink = document.createElement("link");
      prefetchLink.rel = "prefetch";
      prefetchLink.href = normalizedHref;
      prefetchLink.as = "document";
      document.head.appendChild(prefetchLink);
    };

    document.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      link.addEventListener("mouseenter", () => prefetchHref(href), { passive: true });
      link.addEventListener("touchstart", () => prefetchHref(href), { passive: true });
    });

    // We intentionally use a one-shot fallback because this runs once per page
    // and only appends a few lightweight <link rel="prefetch"> tags.
    const schedule = window.requestIdleCallback || ((cb) => window.setTimeout(cb, 100));
    schedule(() => {
      const links = document.querySelectorAll('a[href$=".html"], a[href="/"]');
      for (let i = 0; i < Math.min(links.length, MAX_IDLE_PREFETCH_COUNT); i += 1) {
        const href = links[i].getAttribute("href");
        if (href) prefetchHref(href);
      }
    });
  };

  enableInternalPagePrefetch();

  const FIREBASE_BACKEND_ORIGIN = "https://bds-site--bdssite-5fac1.europe-west4.hosted.app";
  const isLocalDev = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const backendOrigin = isLocalDev ? "" : FIREBASE_BACKEND_ORIGIN;

  const aiToggle = document.querySelector("#ai-chat-toggle");
  const aiPopup = document.querySelector("#ai-chat-popup");
  const aiHead = document.querySelector(".ai-chat-head");
  const aiForm = document.querySelector("#ai-chat-form");
  const aiInput = document.querySelector("#ai-chat-input");
  const aiBody = document.querySelector("#ai-chat-body");
  const AUTO_OPEN_KEY = "bds_ai_auto_opened";

  const openChat = () => {
    aiPopup?.removeAttribute("hidden");
    aiToggle?.setAttribute("aria-expanded", "true");
  };

  if (aiHead && aiPopup && !aiHead.querySelector(".ai-chat-minimize")) {
    const minimizeBtn = document.createElement("button");
    minimizeBtn.type = "button";
    minimizeBtn.className = "ai-chat-minimize";
    minimizeBtn.setAttribute("aria-label", "Minimize AI chat");
    minimizeBtn.textContent = "Minimize";

    minimizeBtn.addEventListener("click", () => {
      aiPopup.setAttribute("hidden", "");
      aiToggle?.setAttribute("aria-expanded", "false");
    });

    aiHead.appendChild(minimizeBtn);
  }

  aiToggle?.addEventListener("click", () => {
    const isHidden = aiPopup.hasAttribute("hidden");
    if (isHidden) {
      openChat();
      aiInput?.focus();
    } else {
      aiPopup.setAttribute("hidden", "");
      aiToggle.setAttribute("aria-expanded", "false");
    }
  });

  const path = window.location.pathname.toLowerCase();
  const isHomePage = path.endsWith("/") || path.endsWith("/index.html") || path === "index.html";
  if (isHomePage && aiPopup && aiToggle && !sessionStorage.getItem(AUTO_OPEN_KEY)) {
    window.setTimeout(() => {
      if (aiPopup.hasAttribute("hidden")) {
        openChat();
      }
      sessionStorage.setItem(AUTO_OPEN_KEY, "1");
    }, 20000);
  }

  document.querySelectorAll(".js-audit-form").forEach((form) => {
    const status = form.querySelector(".audit-tool-status");
    const submit = form.querySelector(".audit-submit");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const payload = {
        website: String(formData.get("website") || "").trim(),
        businessName: String(formData.get("businessName") || "").trim(),
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
      };

      const fallbackQuery = new URLSearchParams(payload).toString();

      if (status) {
        status.classList.remove("is-error");
        status.textContent = "Running your audit. This usually takes 20-40 seconds...";
      }
      if (submit) {
        submit.setAttribute("disabled", "");
        submit.textContent = "Running Audit...";
      }

      try {
        const response = await fetch(`${backendOrigin}/api/audit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Something went wrong. Please try again.");
        }

        window.location.href = `${backendOrigin}/audit/${data.reportId}`;
      } catch (error) {
        // If cross-origin requests are blocked, continue on the hosted app with prefilled values.
        if (backendOrigin && (error instanceof TypeError || String(error?.message || "").includes("Failed to fetch"))) {
          window.location.href = `${backendOrigin}/free-audit?${fallbackQuery}`;
          return;
        }

        if (status) {
          status.classList.add("is-error");
          status.textContent = error.message || "Something went wrong. Please try again.";
        }
        if (submit) {
          submit.removeAttribute("disabled");
          submit.textContent = "Run My Free Audit";
        }
      }
    });
  });

  aiForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = (aiInput?.value || "").trim();
    if (!question) {
      return;
    }

    const userMessage = document.createElement("p");
    userMessage.className = "ai-user";
    userMessage.textContent = question;
    aiBody?.appendChild(userMessage);

    const reply = document.createElement("p");
    reply.className = "ai-reply";
    const q = question.toLowerCase();

    if (q.includes("price") || q.includes("cost")) {
      reply.textContent =
        "Pricing depends on scope. Call 07843 969254 or email info@bryantdigitalsolutions.com for a quote.";
    } else if (q.includes("seo")) {
      reply.textContent =
        "For SEO support, visit the SEO Services page or request your free website and SEO audit.";
    } else if (q.includes("website")) {
      reply.textContent =
        "We design user-friendly, conversion-focused websites. Use Website Services to see examples and next steps.";
    } else {
      reply.textContent =
        "Thanks. We can help with websites, SEO, ads, social media, and coding. Call or email us for direct support.";
    }

    aiBody?.appendChild(reply);
    aiBody.scrollTop = aiBody.scrollHeight;
    aiInput.value = "";
  });
});
