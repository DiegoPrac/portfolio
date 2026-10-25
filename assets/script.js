// JavaScript dasar: selector, variabel, event, array, dan manipulasi DOM.
const menuButton = document.querySelector("#menu-button");
const navigation = document.querySelector("#navigation");
const list = document.querySelector("#project-list");
const filters = document.querySelector("#project-filters");
const dialog = document.querySelector("#project-dialog");
const dialogContent = document.querySelector("#dialog-content");
let projects = [];
let activeFilter = "all";
let lastDetailButton;

document.body.classList.add("js-ready");
menuButton.hidden = false;
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  navigation.classList.toggle("is-open", open);
});
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuButton.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("is-open")) {
    navigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.focus();
  }
});
document.querySelector("#year").textContent = new Date().getFullYear();

// Memakai textContent agar isi data tidak dianggap sebagai kode HTML.
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}
function externalLink(text, url) {
  const link = element("a", "text-link", text);
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}
function tags(items) {
  const ul = element("ul", "tags");
  items.forEach((item) => ul.append(element("li", "", item)));
  return ul;
}
function renderProjects() {
  const selected = projects.filter(
    (project) => activeFilter === "all" || project.category === activeFilter,
  );
  list.replaceChildren();
  selected.forEach((project) => {
    const card = element("article", "project-card");
    const tone = {
      web: "image-bombo",
      desktop: "image-bibit",
      cli: "image-agro",
    };
    const imageBox = element("div", "project-image " + tone[project.category]);
    const image = element("img");
    image.src = project.image;
    image.alt = project.alt;
    image.loading = "lazy";
    image.width = 940;
    image.height = 500;
    imageBox.append(image);
    const content = element("div", "project-content");
    const number = String(projects.indexOf(project) + 1).padStart(2, "0");
    content.append(
      element("p", "eyebrow", number + " / " + project.label),
      element("h3", "", project.title),
      element("p", "", project.description),
      tags(project.tech),
    );
    const actions = element("div", "project-actions");
    actions.append(
      externalLink(
        project.demo ? "Kunjungi website ↗" : "Lihat repository ↗",
        project.demo || project.repository,
      ),
    );
    const detail = element("button", "detail-button", "Detail proyek +");
    detail.type = "button";
    detail.setAttribute("aria-label", "Detail proyek " + project.title);
    detail.addEventListener("click", () => {
      lastDetailButton = detail;
      showDetail(project);
    });
    actions.append(detail);
    content.append(actions);
    card.append(imageBox, content);
    list.append(card);
  });
  document.querySelector("#project-count").textContent =
    selected.length + " proyek";
}
function showDetail(project) {
  dialogContent.replaceChildren();
  const heading = element("h2", "", project.title);
  heading.id = "dialog-title";
  const image = element("img");
  image.src = project.image;
  image.alt = project.alt;
  const features = element("ul");
  project.features.forEach((feature) =>
    features.append(element("li", "", feature)),
  );
  dialogContent.append(
    element("p", "eyebrow", project.label),
    heading,
    element("p", "", project.description),
    image,
    tags(project.tech),
    element("h3", "", "Peran: " + project.role),
    element("h3", "", "Yang dikerjakan"),
    features,
    element("h3", "", "Yang dipelajari"),
    element("p", "", project.learning),
  );
  if (project.id === "mybibit") {
    const login = element("img");
    login.src = "assets/mybibit-login.png";
    login.alt = "Dokumentasi halaman login MyBibit";
    dialogContent.append(login);
  }
  if (project.note)
    dialogContent.append(element("p", "dialog-note", project.note));
  const links = element("div", "dialog-links");
  links.append(externalLink("Repository GitHub ↗", project.repository));
  if (project.demo)
    links.append(externalLink("Website langsung ↗", project.demo));
  dialogContent.append(links);
  dialog.showModal();
}
document
  .querySelector("#dialog-close")
  .addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const box = dialog.getBoundingClientRect();
    if (
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom
    )
      dialog.close();
  }
});
dialog.addEventListener("close", () => lastDetailButton?.focus());
filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  activeFilter = button.dataset.filter;
  filters.querySelectorAll("button").forEach((item) => {
    item.classList.toggle("active", item === button);
    item.setAttribute("aria-pressed", String(item === button));
  });
  renderProjects();
});

// Fetch API + async/await. Bila gagal, tiga kartu HTML awal tetap bisa dibaca.
async function loadProjects() {
  list.setAttribute("aria-busy", "true");
  try {
    const endpoint = document.body.dataset.projectsUrl || "data/projects.json";
    const embedded = document.querySelector("#project-data");
    const response = embedded
      ? { ok: true, json: async () => JSON.parse(embedded.textContent) }
      : await fetch(endpoint);
    if (!response.ok) throw new Error("Data proyek belum tersedia.");
    projects = await response.json();
    renderProjects();
    filters.hidden = false;
  } catch (error) {
    document.querySelector("#project-status").textContent =
      "Mode ringkas ditampilkan. Tautan proyek tetap bisa dibuka.";
  } finally {
    list.setAttribute("aria-busy", "false");
  }
}
loadProjects();

const copyButton = document.querySelector("#copy-email");
copyButton.hidden = false;
copyButton.addEventListener("click", async () => {
  const status = document.querySelector("#copy-status");
  try {
    await navigator.clipboard.writeText("diegovalentino197@gmail.com");
    status.textContent = "Alamat email berhasil disalin.";
  } catch {
    status.textContent = "Salin manual: diegovalentino197@gmail.com";
  }
});

const form = document.querySelector("#contact-form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();
  const message = form.elements.message.value.trim();
  const status = document.querySelector("#contact-status");
  if (!name || message.length < 10) {
    status.textContent = "Isi nama dan pesan minimal 10 karakter.";
    return;
  }
  // Versi Laravel menyimpan pesan melalui POST dengan CSRF; versi statis membuka email.
  if (form.dataset.mode === "server") {
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    status.textContent = "Mengirim pesan...";
    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          response.status === 429
            ? "Terlalu banyak pesan. Coba lagi nanti."
            : error.message || "Pesan belum tersimpan. Coba lagi.",
        );
      }
      status.textContent =
        "Pesan tersimpan. Terima kasih sudah menghubungi saya.";
      form.reset();
    } catch (error) {
      status.textContent = error.message;
    } finally {
      submit.disabled = false;
    }
    return;
  }
  const subject = encodeURIComponent("Kontak portofolio dari " + name);
  const body = encodeURIComponent(
    "Nama: " + name + "\nEmail: " + email + "\n\n" + message,
  );
  window.location.href =
    "mailto:diegovalentino197@gmail.com?subject=" + subject + "&body=" + body;
  status.textContent =
    "Draf dibuka di aplikasi email. Jika tidak terbuka, gunakan tautan email di sebelah formulir.";
});
