// Tema, gerakan ringan, dan galeri sertifikat. Tidak memerlukan library animasi.
const themeButton = document.querySelector("#theme-button");
const themeRoot = document.documentElement;
try {
  themeRoot.dataset.theme = localStorage.getItem("diego-theme") || "dark";
} catch {}
function updateThemeButton() {
  const dark = themeRoot.dataset.theme === "dark";
  themeButton.textContent = dark ? "☀" : "☾";
  themeButton.setAttribute(
    "aria-label",
    dark ? "Ganti ke tema terang" : "Ganti ke tema gelap",
  );
}
themeButton.hidden = false;
updateThemeButton();
themeButton.addEventListener("click", () => {
  themeRoot.dataset.theme =
    themeRoot.dataset.theme === "dark" ? "light" : "dark";
  try {
    localStorage.setItem("diego-theme", themeRoot.dataset.theme);
  } catch {}
  updateThemeButton();
});
const motionButton = document.querySelector("#motion-button");
const technologyTrack = document.querySelector("#technology-track");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let motionPaused = reducedMotion.matches;
let technologyVisible = true;
let pageVisible = !document.hidden;
function updateMotion() {
  technologyTrack.classList.toggle("is-paused", motionPaused || !technologyVisible || !pageVisible);
  motionButton.setAttribute("aria-pressed", String(motionPaused));
  motionButton.textContent = motionPaused
    ? "Putar animasi ▷"
    : "Jeda animasi Ⅱ";
}
motionButton.hidden = false;
updateMotion();
motionButton.addEventListener("click", () => {
  motionPaused = !motionPaused;
  updateMotion();
});
reducedMotion.addEventListener("change", (event) => {
  motionPaused = event.matches;
  updateMotion();
});
if (!reducedMotion.matches && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 },
  );
  document
    .querySelectorAll(
      ".section-heading, .about-layout, .skills-layout, .award-feature",
    )
    .forEach((section) => {
      section.classList.add("reveal-ready");
      observer.observe(section);
    });
}

// Hentikan animasi saat di luar layar atau tab tidak aktif.
if ('IntersectionObserver' in window) {
  const motionObserver = new IntersectionObserver(entries => {
    technologyVisible = entries[0].isIntersecting;
    updateMotion();
  }, {rootMargin:'80px'});
  motionObserver.observe(document.querySelector('.technology-section'));
}
document.addEventListener('visibilitychange', () => {
  pageVisible = !document.hidden;
  updateMotion();
});

let certificates = [];
let certificateCategory = "all";
let certificateFocus;
const certificateList = document.querySelector("#certificate-list");
const certificateFilters = document.querySelector("#certificate-filters");
const certificateDialog = document.querySelector("#project-dialog");
function renderCertificates() {
  const selected = certificates.filter(
    (cert) =>
      certificateCategory === "all" || cert.category === certificateCategory,
  );
  certificateList.replaceChildren();
  selected.forEach((cert) => {
    const card = element("article", "certificate-card");
    const cover = element("a", "certificate-cover");
    cover.href = cert.file;
    cover.target = "_blank";
    cover.rel = "noopener";
    const image = element("img");
    image.src = cert.image;
    image.loading = "lazy";
    image.decoding = "async";
    image.alt = "Pratinjau sertifikat " + cert.title;
    image.width = 1200;
    image.height = 850;
    cover.append(
      image,
      element("span", "certificate-view", "Lihat dokumen ↗"),
    );
    cover.addEventListener("click", (event) => {
      event.preventDefault();
      showCertificate(cert, cover);
    });
    const copy = element("div", "certificate-copy");
    copy.append(
      element("span", "certificate-category", cert.category),
      element("h3", "", cert.title),
      element("p", "", cert.issuer),
      element("time", "", cert.date),
      element("p", "certificate-note", cert.note),
    );
    card.append(cover, copy);
    certificateList.append(card);
  });
  document.querySelector("#certificate-count").textContent =
    selected.length + " dokumen";
}
function showCertificate(cert, trigger) {
  certificateFocus = trigger;
  const content = document.querySelector("#dialog-content");
  content.replaceChildren();
  const title = element("h2", "", cert.title);
  title.id = "dialog-title";
  const image = element("img", "certificate-dialog-image");
  image.src = cert.image;
  image.alt = "Sertifikat " + cert.title;
  const original = element("a", "text-link", "Buka dokumen asli ↗");
  original.href = cert.file;
  original.target = "_blank";
  original.rel = "noopener";
  const download = element("a", "text-link", "Unduh dokumen ↓");
  download.href = cert.file;
  download.download = cert.id + (cert.file.endsWith(".pdf") ? ".pdf" : ".jpg");
  const actions = element("div", "dialog-links");
  actions.append(original, download);
  content.append(
    element("p", "eyebrow", cert.issuer + " · " + cert.date),
    title,
    image,
    element("p", "", cert.note),
    actions,
  );
  certificateDialog.showModal();
}
certificateDialog.addEventListener("close", () => {
  if (certificateFocus) {
    certificateFocus.focus();
    certificateFocus = null;
  }
});
certificateFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  certificateCategory = button.dataset.category;
  certificateFilters.querySelectorAll("button").forEach((item) => {
    item.classList.toggle("active", item === button);
    item.setAttribute("aria-pressed", String(item === button));
  });
  renderCertificates();
});
async function loadCertificates() {
  try {
    const embedded = document.querySelector("#certificate-data");
    if (embedded) certificates = JSON.parse(embedded.textContent);
    else {
      const response = await fetch("data/certificates.json", { cache: "no-cache" });
      if (!response.ok) throw new Error();
      certificates = await response.json();
    }
    renderCertificates();
    certificateFilters.hidden = false;
  } catch {
    document.querySelector("#certificate-status").textContent =
      "Galeri ringkas ditampilkan. Dokumen asli tetap bisa dibuka.";
  }
}
loadCertificates();
