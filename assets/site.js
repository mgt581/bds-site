(function installBdsTracking() {
  "use strict";

  const config = {
    leadEndpoint: "https://bds-site.pages.dev/api/lead",
    eventEndpoint: "https://bds-site.pages.dev/api/lead-event",
    storagePrefix: "bryant_digital_solutions",
  };
  const prefix = config.storagePrefix;
  const clean = (value) => String(value || "").trim();
  const get = (storage, key) => {
    try { return storage.getItem(`${prefix}_${key}`) || ""; } catch (_) { return ""; }
  };
  const set = (storage, key, value) => {
    try { storage.setItem(`${prefix}_${key}`, value); } catch (_) {}
  };
  const makeId = (kind) => {
    if (window.crypto?.randomUUID) return `${kind}-${window.crypto.randomUUID()}`;
    return `${kind}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  };
  const stableId = (storage, key, kind) => {
    let value = get(storage, key);
    if (!value) { value = makeId(kind); set(storage, key, value); }
    return value;
  };
  const firstTouch = () => {
    const stored = get(sessionStorage, "first_touch");
    if (stored) {
      try { return JSON.parse(stored); } catch (_) {}
    }
    const params = new URLSearchParams(window.location.search);
    const attribution = {
      referrer: document.referrer || "",
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_term: params.get("utm_term") || "",
      utm_content: params.get("utm_content") || "",
      gclid: params.get("gclid") || "",
      fbclid: params.get("fbclid") || "",
      msclkid: params.get("msclkid") || "",
    };
    set(sessionStorage, "first_touch", JSON.stringify(attribution));
    return attribution;
  };
  const attribution = () => {
    let landingPage = get(sessionStorage, "landing_page");
    if (!landingPage) {
      landingPage = window.location.href;
      set(sessionStorage, "landing_page", landingPage);
    }
    return {
      ...firstTouch(),
      page: window.location.href,
      landing_page: landingPage,
      session_id: stableId(sessionStorage, "session_id", "session"),
      client_id: stableId(localStorage, "client_id", "client"),
    };
  };
  const trackEvent = (name, detail = {}, options = {}) => {
    const eventName = clean(name);
    if (!eventName) return Promise.resolve();
    const payload = { ...attribution(), ...detail, event_name: eventName };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...detail });
    if (options.store === false) return Promise.resolve();

    // BDS is hosted on GitHub Pages and stores events on Cloudflare. A direct
    // CORS fetch is reliable across the two origins; cross-origin sendBeacon
    // can report success before a browser or privacy layer drops the request.
    return fetch(config.eventEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
      mode: "cors",
      credentials: "omit",
    }).catch(() => undefined);
  };

  window.LEADGEN_CONFIG = config;
  window.LeadGen = {
    getAttribution: attribution,
    trackEvent,
    trackLead: (formName) => trackEvent("generate_lead", {
      form_name: formName || "Website form",
      source: "website",
    }, { store: false }),
  };
  window.LeadGenReady = Promise.resolve();

  const start = () => {
    trackEvent("page_view", {
      page_title: document.title,
      page_location: window.location.href,
      source: "website",
    });
    document.addEventListener("click", (click) => {
      const link = click.target?.closest?.("a[href]");
      if (!link) return;
      const raw = link.getAttribute("href") || "";
      const detail = { link_text: clean(link.textContent), link_url: link.href };
      if (raw.startsWith("tel:")) trackEvent("phone_click", { ...detail, phone_number: raw.slice(4) });
      else if (raw.startsWith("mailto:")) trackEvent("email_click", { ...detail, email_address: raw.slice(7) });
      else if (/wa\.me|whatsapp\.com/i.test(link.href)) trackEvent("whatsapp_click", detail);
      else if (/contact|quote|enquir/i.test(`${raw} ${link.textContent}`)) trackEvent("quote_cta_click", detail);
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();

async function bdsLeadPayload(values, formName) {
  await window.LeadGenReady;
  return Object.assign({}, values, window.LeadGen?.getAttribution?.() || {}, {
    form_name: formName,
  });
}

async function storeBdsLead(values, formName) {
  window.LeadGen?.trackEvent?.("lead_form_submit_attempt", { form_name: formName });
  const response = await fetch(window.LEADGEN_CONFIG?.leadEndpoint || "/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await bdsLeadPayload(values, formName)),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    window.LeadGen?.trackEvent?.("lead_form_error", { form_name: formName });
    throw new Error(data.error || "Your enquiry could not be saved. Please call 07843 969254.");
  }
  window.LeadGen?.trackLead?.(formName);
  return data;
}

function installBdsHoneypot(form) {
  const trap = document.createElement("input");
  trap.type = "text";
  trap.name = "contact_time";
  trap.tabIndex = -1;
  trap.autocomplete = "off";
  trap.setAttribute("aria-hidden", "true");
  trap.style.cssText = "position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden";
  form.appendChild(trap);
  return () => trap.value;
}

document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");

  navToggle?.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.querySelectorAll(".has-dropdown").forEach((dropdown) => {
    const toggle = dropdown.querySelector(".dropdown-toggle");

    toggle?.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";

      document.querySelectorAll(".has-dropdown.open").forEach((openDropdown) => {
        if (openDropdown !== dropdown) {
          openDropdown.classList.remove("open");
          openDropdown.querySelector(".dropdown-toggle")?.setAttribute("aria-expanded", "false");
        }
      });

      toggle.setAttribute("aria-expanded", String(!expanded));
      dropdown.classList.toggle("open", !expanded);
    });
  });

  const enableInternalPagePrefetch = () => {
    const MAX_IDLE_PREFETCH_COUNT = 6;
    const prefetched = new Set();
    const prefetchProbe = document.createElement("link");
    const supportsPrefetch =
      typeof prefetchProbe.relList?.supports === "function" && prefetchProbe.relList.supports("prefetch");

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
      const links = Array.from(document.querySelectorAll("a[href]")).filter((link) =>
        normalizePath(link.getAttribute("href") || ""),
      );
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
    const honeypot = installBdsHoneypot(form);
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
        await storeBdsLead(Object.assign({}, payload, {
          service: "Free Website and SEO Audit",
          message: "Website audit requested for " + payload.website,
          contact_time: honeypot(),
        }), form.getAttribute("aria-label") || "Free SEO audit form");
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

  const FREE_AUDIT_SERVICE = "Free Website and SEO Audit";
  const setContactStatus = (form, message, isError = false) => {
    let status = form.querySelector(".contact-form-status");
    if (!status) {
      status = document.createElement("p");
      status.className = "contact-form-status";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      form.appendChild(status);
    }
    status.classList.toggle("is-error", isError);
    status.textContent = message;
  };

  document.querySelectorAll('form.form-grid[aria-label="Homepage contact form"]').forEach((form) => {
    const honeypot = installBdsHoneypot(form);
    const service = form.querySelector('select[name="service"]');
    const company = form.querySelector('input[name="company"]');
    const name = form.querySelector('input[name="name"]');
    const email = form.querySelector('input[name="email"]');
    const phone = form.querySelector('input[name="phone"]');
    const message = form.querySelector('textarea[name="message"]');
    const submit = form.querySelector('button[type="submit"]');
    if (!service || !name || !email || !message) return;

    const websiteWrap = document.createElement("div");
    websiteWrap.className = "full js-contact-website";
    websiteWrap.hidden = true;
    websiteWrap.innerHTML = '<label for="homepage-contact-website">Website URL to audit <span>(required for a free audit)</span></label><input id="homepage-contact-website" name="website" type="url" placeholder="https://yourbusiness.com" autocomplete="url" />';
    const messageWrap = message.closest(".full");
    messageWrap?.before(websiteWrap);
    const website = websiteWrap.querySelector('input[name="website"]');

    const syncAuditField = () => {
      const isAudit = service.value === FREE_AUDIT_SERVICE;
      websiteWrap.hidden = !isAudit;
      website.required = isAudit;
      if (submit) submit.textContent = isAudit ? "Run My Free Audit" : "Send Enquiry";
    };
    service.addEventListener("change", syncAuditField);
    syncAuditField();

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const values = {
        name: name.value.trim(), email: email.value.trim(), phone: phone?.value.trim() || "",
        company: company?.value.trim() || "", service: service.value,
        message: message.value.trim(), website: website?.value.trim() || "",
        contact_time: honeypot(),
      };
      const isAudit = values.service === FREE_AUDIT_SERVICE;
      submit?.setAttribute("disabled", "");
      setContactStatus(form, isAudit ? "Running your website audit. This may take up to a minute..." : "Sending your enquiry...");
      try {
        if (isAudit) {
          await storeBdsLead(Object.assign({}, values, {
            message: values.message || "Website audit requested for " + values.website,
          }), "Homepage contact form");
          const auditResponse = await fetch(`${backendOrigin}/api/audit`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: values.name,
              email: values.email,
              phone: values.phone,
              website: values.website,
              businessName: values.company || values.name,
            }),
          });
          const auditData = await auditResponse.json();
          if (!auditResponse.ok) throw new Error(auditData.error || "Unable to run your audit.");
          window.location.href = `${backendOrigin}/audit/${auditData.reportId}`;
          return;
        }
        await storeBdsLead(values, "Homepage contact form");
        form.reset();
        syncAuditField();
        setContactStatus(form, "Thanks — your enquiry has been sent. Alex will be in touch shortly.");
      } catch (error) {
        setContactStatus(form, error instanceof Error ? error.message : "Unable to send your enquiry. Please try again.", true);
      } finally {
        submit?.removeAttribute("disabled");
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
