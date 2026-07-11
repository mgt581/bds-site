document.addEventListener("DOMContentLoaded", () => {
  const aiToggle = document.querySelector("#ai-chat-toggle");
  const aiPopup = document.querySelector("#ai-chat-popup");
  const aiForm = document.querySelector("#ai-chat-form");
  const aiInput = document.querySelector("#ai-chat-input");
  const aiBody = document.querySelector("#ai-chat-body");
  const AUTO_OPEN_KEY = "bds_ai_auto_opened";

  const openChat = () => {
    aiPopup?.removeAttribute("hidden");
    aiToggle?.setAttribute("aria-expanded", "true");
  };

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
