console.log("🔥 THIS IS THE NEW SERVER.JS");

/* ================= URL PARAMS ================= */

const params = new URLSearchParams(window.location.search);
const guildId = params.get("guild");

console.log("Guild ID:", guildId);

/* ================= ELEMENTS ================= */

const verifyEl = document.getElementById("verify");
const inviteEl = document.getElementById("invite");
const panelEl = document.getElementById("panel");
const inviteLink = document.getElementById("inviteLink");

/* ================= SAFETY HELPER ================= */

function showOnly(element) {
  [verifyEl, inviteEl, panelEl].forEach(el => {
    if (el) el.style.display = "none";
  });
  if (element) element.style.display = "block";
}

/* ================= SERVER VERIFICATION ================= */

async function verifyServer() {
  if (!guildId) {
    console.error("Missing guild ID");
    showOnly(inviteEl);
    return;
  }

  try {
    const res = await fetch(`/.netlify/functions/checkBot?guild=${guildId}`);
    console.log("Status:", res.status);

    const data = await res.json();
    console.log("Response text:", data);

    if (!data.botInServer) {
      inviteLink.href =
        `https://discord.com/oauth2/authorize` +
        `?client_id=1457942798644019349` +
        `&permissions=8` +
        `&scope=bot%20applications.commands` +
        `&guild_id=${guildId}`;

      showOnly(inviteEl);
      return;
    }

    // BOT IS IN SERVER
    showOnly(panelEl);

    // Optional title
    if (data.guild?.name) {
      document.title = `${data.guild.name} | Security Max`;
    }

    // 🔽 LOAD SAVED SETTINGS (ANTINUKE)
    loadAntinukeState();

  } catch (err) {
    console.error("Verification error:", err);
    showOnly(inviteEl);
  }
}

/* ================= ANTINUKE STATE ================= */

let isDirty = false;
let lastSavedState = false;

const toggle = document.getElementById("antinukeToggle");
const saveBar = document.getElementById("saveBar");
const modal = document.getElementById("unsavedModal");

if (toggle) {
  toggle.addEventListener("change", () => {
    isDirty = true;
    saveBar.classList.remove("hidden");
  });
}

/* ================= LOAD STATE FROM BACKEND ================= */

async function loadAntinukeState() {
  try {
    const res = await fetch(
      `/.netlify/functions/getFeatureState?feature=antinuke&guild=${guildId}`
    );

    if (!res.ok) return;

    const data = await res.json();

    if (typeof data.enabled === "boolean") {
      toggle.checked = data.enabled;
      lastSavedState = data.enabled;
      isDirty = false;
    }
  } catch (err) {
    console.error("Failed to load antinuke state:", err);
  }
}

/* ================= SAVE / DISCARD ================= */

async function saveChanges() {
  try {
    await fetch("/.netlify/functions/updateFeature", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        feature: "antinuke",
        enabled: toggle.checked,
        guildId
      })
    });

    lastSavedState = toggle.checked;
    isDirty = false;
    saveBar.classList.add("hidden");

    console.log("AntiNuke saved:", toggle.checked);

  } catch (err) {
    console.error("Save failed:", err);
  }
}

function discardChanges() {
  toggle.checked = lastSavedState;
  isDirty = false;
  saveBar.classList.add("hidden");
}

/* ================= NAVIGATION LOCK ================= */
/* (This works together with server.html script) */

window.addEventListener("beforeunload", e => {
  if (isDirty) {
    e.preventDefault();
    e.returnValue = "";
  }
});

/* ================= START ================= */

verifyServer();

