// Brava Home Care — comportamiento compartido (es / en)

// Datos de contacto, codificados en base64 para que no aparezcan en el HTML ni en texto plano
// y los robots que no ejecutan JavaScript no puedan recogerlos.
// Para cambiarlos: printf '%s' "+34 6xx xxx xxx" | base64
// PROVISIONALES: sustituir por los definitivos.
const PHONE = atob("KzM0IDY3NiA1MSA2MSAzNw==");
const EMAIL_DOMAIN = atob("YnJhdmFob21lY2FyZS5lcw==");
const WHATSAPP_NUMBER = PHONE.replace(/\D/g, "");

// Rellena los enlaces marcados con data-contact.
document.querySelectorAll("[data-contact]").forEach((el) => {
  const type = el.dataset.contact;

  if (type === "whatsapp") {
    el.href = `https://wa.me/${WHATSAPP_NUMBER}`;
    el.target = "_blank";
    el.rel = "noopener";
    if (el.dataset.showNumber !== undefined) el.textContent = PHONE;
  } else if (type === "email") {
    const email = `${el.dataset.user}@${EMAIL_DOMAIN}`;
    el.href = `mailto:${email}`;
    el.textContent = email;
  }
});

// Menú móvil
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll("a[href^='#']").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Formulario: compone un mensaje y lo abre en WhatsApp (no hay servidor todavía).
const form = document.querySelector("#contact-form");

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const labels = JSON.parse(form.dataset.labels);
    const data = new FormData(form);
    const lines = [labels.intro, ""];

    for (const [key, value] of data.entries()) {
      if (value && labels[key]) lines.push(`${labels[key]}: ${value}`);
    }

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener");
  });
}

// Año del pie de página
const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

// Botones "Me interesa" de los planes: preseleccionan el plan en el formulario.
document.querySelectorAll("[data-plan]").forEach((button) => {
  button.addEventListener("click", () => {
    const select = document.querySelector("#contact-form select[name='plan']");
    if (select) select.value = button.dataset.plan;
  });
});
