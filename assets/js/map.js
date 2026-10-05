// Brava Home Care — mapa de la zona de servicio (Leaflet + OpenStreetMap, sin cookies)
//
// Textos por idioma: atributo data-i18n del elemento #service-map.
// Botones de municipios: .area__towns button[data-town], con el nombre exacto de TOWNS.

const ROSES = [42.2627, 3.1766];
const RADIUS_METERS = 15000; // Zona de servicio: 15 km en línea recta alrededor de Roses

// Municipios dentro de los 15 km (distancia en línea recta desde el centro de Roses).
const TOWNS = {
  "Roses": ROSES,
  "Empuriabrava": [42.247, 3.121],
  "Palau-saverdera": [42.303, 3.165],
  "Castelló d'Empúries": [42.2577, 3.0744],
  "Cadaqués": [42.2886, 3.2779],
  "El Port de la Selva": [42.3369, 3.2044],
  "Llançà": [42.364, 3.153],
  "Sant Pere Pescador": [42.188, 3.082],
  "Pau": [42.3157, 3.1167],
  "Vilajuïga": [42.326, 3.091],
};

const mapEl = document.querySelector("#service-map");

if (mapEl && window.L) {
  const t = JSON.parse(mapEl.dataset.i18n);
  const isTouch = window.matchMedia("(pointer: coarse)").matches;

  mapEl.innerHTML = "";

  const map = L.map(mapEl, {
    zoomSnap: 0.25, // permite un encuadre más ajustado al círculo
    scrollWheelZoom: false, // la rueda no hace zoom hasta hacer clic en el mapa
    dragging: !isTouch, // en móvil, un dedo desplaza la página; dos dedos mueven el mapa
  });

  // Encuadre inicial: todo el círculo de la zona de servicio.
  map.fitBounds(L.latLng(ROSES).toBounds(RADIUS_METERS * 2), { padding: [10, 10] });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 17,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
  }).addTo(map);

  L.circle(ROSES, {
    radius: RADIUS_METERS,
    color: "#b8955a",
    weight: 2,
    dashArray: "6 6",
    fillColor: "#b8955a",
    fillOpacity: 0.12,
    interactive: false,
  }).addTo(map);

  // Marcadores
  const markers = {};
  for (const [name, latlng] of Object.entries(TOWNS)) {
    const main = name === "Roses";
    const icon = L.divIcon({
      className: "",
      html: `<span class="map-pin${main ? " map-pin--main" : ""}"></span>`,
      iconSize: main ? [22, 22] : [16, 16],
      iconAnchor: main ? [11, 11] : [8, 8],
      popupAnchor: [0, main ? -12 : -9],
    });
    const popup = `
      <strong class="map-popup__title">${name}</strong>
      <span class="map-popup__text">${t.here}</span>
      <a class="map-popup__cta" href="${t.contactHref}" data-fill-town="${name}">${t.cta} →</a>`;
    markers[name] = L.marker(latlng, { icon, title: name, keyboard: true }).bindPopup(popup).addTo(map);
  }

  // Aviso de cómo interactuar; desaparece al activar el mapa.
  const hint = document.createElement("div");
  hint.className = "map-hint";
  hint.textContent = isTouch ? t.hintTouch : t.hintClick;
  mapEl.appendChild(hint);

  if (!isTouch) {
    map.on("click focus", () => {
      map.scrollWheelZoom.enable();
      hint.classList.add("is-hidden");
    });
    map.on("mouseout blur", () => map.scrollWheelZoom.disable());
  } else {
    map.on("zoomstart", () => hint.classList.add("is-hidden"));
  }

  // Botones de municipios: centran el mapa y abren la ventana del municipio.
  document.querySelectorAll(".area__towns button[data-town]").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.town;
      const marker = markers[name];
      if (!marker) return;

      document.querySelectorAll(".area__towns button").forEach((b) => b.setAttribute("aria-pressed", "false"));
      button.setAttribute("aria-pressed", "true");

      map.flyTo(marker.getLatLng(), 13, { duration: 0.8 });
      map.once("moveend", () => marker.openPopup());

      // En móvil el mapa está debajo de la lista: lo traemos a la vista.
      const rect = mapEl.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        mapEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  });
}

// "Pide información" en la ventana de un municipio: rellena la población en el formulario.
document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-fill-town]");
  if (!link) return;
  const input = document.querySelector("#contact-form input[name='town']");
  if (input) input.value = link.dataset.fillTown;
});
