// main.js — final version with favorites, overlay, PWA, and UI sync
document.addEventListener("DOMContentLoaded", () => {
  const $ = {
    grid: document.getElementById("toolGrid"),
    search: document.getElementById("search"),
    category: document.getElementById("category"),
    toggleFavs: document.getElementById("toggleFavs")
  };

  const overlay = document.getElementById("introOverlay");
  const enterBtn = document.getElementById("enterBtn");
  let tools = [];
  let showFavorites = false;
  const favorites = new Set(JSON.parse(localStorage.getItem("favorites") || "[]"));

  function displayTools(filter = "", category = "") {
    $.grid.innerHTML = "";
    const filtered = tools.filter(t => {
      const match = t.name.toLowerCase().includes(filter.toLowerCase()) && (!category || t.category === category);
      return showFavorites ? favorites.has(t.name) && match : match;
    });
    if (filtered.length === 0) return;
    filtered.forEach(tool => {
      const card = document.createElement("div");
      card.className = "card";
      const isFav = favorites.has(tool.name);
      const favClass = isFav ? 'favorited' : '';
      card.innerHTML = `
        <button class="fav-btn ${favClass}" onclick="toggleFavorite('${tool.name}', this)">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        </button>
        <h2>${tool.name}</h2>
        <p>${tool.desc}</p>
        <a href="${tool.link}" target="_blank">Visit →</a>
      `;
      $.grid.appendChild(card);
    });
  }

  window.toggleFavorite = function(name, el) {
    if (favorites.has(name)) {
      favorites.delete(name);
      el.classList.remove("favorited");
    } else {
      favorites.add(name);
      el.classList.add("favorited");
    }
    localStorage.setItem("favorites", JSON.stringify([...favorites]));
  };

  function updateCategoryOptions() {
    const cats = [...new Set(tools.map(t => t.category))];
    $.category.innerHTML = '<option value="">All Categories</option>' +
      cats.map(cat => `<option value="${cat}">${cat}</option>`).join("");
  }

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
      document.getElementById("loader").style.display = "none";
    })
    .catch(() => {
      document.getElementById("loader").style.display = "none";
      $.grid.innerHTML = `<div style='text-align:center;padding:2rem;color:#999;'>⚠️ Couldn't load tools</div>`;
    });

  enterBtn.addEventListener("click", () => {
    overlay.classList.add("fade-out");
    setTimeout(() => overlay.remove(), 500);
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("introLastSeen", today);
  });

  const today = new Date().toISOString().split("T")[0];
  const lastSeen = localStorage.getItem("introLastSeen");
  if (lastSeen !== today) {
    overlay.style.display = "flex";
  } else {
    overlay.remove();
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("service-worker.js");
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    const wrapper = document.createElement("div");
    wrapper.style = "position:fixed;bottom:1rem;left:50%;transform:translateX(-50%);z-index:999;background:#a78bfa;color:white;border:none;padding:0.75rem 1.2rem;border-radius:1rem;font-size:1rem;box-shadow:0 2px 6px rgba(0,0,0,0.2);display:flex;align-items:center;gap:1rem;";

    const btn = document.createElement("button");
    btn.textContent = "📲 Install App";
    btn.style = "background:none;color:white;border:none;font-size:1rem;cursor:pointer;";

    const close = document.createElement("span");
    close.textContent = "✖";
    close.style = "cursor:pointer;font-size:1.2rem;";
    close.onclick = () => wrapper.remove();

    btn.onclick = async () => {
      wrapper.remove();
      e.prompt();
      await e.userChoice;
    };

    wrapper.appendChild(btn);
    wrapper.appendChild(close);
    document.body.appendChild(wrapper);
  });
});
