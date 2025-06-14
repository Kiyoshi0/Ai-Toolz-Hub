// main.js

const $ = {
  grid: document.getElementById("toolGrid"),
  search: document.getElementById("search"),
  category: document.getElementById("category"),
  toggleFavs: document.getElementById("toggleFavs"),
  themeIcon: document.getElementById("themeIcon")
};

let tools = [];
fetch('tools.json')
  .then(res => res.json())
  .then(data => {
    tools = data;
    updateCategoryOptions();
    displayTools();
  })
  .catch(err => {
    console.error("❌ Failed to load tools.json:", err);
    showToast("⚠️ Couldn't load tools", "#f87171");
  });

let showFavorites = false;
const favorites = new Set(JSON.parse(localStorage.getItem("favorites") || "[]"));

function displayTools(filter = "", category = "") {
  $.grid.innerHTML = "";
  const filtered = tools.filter(t => {
    const match = t.name.toLowerCase().includes(filter.toLowerCase()) && (!category || t.category === category);
    return showFavorites ? favorites.has(t.name) && match : match;
  });

  if (filtered.length === 0) {
    const msg = document.createElement("div");
    msg.className = "animate__animated animate__fadeIn";
    msg.style.textAlign = "center";
    msg.style.fontSize = "1rem";
    msg.style.padding = "2rem 1rem";
    msg.style.opacity = 0.7;
    msg.textContent = "😕 No tools found.";
    $.grid.appendChild(msg);
    return;
  }

  const grouped = {};
  filtered.forEach(t => {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  });

  Object.entries(grouped).forEach(([cat, tools]) => {
    const section = document.createElement("div");
    const header = document.createElement("h2");
    header.textContent = `📂 ${cat}`;
    header.style.margin = "2rem 0 1rem";
    header.style.fontSize = "1.5rem";
    header.style.color = "var(--primary)";
    section.appendChild(header);

    const row = document.createElement("div");
    row.className = "grid";

    tools.forEach(tool => {
      const isFav = favorites.has(tool.name);
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <button class="fav-btn ${isFav ? 'favorited' : ''}" onclick="toggleFavorite('${tool.name}', this, this.parentElement)" aria-label="Toggle favorite">
          <i class="fas fa-star"></i>
        </button>
        <h2>${tool.name}</h2>
        <p>${tool.desc}</p>
        <a href="${tool.link}" target="_blank">Visit →</a>
      `;
      requestAnimationFrame(() => card.classList.add("show"));
      row.appendChild(card);
    });

    section.appendChild(row);
    $.grid.appendChild(section);
  });
}

function toggleFavorite(name, el, card) {
  if (favorites.has(name)) {
    favorites.delete(name);
    el.classList.remove("favorited");
  } else {
    favorites.add(name);
    el.classList.add("favorited");
    card.classList.add("animate");
    setTimeout(() => card.classList.remove("animate"), 400);
  }
  localStorage.setItem("favorites", JSON.stringify([...favorites]));
}

function updateCategoryOptions() {
  const cats = [...new Set(tools.map(t => t.category))];
  $.category.innerHTML = '<option value="">All Categories</option>' +
    cats.map(cat => `<option value="${cat}">${cat}</option>`).join("");
}

function toggleTheme() {
  const theme = document.body.classList.contains("dark") ? "light" : "dark";
  setTheme(theme);
}

function setTheme(theme) {
  document.body.classList.remove("light", "dark");
  document.body.classList.add(theme);
  localStorage.setItem("theme", theme);
  const icon = $.themeIcon;
  icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
  icon.classList.remove("sun-animate", "moon-animate");
  void icon.offsetWidth;
  icon.classList.add(theme === "dark" ? "sun-animate" : "moon-animate");
}

function applySavedTheme() {
  const theme = localStorage.getItem("theme") || "light";
  setTheme(theme);
}

function showToast(message, bg = '#333') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.background = bg;
  toast.classList.add('show');
  if (bg !== '#f87171') {
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  $.search.focus();
  $.search.addEventListener("input", () => displayTools($.search.value, $.category.value));
  $.category.addEventListener("change", () => displayTools($.search.value, $.category.value));
  $.toggleFavs.addEventListener("click", () => {
    showFavorites = !showFavorites;
    displayTools($.search.value, $.category.value);
    $.toggleFavs.textContent = showFavorites ? "⭐ All Tools" : "⭐ Favorites Only";
    $.toggleFavs.setAttribute("aria-pressed", showFavorites);
  });
  applySavedTheme();
  updateCategoryOptions();
  displayTools();
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js').then(() => console.log('✅ SW registered'));
}

window.addEventListener('offline', () => {
  showToast('🔌 You are offline', '#f87171');
});

window.addEventListener('online', () => {
  showToast('✅ Back online', '#34d399');
});

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  const btn = document.createElement('button');
  btn.textContent = '📲 Install App';
  btn.style = 'position: fixed; bottom: 1rem; left: 50%; transform: translateX(-50%); z-index:999; background: #3b82f6; color:white; border:none; padding:0.75rem 1.2rem; border-radius:1rem; font-size:1rem; box-shadow:0 2px 6px rgba(0,0,0,0.2);';
  btn.onclick = async () => {
    btn.remove();
    e.prompt();
    await e.userChoice;
  };
  document.body.appendChild(btn);
});
