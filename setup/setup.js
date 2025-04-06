import { API_BASE_URL } from "../config.js";

console.log("✅ setup.js geladen!");

document.addEventListener("DOMContentLoaded", function () {
  console.log("📌 Setup Manager geladen!");
  loadSetups();
  setupFilters();
});

const apiUrl = `${API_BASE_URL}/setups`;
const aiUrl = `${API_BASE_URL}/ai/explain_setup`; // ✅ AI-uitleg endpoint

// ✅ Setup toevoegen
const form = document.getElementById("setupForm");
form?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("setupName")?.value.trim();
  const indicators = document.getElementById("setupIndicators")?.value.trim();
  const trend = document.getElementById("setupTrend")?.value;

  if (!name || name.length < 3 || !indicators || !trend) {
    showValidationErrors(name, indicators, trend);
    return;
  }

  const setup = { name, indicators, trend };
  const submitBtn = document.getElementById("submitButton");
  submitBtn.disabled = true;

  try {
    await safeFetch(apiUrl, "POST", setup);
    form.reset();
    document.getElementById("toast").style.display = "block";
    setTimeout(() => (document.getElementById("toast").style.display = "none"), 3000);
    loadSetups();
  } catch (err) {
    alert("❌ Setup opslaan mislukt.");
  } finally {
    submitBtn.disabled = false;
  }
});

function showValidationErrors(name, indicators, trend) {
  document.getElementById("nameError").style.display = name.length >= 3 ? "none" : "block";
  document.getElementById("indicatorError").style.display = indicators ? "none" : "block";
  document.getElementById("trendError").style.display = trend ? "none" : "block";
}

// ✅ Setup lijst laden en tonen
async function loadSetups() {
  try {
    const setups = await safeFetch(apiUrl);
    renderSetupList(setups);
  } catch (err) {
    document.getElementById("setupList").innerHTML = "<li>⚠️ Fout bij laden van setups</li>";
  }
}

// ✅ Setuplijst tonen (met filtering + AI-uitleg)
async function renderSetupList(setups) {
  const list = document.getElementById("setupList");
  if (!list) return;

  const filter = document.getElementById("trendFilter")?.value;
  const sortBy = document.getElementById("sortBy")?.value;

  let filtered = [...setups];
  if (filter) filtered = filtered.filter(s => s.trend === filter);

  if (sortBy === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));

  list.innerHTML = "<li>⏳ Laden...</li>";

  const rendered = await Promise.all(
    filtered.map(async setup => {
      const explanation = await generateExplanation(setup);
      return `<li data-id="${setup.id}">
        <div><strong>${setup.name}</strong> (${setup.trend})</div>
        <div style="font-size: 0.95em; color: #555">${setup.indicators}</div>
        <div style="font-size: 0.85em; color: #888; margin: 5px 0">💡 ${explanation}</div>
        <button class="delete-btn">❌</button>
      </li>`;
    })
  );

  list.innerHTML = rendered.join("");
  attachDeleteEventListeners();
}

// ✅ Genereer uitleg via AI
async function generateExplanation(setup) {
  try {
    const res = await fetch(aiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(setup)
    });
    if (!res.ok) throw new Error("AI-uitleg mislukt");
    const data = await res.json();
    return data.explanation || "Geen uitleg beschikbaar.";
  } catch (err) {
    console.warn("⚠️ Geen AI-uitleg:", err);
    return "Geen uitleg beschikbaar.";
  }
}

function setupFilters() {
  const trendSelect = document.getElementById("trendFilter");
  const sortSelect = document.getElementById("sortBy");
  if (trendSelect) trendSelect.addEventListener("change", loadSetups);
  if (sortSelect) sortSelect.addEventListener("change", loadSetups);
}

// ✅ Setup verwijderen
async function deleteSetup(id) {
  if (!confirm("Weet je zeker dat je deze setup wilt verwijderen?")) return;
  try {
    await safeFetch(`${apiUrl}/${id}`, "DELETE");
    loadSetups();
  } catch (err) {
    alert("❌ Verwijderen mislukt.");
  }
}

// ✅ Veilige fetch
async function safeFetch(url, method = "GET", body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Fout bij ${url}`);
  return method === "GET" ? res.json() : true;
}

function attachDeleteEventListeners() {
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.removeEventListener("click", handleDeleteClick);
    btn.addEventListener("click", handleDeleteClick);
  });
}

function handleDeleteClick(e) {
  const id = e.target.closest("li")?.dataset.id;
  if (id) deleteSetup(id);
}
