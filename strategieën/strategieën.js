// strategieën.js (volledige versie)
import { API_BASE_URL } from "../config.js";

console.log("📈 Strategieën module geladen!");

let strategieData = []; // cache voor sortering/filtering

// ✅ Event Listeners bij laden
document.addEventListener("DOMContentLoaded", async function () {
  const assetSelect = document.getElementById("assetFilter");
  const timeframeSelect = document.getElementById("timeframeFilter");
  const form = document.getElementById("strategieForm");
  const aiBtn = document.getElementById("genereerStrategieënBtn");
  const sortDropdown = document.getElementById("sortFilter");

  assetSelect.addEventListener("change", fetchStrategieen);
  timeframeSelect.addEventListener("change", fetchStrategieen);
  if (form) form.addEventListener("submit", handleStrategieSubmit);
  if (aiBtn) aiBtn.addEventListener("click", handleStrategieGeneratie);
  if (sortDropdown) sortDropdown.addEventListener("change", renderStrategieen);

  await fetchStrategieen();
  await loadSetupCheckboxes();
});

// ✅ Strategieën ophalen
async function fetchStrategieen() {
  const asset = document.getElementById("assetFilter").value;
  const timeframe = document.getElementById("timeframeFilter").value;
  const container = document.getElementById("strategieLijst");
  container.innerHTML = "<p>🔄 Strategieën laden...</p>";

  try {
    const res = await fetch(`${API_BASE_URL}/strategieën?asset=${asset}&timeframe=${timeframe}`);
    if (!res.ok) throw new Error("Strategie data niet beschikbaar");
    const data = await res.json();
    strategieData = data.strategieën || [];
    renderStrategieen();
  } catch (err) {
    console.error("❌ Fout bij laden strategieën:", err);
    container.innerHTML = `<p style='color:red;'>❌ Fout bij ophalen van strategieën.</p>`;
  }
}

// ✅ Strategieën renderen
function renderStrategieen() {
  const sort = document.getElementById("sortFilter")?.value;
  let data = [...strategieData];
  if (sort === "score") data.sort((a, b) => (b.score || 0) - (a.score || 0));
  else if (sort === "favoriet") data.sort((a, b) => (b.favorite === true) - (a.favorite === true));
  else data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const html = data.map(s => renderStrategieKaart(s)).join("\n");
  document.getElementById("strategieLijst").innerHTML = html;
}

// ✅ Render één kaart
function renderStrategieKaart(s) {
  const favorietSter = s.favorite ? "⭐️" : "☆";
  const uitleg = s.explanation || "Geen uitleg beschikbaar";
  const tooltip = s.ai_reason || "Gebaseerd op technische en macro-analyse";

  return `
    <div class="strategie-kaart" data-id="${s.id}">
      <div style="display:flex; justify-content:space-between; align-items:center; padding: 10px 12px;">
        <strong>${s.setup_name || "Strategie"}</strong>
        <span class="favoriet-toggle" title="Toggle favoriet" style="cursor:pointer;">${favorietSter}</span>
      </div>
      <table>
        <tr><th>⏱️ TF</th><td>${s.asset || "BTC"} (${s.timeframe || "1D"})</td></tr>
        <tr><th>⭐️ Score</th><td><input value="${s.score || ""}" data-field="score" /></td></tr>
        <tr><th>🎯 Entry</th><td><input value="${s.entry || ""}" data-field="entry" /></td></tr>
        <tr><th>🎯 Targets</th><td><input value="${(s.targets || []).join(", " )}" data-field="targets" /></td></tr>
        <tr><th>🛑 Stop-Loss</th><td><input value="${s.stop_loss || ""}" data-field="stop_loss" /></td></tr>
        <tr><th>📊 R:R</th><td><input value="${s.risk_reward || ""}" data-field="risk_reward" /></td></tr>
        <tr><th>🧠 Uitleg <span title="${tooltip}" style="cursor:help;">🛈</span></th>
            <td><textarea data-field="explanation">${uitleg}</textarea></td></tr>
        <tr><td colspan="2" style="text-align:right;">
          <button class="opslaan-btn">💾 Opslaan</button>
          <button class="verwijder-btn">🗑️</button>
          <button class="hergenereer-btn">🔁 Genereer opnieuw (AI)</button>
        </td></tr>
      </table>
    </div>
  `;
}

// ✅ Inline acties

document.addEventListener("click", async function (e) {
  const kaart = e.target.closest(".strategie-kaart");
  const id = kaart?.dataset?.id;

  if (!id) return;

  if (e.target.classList.contains("favoriet-toggle")) {
    const isFavoriet = e.target.textContent === "⭐️";
    await updateStrategie(id, { favorite: !isFavoriet });
    await fetchStrategieen();
  }

  if (e.target.classList.contains("opslaan-btn")) {
    const inputs = kaart.querySelectorAll("[data-field]");
    const payload = {};
    inputs.forEach(inp => {
      const key = inp.dataset.field;
      payload[key] = key === "targets" ? inp.value.split(",").map(v => v.trim()) : inp.value;
    });
    await updateStrategie(id, payload);
    await fetchStrategieen();
  }

  if (e.target.classList.contains("verwijder-btn")) {
    if (confirm("Weet je zeker dat je deze strategie wilt verwijderen?")) {
      await fetch(`${API_BASE_URL}/strategieën/${id}`, { method: "DELETE" });
      await fetchStrategieen();
    }
  }

  if (e.target.classList.contains("hergenereer-btn")) {
    const confirmOverwrite = confirm("Overschrijven of apart opslaan?\nKlik OK voor overschrijven, Annuleer voor nieuwe strategie.");
    const overwrite = confirmOverwrite;
    const res = await fetch(`${API_BASE_URL}/strategie/generate/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ overwrite })
    });
    const data = await res.json();
    alert(data.message || "AI-strategie gegenereerd");
    await fetchStrategieen();
  }
});

// ✅ PUT call
async function updateStrategie(id, data) {
  try {
    const res = await fetch(`${API_BASE_URL}/strategieën/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Update mislukt");
    console.log("✅ Strategie geüpdatet");
  } catch (err) {
    console.error("❌ Fout bij bijwerken strategie:", err);
  }
}

// ✅ Strategie toevoegen via formulier
async function handleStrategieSubmit(e) {
  e.preventDefault();
  const form = e.target;

  const payload = {
    setup_name: form.strategieNaam.value.trim(),
    asset: "BTC",
    timeframe: "1D",
    explanation: form.strategieNotities.value.trim(),
    favorite: false,
    tags: form.strategieTags.value.split(",").map(t => t.trim()),
    origin: "Handmatig"
  };

  try {
    const res = await fetch(`${API_BASE_URL}/strategieën`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Fout bij opslaan strategie");
    alert("✅ Strategie toegevoegd!");
    form.reset();
    await fetchStrategieen();
  } catch (err) {
    console.error("❌ Strategie toevoegen mislukt:", err);
    alert("❌ Strategie opslaan mislukt");
  }
}

// ✅ Setup checkbox-lijst
async function loadSetupCheckboxes() {
  const container = document.getElementById("setupCheckboxes");
  if (!container) return;

  container.innerHTML = "⏳ Laden...";
  try {
    const res = await fetch(`${API_BASE_URL}/setups`);
    const data = await res.json();
    if (!Array.isArray(data.setups)) throw new Error("Geen setups gevonden");
    container.innerHTML = data.setups.map(setup => `
      <label style="display:block; margin-bottom:4px;">
        <input type="checkbox" name="active_setups[]" value="${setup.id}" />
        ${setup.name}
      </label>
    `).join("");
  } catch (err) {
    container.innerHTML = "❌ Fout bij laden setups";
    console.error(err);
  }
}

// ✅ Strategieën automatisch genereren (AI)
async function handleStrategieGeneratie() {
  const statusP = document.getElementById("genereerStatus");
  statusP.textContent = "⏳ Strategieën worden gegenereerd...";
  try {
    const res = await fetch(`${API_BASE_URL}/strategie/generate_all`, { method: "POST" });
    const data = await res.json();
    if (res.ok && data.task_id) {
      statusP.textContent = "✅ AI-strategiegeneratie gestart... (ID: " + data.task_id + ")";
      setTimeout(() => checkStrategieTaskStatus(data.task_id), 5000);
    } else {
      statusP.textContent = "⚠️ Fout: " + (data.error || "Onbekende fout");
    }
  } catch (err) {
    console.error(err);
    statusP.textContent = "❌ Fout bij starten van AI-strategiegeneratie";
  }
}

// ✅ Celery-taskstatus checken
async function checkStrategieTaskStatus(taskId) {
  const statusP = document.getElementById("genereerStatus");
  try {
    const res = await fetch(`${API_BASE_URL}/task_status/${taskId}`);
    const data = await res.json();
    if (data.status === "SUCCESS") {
      statusP.textContent = "✅ Strategieën succesvol gegenereerd!";
      await fetchStrategieen();
    } else if (data.status === "FAILURE") {
      statusP.textContent = "❌ Fout tijdens generatie";
    } else {
      statusP.textContent = `⌛ Status: ${data.status}... (ID: ${taskId})`;
      setTimeout(() => checkStrategieTaskStatus(taskId), 3000);
    }
  } catch (err) {
    statusP.textContent = "⚠️ Kan status niet ophalen";
    console.error(err);
  }
}

