// main.js (patched)

const $ = {
  grid: document.getElementById("toolGrid"),
  search: document.getElementById("search"),
  category: document.getElementById("category"),
  toggleFavs: document.getElementById("toggleFavs")
};

let showFavorites = false;
let tools = [];
const favorites = new Set(JSON.parse(localStorage.getItem("favorites") || "[]"));

function displayTools(filter = "", category = "") {
  $.grid.innerHTML = "";
  const filtered = tools.filter(t => {
    const match = t.name.toLowerCase().includes(filter.toLowerCase()) && (!category || t.category === category);
    return showFavorites ? favorites.has(t.name) && match : match;
  });
  if (filtered.length === 0) {
    $.grid.innerHTML = `<div style="text-align:center;opacity:0.6;padding:2rem">😕 No tools found.</div>`;
    return;
  }

  filtered.forEach(tool => {
    const isFav = favorites.has(tool.name);
    const badge = `<span class="badge">${categoryEmoji(tool.category)} ${tool.category}</span>`;
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <button class="fav-btn ${isFav ? 'favorited' : ''}" onclick="toggleFavorite('${tool.name}', this)">★</button>
      ${badge}
      <h2>${tool.name}</h2>
      <p>${tool.desc}</p>
      <a href="${tool.link}" target="_blank">Visit →</a>
    `;
    $.grid.appendChild(card);
  });
}

function toggleFavorite(name, el) {
  if (favorites.has(name)) {
    favorites.delete(name);
    el.classList.remove("favorited");
  } else {
    favorites.add(name);
    el.classList.add("favorited");
  }
  localStorage.setItem("favorites", JSON.stringify([...favorites]));
}

function updateCategoryOptions() {
  const cats = [...new Set(tools.map(t => t.category))];
  $.category.innerHTML = '<option value="">All Categories</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join("");
}

function categoryEmoji(cat) {
  return {
    Chat: "💬",
    Image: "🖼️",
    Video: "🎬",
    Code: "💻",
    Writing: "📝",
    Voice: "🎤",
    SEO: "📈",
    Research: "🔍",
    Design: "🎨",
    Music: "🎵",
    Website: "🌐",
    Productivity: "🧠",
    Meeting: "📅",
    Presentation: "📊"
  }[cat] || "✨";
}

document.addEventListener("DOMContentLoaded", () => {
  $.search.addEventListener("input", () => displayTools($.search.value, $.category.value));
  $.category.addEventListener("change", () => displayTools($.search.value, $.category.value));
  $.toggleFavs.addEventListener("click", () => {
    showFavorites = !showFavorites;
    displayTools($.search.value, $.category.value);
    $.toggleFavs.textContent = showFavorites ? "⭐ All Tools" : "⭐ Favorites Only";
  });

  fetch("tools.json")
    .then(res => res.json())
    .then(data => {
      tools = data;
      updateCategoryOptions();
      displayTools();
    })
    .catch(err => {
      $.grid.innerHTML = `<div style='text-align:center;padding:2rem;color:#888;'>⚠️ Failed to load tools. Please check your connection.</div>`;
    });
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

window.addEventListener("offline", () => showToast("🔌 You are offline", "#f87171"));
window.addEventListener("online", () => showToast("✅ Back online", "#34d399"));

function showToast(message, bg = "#333") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.background = bg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}
