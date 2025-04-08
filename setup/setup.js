import { API_BASE_URL } from "../config.js";

console.log("✅ setup.js geladen!");

const apiUrl = `${API_BASE_URL}/setups`;
const aiUrl = `${API_BASE_URL}/ai/explain_setup`;

document.addEventListener("DOMContentLoaded", () => {
  loadSetups();
  setupFilters();

  // Toggle advanced section
  document.getElementById("toggleAdvanced")?.addEventListener("click", () => {
    document.getElementById("advancedSection").classList.toggle("hidden");
  });

  // Live preview updates
  ["setupName", "setupIndicators", "setupTrend", "setupTimeframe", "setupSymbol", "setupStrategy"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", updateLivePreview);
  });
});

const form = document.getElementById("setupForm");
form?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("setupName")?.value.trim();
  const indicators = document.getElementById("setupIndicators")?.value.trim();
  const trend = document.getElementById("setupTrend")?.value;
  const timeframe = document.getElementById("setupTimeframe")?.value;

  const account_type = document.getElementById("accountType")?.value;
  const strategy_type = document.getElementById("strategyType")?.value;
  const symbol = document.getElementById("symbol")?.value.trim();
  const min_investment = parseFloat(document.getElementById("minInvestment")?.value) || null;
  const dynamic = document.getElementById("dynamicInvestment")?.checked || false;
  const tags = document.getElementById("setupTags")?.value.trim();
  const favorite = document.getElementById("favoriteToggle")?.classList.contains("active");

  if (!name || name.length < 3 || !indicators || !trend || !timeframe) {
    showValidationErrors(name, indicators, trend);
    return;
  }

  const setup = {
    name,
    indicators,
    trend,
    timeframe,
    account_type,
    strategy_type,
    symbol,
    min_investment,
    dynamic,
    tags,
    favorite
  };

  const submitBtn = document.getElementById("submitButton");
  submitBtn.disabled = true;

  try {
    await safeFetch(apiUrl, "POST", setup);
    await markStepDone(1);
    form.reset();
    document.getElementById("toast").style.display = "block";
    setTimeout(() => (document.getElementById("toast").style.display = "none"), 3000);
    loadSetups();
    updateLivePreview();
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

function updateLivePreview() {
  const preview = document.getElementById("livePreview");
  if (!preview) return;

  const name = document.getElementById("setupName")?.value;
  const indicators = document.getElementById("setupIndicators")?.value;
  const trend = document.getElementById("setupTrend")?.value;
  const timeframe = document.getElementById("setupTimeframe")?.value;
  const symbol = document.getElementById("symbol")?.value;
  const strategy = document.getElementById("strategyType")?.value;

  preview.innerHTML = `
    <strong>Naam:</strong> ${name || '-'}<br>
    <strong>Indicatoren:</strong> ${indicators || '-'}<br>
    <strong>Trend:</strong> ${trend || '-'}<br>
    <strong>Timeframe:</strong> ${timeframe || '-'}<br>
    <strong>Symbool:</strong> ${symbol || '-'}<br>
    <strong>Strategie:</strong> ${strategy || '-'}
  `;
}

async function loadSetups() {
  try {
    const setups = await safeFetch(apiUrl);
    renderSetupList(setups);
  } catch (err) {
    document.getElementById("setupList").innerHTML = "<li>⚠️ Fout bij laden van setups</li>";
  }
}

async function renderSetupList(setups) {
  const list = document.getElementById("setupList");
  if (!list) return;

  const filter = document.getElementById("trendFilter")?.value;
  const sortBy = document.getElementById("sortBy")?.value;

  let filtered = [...setups];
  if (filter && filter !== "all") filtered = filtered.filter(s => s.trend === filter);
  if (sortBy === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));

  list.innerHTML = "<li>⏳ Laden...</li>";

  const rendered = await Promise.all(
    filtered.map(async setup => {
      const explanation = await generateExplanation(setup);
      return `
        <li data-id="${setup.id}">
          <div class="editable">
            <input class="edit-name" value="${setup.name}" />
            <input class="edit-indicators" value="${setup.indicators}" />
            <select class="edit-trend">
              <option value="bullish" ${setup.trend === "bullish" ? "selected" : ""}>📈 Bullish</option>
              <option value="bearish" ${setup.trend === "bearish" ? "selected" : ""}>📉 Bearish</option>
              <option value="neutral" ${setup.trend === "neutral" ? "selected" : ""}>⚖️ Neutraal</option>
            </select>
          </div>
          <div style="font-size: 0.85em; color: #888; margin: 5px 0">💡 ${explanation}</div>
          <div class="setup-actions">
            <button class="save-btn">💾</button>
            <button class="delete-btn">❌</button>
          </div>
        </li>`;
    })
  );

  list.innerHTML = rendered.join("");
  attachDeleteEvents();
  attachSaveEvents();
}

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
  document.getElementById("trendFilter")?.addEventListener("change", loadSetups);
  document.getElementById("sortBy")?.addEventListener("change", loadSetups);
}

async function deleteSetup(id) {
  if (!confirm("Weet je zeker dat je deze setup wilt verwijderen?")) return;
  try {
    await safeFetch(`${apiUrl}/${id}`, "DELETE");
    loadSetups();
  } catch (err) {
    alert("❌ Verwijderen mislukt.");
  }
}

async function updateSetup(id, updatedData) {
  try {
    await safeFetch(`${apiUrl}/${id}`, "PUT", updatedData);
    loadSetups();
  } catch (err) {
    alert("❌ Bewerken mislukt.");
  }
}

function attachDeleteEvents() {
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.removeEventListener("click", handleDeleteClick);
    btn.addEventListener("click", handleDeleteClick);
  });
}

function handleDeleteClick(e) {
  const id = e.target.closest("li")?.dataset.id;
  if (id) deleteSetup(id);
}

function attachSaveEvents() {
  document.querySelectorAll(".save-btn").forEach(btn => {
    btn.removeEventListener("click", handleSaveClick);
    btn.addEventListener("click", handleSaveClick);
  });
}

function handleSaveClick(e) {
  const li = e.target.closest("li");
  const id = li?.dataset.id;
  const name = li.querySelector(".edit-name")?.value.trim();
  const indicators = li.querySelector(".edit-indicators")?.value.trim();
  const trend = li.querySelector(".edit-trend")?.value;

  if (!name || !indicators || !trend) {
    alert("⚠️ Vul alle velden correct in.");
    return;
  }

  const updated = { name, indicators, trend };
  updateSetup(id, updated);
}

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

async function markStepDone(step) {
  const userId = localStorage.getItem("user_id");
  if (!userId) return;
  try {
    await fetch(`/api/onboarding_status/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step })
    });
    console.log(`✅ Stap ${step} gemarkeerd als voltooid`);
    if (window.updateStepStatus) updateStepStatus();
  } catch (err) {
    console.warn("⚠️ Kon stap niet markeren als voltooid:", err);
  }
}
