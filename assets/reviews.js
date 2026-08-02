document.addEventListener("DOMContentLoaded", () => {
  const FIREBASE_BACKEND_ORIGIN = "https://bds-site--bdssite-5fac1.europe-west4.hosted.app";
  const isLocalDev = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const backendOrigin = isLocalDev && window.location.port !== "3100"
    ? "http://127.0.0.1:3100"
    : isLocalDev
      ? ""
      : FIREBASE_BACKEND_ORIGIN;
  const apiUrl = `${backendOrigin}/api/reviews`;

  const slider = document.querySelector("#reviews-slider");
  const slide = document.querySelector("#reviews-slide");
  const dots = document.querySelector("#reviews-dots");
  const previous = document.querySelector("#reviews-previous");
  const next = document.querySelector("#reviews-next");
  const summary = document.querySelector("#google-review-summary");
  const formPanel = document.querySelector("#review-form-panel");
  const form = document.querySelector("#review-form");
  const openButtons = document.querySelectorAll(".reviews-open-form");
  const closeButton = document.querySelector(".review-form-close");
  const googleReviewButton = document.querySelector(".reviews-google-button");
  const googleProfileLinks = document.querySelectorAll(".reviews-google-profile");

  let reviews = [];
  let activeIndex = 0;
  let autoplayTimer;

  const setFormOpen = (isOpen) => {
    if (!formPanel) return;
    formPanel.hidden = !isOpen;
    openButtons.forEach((button) => button.setAttribute("aria-expanded", String(isOpen)));
    if (isOpen) {
      formPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => form?.querySelector('input[name="name"]')?.focus(), 350);
    }
  };

  openButtons.forEach((button) => button.addEventListener("click", () => setFormOpen(true)));
  closeButton?.addEventListener("click", () => setFormOpen(false));

  const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime()) || date.getTime() === 0) return "";
    return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(date);
  };

  const renderReview = () => {
    if (!slide || !dots) return;
    slide.replaceChildren();
    dots.replaceChildren();

    if (!reviews.length) {
      const empty = document.createElement("div");
      empty.className = "reviews-empty";
      const heading = document.createElement("h3");
      heading.textContent = "Be the first to leave a review";
      const copy = document.createElement("p");
      copy.textContent = "Share a short description of your experience with Bryant Digital Solutions.";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "hero-cta reviews-empty-button";
      button.textContent = "Leave a Review";
      button.addEventListener("click", () => setFormOpen(true));
      empty.append(heading, copy, button);
      slide.append(empty);
      previous?.setAttribute("disabled", "");
      next?.setAttribute("disabled", "");
      return;
    }

    activeIndex = (activeIndex + reviews.length) % reviews.length;
    const review = reviews[activeIndex];
    const article = document.createElement("article");
    article.className = "reviews-featured-card";

    const meta = document.createElement("div");
    meta.className = "reviews-featured-meta";
    const source = document.createElement("span");
    source.className = `review-source review-source-${review.source}`;
    source.textContent = review.source === "google" ? "Google Review" : "Website Review";
    meta.append(source);

    if (review.rating) {
      const stars = document.createElement("span");
      stars.className = "review-stars";
      stars.setAttribute("aria-label", `${review.rating} out of 5 stars`);
      stars.textContent = `${"★".repeat(Math.round(review.rating))}${"☆".repeat(5 - Math.round(review.rating))}`;
      meta.append(stars);
    }

    const quote = document.createElement("blockquote");
    quote.textContent = review.description;
    const author = document.createElement("p");
    author.className = "reviews-featured-author";
    author.textContent = review.name;
    const date = document.createElement("p");
    date.className = "reviews-featured-date";
    date.textContent = formatDate(review.createdAt);
    article.append(meta, quote, author, date);
    slide.append(article);

    reviews.forEach((item, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "reviews-dot";
      dot.setAttribute("aria-label", `Show review ${index + 1} of ${reviews.length}`);
      dot.setAttribute("aria-current", String(index === activeIndex));
      dot.addEventListener("click", () => {
        activeIndex = index;
        renderReview();
        restartAutoplay();
      });
      dots.append(dot);
    });

    if (reviews.length > 1) {
      previous?.removeAttribute("disabled");
      next?.removeAttribute("disabled");
    } else {
      previous?.setAttribute("disabled", "");
      next?.setAttribute("disabled", "");
    }
  };

  const move = (direction) => {
    if (reviews.length < 2) return;
    activeIndex = (activeIndex + direction + reviews.length) % reviews.length;
    renderReview();
  };

  const stopAutoplay = () => window.clearInterval(autoplayTimer);
  const restartAutoplay = () => {
    stopAutoplay();
    if (reviews.length > 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      autoplayTimer = window.setInterval(() => move(1), 6500);
    }
  };

  previous?.addEventListener("click", () => { move(-1); restartAutoplay(); });
  next?.addEventListener("click", () => { move(1); restartAutoplay(); });
  slider?.addEventListener("mouseenter", stopAutoplay);
  slider?.addEventListener("mouseleave", restartAutoplay);
  slider?.addEventListener("focusin", stopAutoplay);
  slider?.addEventListener("focusout", restartAutoplay);

  const loadReviews = async () => {
    try {
      const response = await fetch(apiUrl, { headers: { Accept: "application/json" } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Reviews could not be loaded.");
      reviews = Array.isArray(data.reviews) ? data.reviews : [];
      const profileUrl = data.google?.profileUrl;
      if (profileUrl) googleProfileLinks.forEach((link) => { link.href = profileUrl; });
      if (data.google?.writeReviewUrl && googleReviewButton) {
        googleReviewButton.href = data.google.writeReviewUrl;
      }

      if (summary) {
        if (data.google?.rating && data.google?.totalReviewCount) {
          summary.textContent = `${data.google.rating.toFixed(1)} ★ from ${data.google.totalReviewCount} Google reviews`;
        } else {
          summary.textContent = `${reviews.length} customer review${reviews.length === 1 ? "" : "s"}`;
        }
      }
      renderReview();
      restartAutoplay();
    } catch (error) {
      if (summary) summary.textContent = "Reviews temporarily unavailable";
      if (slide) {
        slide.replaceChildren();
        const message = document.createElement("p");
        message.className = "reviews-error";
        message.textContent = error.message || "Reviews could not be loaded. Please try again.";
        slide.append(message);
      }
    }
  };

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const status = form.querySelector(".review-form-status");
    const submit = form.querySelector(".review-submit");
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      website: String(formData.get("website") || ""),
    };

    submit?.setAttribute("disabled", "");
    if (status) {
      status.classList.remove("is-error", "is-success");
      status.textContent = "Publishing your review…";
    }

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Your review could not be saved.");
      reviews.unshift(data.review);
      activeIndex = 0;
      renderReview();
      restartAutoplay();
      form.reset();
      if (status) {
        status.classList.add("is-success");
        status.textContent = "Thank you. Your review is now live.";
      }
      window.setTimeout(() => {
        setFormOpen(false);
        slider?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 1200);
    } catch (error) {
      if (status) {
        status.classList.add("is-error");
        status.textContent = error.message || "Your review could not be saved. Please try again.";
      }
    } finally {
      submit?.removeAttribute("disabled");
    }
  });

  loadReviews();
});
