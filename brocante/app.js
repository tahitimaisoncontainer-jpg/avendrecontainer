// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
// Replace FORMSPREE_ENDPOINT with your own endpoint to receive offers by email.
// 1. Create a free account on https://formspree.io
// 2. Create a new form, copy the endpoint URL (https://formspree.io/f/xxxxxx)
// 3. Paste it below.
// While empty, the form will fall back to a mailto: link.
const FORMSPREE_ENDPOINT = "";
const CONTACT_EMAIL = "contact@example.com";
const CURRENCY = "XPF";

// ---------------------------------------------------------------------------
// Articles catalogue (edit this list to add/remove items)
// ---------------------------------------------------------------------------
const ARTICLES = [
  {
    id: "veste-cuir-vintage",
    title: "Veste en cuir vintage",
    category: "Vêtements",
    price: 8500,
    image: "images/veste-cuir.svg",
    description: "Veste en cuir véritable, coupe ajustée, taille M. Patine d'origine, doublure intacte.",
    status: "available",
  },
  {
    id: "lampe-laiton",
    title: "Lampe de chevet en laiton",
    category: "Décoration",
    price: 4200,
    image: "images/lampe-laiton.svg",
    description: "Lampe années 70, abat-jour d'origine, câble remplacé. Hauteur 38 cm.",
    status: "available",
  },
  {
    id: "platine-vinyle",
    title: "Platine vinyle Technics SL-1200",
    category: "Audio",
    price: 35000,
    image: "images/platine-vinyle.svg",
    description: "Platine légendaire, parfait état de fonctionnement. Cellule neuve incluse.",
    status: "available",
  },
  {
    id: "table-bois",
    title: "Table basse en bois massif",
    category: "Mobilier",
    price: 18000,
    image: "images/table-bois.svg",
    description: "Table basse artisanale en teck, 120×60 cm. Légères marques d'usage.",
    status: "reserved",
  },
  {
    id: "appareil-photo",
    title: "Appareil photo argentique Canon AE-1",
    category: "Photo",
    price: 12000,
    image: "images/appareil-photo.svg",
    description: "Reflex 35 mm, objectif 50 mm f/1.8 inclus. Posemètre fonctionnel.",
    status: "available",
  },
  {
    id: "vase-ceramique",
    title: "Vase en céramique signé",
    category: "Décoration",
    price: 6500,
    image: "images/vase-ceramique.svg",
    description: "Pièce unique, signée à la base. Hauteur 28 cm, sans fêlure.",
    status: "sold",
  },
];

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
const grid = document.getElementById("grid");
const fmt = new Intl.NumberFormat("fr-FR");

function priceLabel(value) {
  return `${fmt.format(value)} ${CURRENCY}`;
}

function statusBadge(status) {
  if (status === "sold") return `<span class="badge badge-sold">Vendu</span>`;
  if (status === "reserved") return `<span class="badge badge-reserved">Réservé</span>`;
  return "";
}

function renderGrid() {
  grid.innerHTML = ARTICLES.map((a) => {
    const disabled = a.status === "sold";
    const cta = disabled ? "Indisponible" : "Faire une offre →";
    return `
      <article class="card" data-id="${a.id}" ${disabled ? 'aria-disabled="true"' : ""}>
        <div class="card-media" style="background-image:url('${a.image}')">
          ${statusBadge(a.status)}
        </div>
        <div class="card-body">
          <span class="card-cat">${a.category}</span>
          <h3 class="card-title">${a.title}</h3>
          <div class="card-foot">
            <span class="card-price">${priceLabel(a.price)}</span>
            <span class="card-cta">${cta}</span>
          </div>
        </div>
      </article>
    `;
  }).join("");

  grid.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      const article = ARTICLES.find((a) => a.id === id);
      if (article && article.status !== "sold") openModal(article);
    });
  });
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
const modal = document.getElementById("modal");
const mTitle = document.getElementById("modal-title");
const mPrice = document.getElementById("m-price");
const mDesc = document.getElementById("m-desc");
const mImage = document.getElementById("m-image");
const fArticle = document.getElementById("f-article");
const fListed = document.getElementById("f-listed");
const fOffer = document.getElementById("f-offer");
const form = document.getElementById("offer-form");
const status = document.getElementById("form-status");

function openModal(article) {
  mTitle.textContent = article.title;
  mPrice.textContent = priceLabel(article.price);
  mDesc.textContent = article.description;
  mImage.src = article.image;
  mImage.alt = article.title;
  fArticle.value = article.title;
  fListed.value = article.price;
  fOffer.value = article.price;
  fOffer.max = article.price * 2;
  status.textContent = "";
  status.className = "form-status";
  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
  form.reset();
}

modal.addEventListener("click", (e) => {
  if (e.target.matches("[data-close]")) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.hidden) closeModal();
});

// ---------------------------------------------------------------------------
// Offer submission
// ---------------------------------------------------------------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  status.textContent = "";
  status.className = "form-status";

  const data = Object.fromEntries(new FormData(form).entries());

  if (!FORMSPREE_ENDPOINT) {
    // Fallback: open a pre-filled mailto so the offer still reaches the seller.
    const subject = encodeURIComponent(`Offre — ${data.article}`);
    const body = encodeURIComponent(
      `Article : ${data.article}\n` +
      `Prix affiché : ${priceLabel(Number(data.prix_affiche))}\n` +
      `Offre proposée : ${priceLabel(Number(data.offre))}\n\n` +
      `Nom : ${data.nom}\n` +
      `Téléphone : ${data.telephone}\n` +
      `Email : ${data.email}\n\n` +
      `Message :\n${data.message || "(aucun)"}\n`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    status.textContent = "Ouvre votre messagerie pour confirmer l'envoi…";
    status.classList.add("success");
    return;
  }

  try {
    status.textContent = "Envoi en cours…";
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    status.textContent = "Offre envoyée. Nous vous recontactons sous 24 h.";
    status.classList.add("success");
    setTimeout(closeModal, 1800);
  } catch (err) {
    status.textContent = "Erreur d'envoi. Réessayez ou contactez-nous directement.";
    status.classList.add("error");
  }
});

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
renderGrid();
