import { API_BASE_URL } from "../config.js";

window.showSetupInspector = async function () {
  const res = await fetch(`${API_BASE_URL}/api/score/setup`);
  if (!res.ok) return alert("❌ Fout bij ophalen van setups");
  const data = await res.json();

  const setups = data.setups || [];
  const container = document.getElementById("setupListDetails");
  if (!container) return;

  if (setups.length === 0) {
    container.innerHTML = "<p>⚠️ Geen setups gevonden.</p>";
    return;
  }

  container.innerHTML = setups
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .map(setup => {
      const score = setup.score ?? "-";
      const name = setup.name || "Onbekende setup";
      const explanation = setup.explanation || "Geen uitleg beschikbaar";

      const logLines = setup.indicators ? Object.entries(setup.indicators)
        .map(([key, val]) => {
          const value = val?.value ?? "-";
          const score = val?.score ?? "-";
          return `<li><strong>${key}</strong>: ${value} → <code>score ${score}</code></li>`;
        }).join("") : "";

      return `
        <div style="margin-bottom:16px; padding:12px; border:1px solid #ccc; border-radius:8px;">
          <strong style="font-size:1.1rem;">⭐️ ${name}</strong><br/>
          <div style="margin:4px 0;"><code>Totale score:</code> <strong>${score}</strong></div>
          <div style="font-style:italic; color:#666;">${explanation}</div>
          ${logLines ? `<ul class="log-block">${logLines}</ul>` : ""}
        </div>
      `;
    }).join("\n");

  document.getElementById("setupInspector").style.display = "block";
};

window.hideSetupInspector = function () {
  const popup = document.getElementById("setupInspector");
  if (popup) popup.style.display = "none";
};
