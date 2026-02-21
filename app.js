let map;
let markers = [];
let cafesData = []; // guardamos todos los cafés

async function fetchCafes() {
  const res = await fetch("cafes.json");
  const cafes = await res.json();
  cafesData = cafes; // guardamos para búsqueda en tiempo real
  return cafes;
}

function initMap() {
  const mendoza = { lat: -32.8895, lng: -68.8458 };

  map = new google.maps.Map(document.getElementById("map"), {
    center: mendoza,
    zoom: 13,
    restriction: {
      latLngBounds: {
        north: -32.85,
        south: -32.95,
        east: -68.80,
        west: -68.90
      },
      strictBounds: true
    }
  });

  loadCafes();

  // Búsqueda en tiempo real
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("keyup", () => {
    const query = searchInput.value.toLowerCase();
    filterCafes(query);
  });
}

async function loadCafes() {
  const cafes = await fetchCafes();
  displayCafes(cafes);
  addMarkers(cafes);
}

function displayCafes(cafes) {
  const container = document.getElementById("cafes");
  container.innerHTML = "";

  cafes.forEach(cafe => {
    const div = document.createElement("div");
    div.className = "cafe-card";

    const imgSrc = cafe.photos && cafe.photos[0] ? cafe.photos[0].thumbnail : "https://via.placeholder.com/100";

    div.innerHTML = `
      <img src="${imgSrc}" alt="${cafe.title}">
      <div class="cafe-info">
        <h3>${cafe.title}</h3>
        <p>${cafe.address}</p>
        <p>Rating: ${cafe.rating} (${cafe.reviews} reviews)</p>
        <a href="${cafe.website}" target="_blank">Sitio web</a>
      </div>
    `;
    container.appendChild(div);
  });
}

function addMarkers(cafes) {
  // Eliminamos markers antiguos
  markers.forEach(m => m.setMap(null));
  markers = [];

  cafes.forEach(cafe => {
    const marker = new google.maps.Marker({
      position: { lat: cafe.gps_coordinates.latitude, lng: cafe.gps_coordinates.longitude },
      map,
      title: cafe.title
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `<h3>${cafe.title}</h3><p>${cafe.address}</p><p>Rating: ${cafe.rating}</p>`
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    markers.push(marker);
  });
}

// Función de filtrado en tiempo real
function filterCafes(query) {
  if (!query) {
    displayCafes(cafesData);
    addMarkers(cafesData);
    return;
  }

  const filtered = cafesData.filter(cafe =>
    cafe.title.toLowerCase().includes(query)
  );
  displayCafes(filtered);
  addMarkers(filtered);
}