console.log("🔥 SERVER.JS LOADED");

const params = new URLSearchParams(window.location.search);
const guildId = params.get("guild");

const verifyEl = document.getElementById("verify");
const inviteEl = document.getElementById("invite");
const panelEl = document.getElementById("panel");
const inviteLink = document.getElementById("inviteLink");

const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".section");

const toggle = document.getElementById("antinukeToggle");
const saveBar = document.getElementById("saveBar");
const modal = document.getElementById("unsavedModal");

let isDirty = false;
let lastSaved = false;

/* ---------------- VISIBILITY ---------------- */

function showOnly(el) {
  [verifyEl, inviteEl, panelEl].forEach(e => e.style.display = "none");
  el.style.display = "block";
}

/* ---------------- VERIFY SERVER ---------------- */

async function verifyServer() {
  if (!guildId) {
    showOnly(inviteEl);
    return;
  }

  try {
    const res = await fetch(`/.netlify/functions/checkBot?guild=${guildId}`);
    const data = await res.json();

    if (!data.botInServer) {
      inviteLink.href =
        `https://discord.com/oauth2/authorize?client_id=1457942798644019349&permissions=8&scope=bot%20applications.commands&guild_id=${guildId}`;
      showOnly(inviteEl);
      return;
    }

    showOnly(panelEl);

  } catch {
    showOnly(inviteEl);
  }
}

/* ---------------- NAVIGATION ---------------- */

navItems.forEach(btn => {
  btn.addEventListener("click", () => {
    if (isDirty) {
      modal.classList.remove("hidden");
      modal.classList.add("shake");
      setTimeout(() => modal.classList.remove("shake"), 400);
      return;
    }

    navItems.forEach(b => b.classList.remove("active"));
    sections.forEach(s => s.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.target).classList.add("active");
  });
});

/* ---------------- ANTINUKE ---------------- */

toggle.addEventListener("change", () => {
  isDirty = true;
  saveBar.classList.remove("hidden");
});

function saveChanges() {
  lastSaved = toggle.checked;
  isDirty = false;
  saveBar.classList.add("hidden");
  console.log("Saved AntiNuke:", toggle.checked);
}

function discardChanges() {
  toggle.checked = lastSaved;
  isDirty = false;
  saveBar.classList.add("hidden");
}

/* ---------------- START ---------------- */

verifyServer();
