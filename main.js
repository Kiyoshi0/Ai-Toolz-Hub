// main.js — clean, final version with fixed intro animation conflict

const overlay = document.getElementById("introOverlay");
const titleEl = document.getElementById("introTitle");
const subtitleEl = document.getElementById("introSubtitle");
const enterBtn = document.getElementById("enterBtn");

function typeText(el, text, speed = 50, cb) {
  el.textContent = "";
  let i = 0;
  const interval = setInterval(() => {
    el.textContent += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(interval);
      if (cb) cb();
    }
  }, speed);
}

function runIntroSequence() {
  let dots = 0;
  const dotInterval = setInterval(() => {
    titleEl.textContent = "🤖 Welcome to AI Toolz Hub" + ".".repeat(dots % 4);
    dots++;
  }, 500);

  setTimeout(() => {
    clearInterval(dotInterval);
    typeText(titleEl, "🤖 Welcome to AI Toolz Hub", 60, () => {
      subtitleEl.textContent = "Explore 50+ free AI tools to help you create, write, build, design, and more.";
      subtitleEl.style.opacity = "1";
      enterBtn.style.display = "inline-block";
    });
  }, 3000);

  enterBtn.addEventListener("click", () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("introLastSeen", today);
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
    setTimeout(() => overlay.remove(), 800);
  });
}

const $ = {
  grid: document.getElementById("toolGrid"),
  search: document.getElementById("search"),
  category: document.getElementById("category"),
  toggleFavs: document.getElementById("toggleFavs"),
  themeIcon: document.getElementById("themeIcon")
};

let showFavorites = false;
let tools = [];
const favorites = new Set(JSON.parse(localStorage.getItem("favorites") || "[]"));

function highlightMatch(text, keyword) {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword})`, "ig");
  return text.replace(regex, '<mark>$1</mark>');
}

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
    header.classList.add("fade-in-up");
    header.innerHTML = `<span class="cat-icon">📂</span> <span class="cat-name">${cat}</span>`;
    section.appendChild(header);
    const row = document.createElement("div");
    row.className = "grid";
    tools.forEach(tool => {
      const isFav = favorites.has(tool.name);
      const card = document.createElement("div");
      card.className = "card fade-in-up";
      card.innerHTML = `
        <button class="fav-btn ${isFav ? "favorited" : ""}" onclick="toggleFavorite('${tool.name}', this, this.parentElement)" aria-label="Toggle favorite">
          <i class="fas fa-star"></i>
        </button>
        <h2>${highlightMatch(tool.name, filter)}</h2>
        <p>${highlightMatch(tool.desc, filter)}</p>
        <a href="${tool.link}" target="_blank">Visit →</a>
        <button class="copy-btn" onclick="copyLink('${tool.link}')" title="Copy URL">📎</button>
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
  $.category.innerHTML = '<option value="">All Categories</option>' + cats.map(cat => `<option value="${cat}">${cat}</option>`).join("");
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

function showToast(message, bg = "#333") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.background = bg;
  toast.classList.add("show");
  if (bg !== "#f87171") {
    setTimeout(() => toast.classList.remove("show"), 3000);
  }
}

function copyLink(url) {
  navigator.clipboard.writeText(url)
    .then(() => showToast("🔗 Link copied!"))
    .catch(() => showToast("❌ Failed to copy", "#f87171"));
}

function observeFadeIn() {
  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.1 }
  );
  document.querySelectorAll(".fade-in-up").forEach(el => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
  applySavedTheme();
  $.search.focus();
  $.search.addEventListener("input", () => {
    displayTools($.search.value, $.category.value);
    document.getElementById("clearSearch").classList.toggle("show", $.search.value.length > 0);
  });
  $.category.addEventListener("change", () => displayTools($.search.value, $.category.value));
  $.toggleFavs.addEventListener("click", () => {
    showFavorites = !showFavorites;
    displayTools($.search.value, $.category.value);
    $.toggleFavs.textContent = showFavorites ? "⭐ All Tools" : "⭐ Favorites Only";
    $.toggleFavs.setAttribute("aria-pressed", showFavorites);
  });
  document.getElementById("clearSearch").addEventListener("click", () => {
    $.search.value = "";
    displayTools("", $.category.value);
    document.getElementById("clearSearch").classList.remove("show");
    $.search.focus();
  });

  fetch("tools.json")
    .then(res => res.json())
    .then(data => {
      tools = data;
      document.querySelector("header p").textContent = `Discover ${tools.length}+ free AI tools in one place.`;
      const randomTool = tools[Math.floor(Math.random() * tools.length)];
      const icons = {
        Chat: "💬", Image: "🖼️", Video: "🎬", Code: "💻", Writing: "📝", Voice: "🎤",
        SEO: "📈", Research: "🔍", Design: "🎨", Music: "🎵", Website: "🌐",
        Productivity: "🧠", Meeting: "📅", Presentation: "📊"
      };
      const icon = icons[randomTool.category] || "✨";
      document.querySelector(".featured-wrapper").innerHTML = `
        <div class="card show">
          <h2>${icon} ${randomTool.name}</h2>
          <p><strong>Category:</strong> ${randomTool.category}</p>
          <p>${randomTool.desc}</p>
          <a href="${randomTool.link}" target="_blank">🌐 Visit →</a>
        </div>`;
      document.getElementById("loader").style.display = "none";
      updateCategoryOptions();
      displayTools();
      observeFadeIn();
    })
    .catch(err => {
      document.getElementById("loader").style.display = "none";
      console.error("❌ Failed to load tools.json:", err);
      showToast("⚠️ Couldn't load tools", "#f87171");
    });

  const today = new Date().toISOString().split("T")[0];
  const lastSeen = localStorage.getItem("introLastSeen");
  if (lastSeen !== today) runIntroSequence();
  else overlay.remove();
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register("service-worker.js").then(() => console.log("✅ SW registered"));
}

window.addEventListener("offline", () => showToast("🔌 You are offline", "#f87171"));
window.addEventListener("online", () => showToast("✅ Back online", "#34d399"));

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  const btn = document.createElement("button");
  btn.textContent = "📲 Install App";
  btn.style = "position: fixed; bottom: 1rem; left: 50%; transform: translateX(-50%); z-index:999; background: #3b82f6; color:white; border:none; padding:0.75rem 1.2rem; border-radius:1rem; font-size:1rem; box-shadow:0 2px 6px rgba(0,0,0,0.2);";
  btn.onclick = async () => {
    btn.remove();
    e.prompt();
    await e.userChoice;
  };
  document.body.appendChild(btn);
});
