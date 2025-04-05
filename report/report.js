import { API_BASE_URL } from "../config.js";

console.log("✅ report.js geladen");

document.addEventListener("DOMContentLoaded", async () => {
  const reportContainer = document.getElementById("dailyReportContent");
  const status = document.getElementById("reportStatus");

  try {
    const response = await fetch(`${API_BASE_URL}/daily_report/latest`);
    if (!response.ok) throw new Error("Fout bij ophalen rapport");

    const report = await response.json();
    console.log("📄 Dagrapport ontvangen:", report);
    status.textContent = "✅ Laatste rapport geladen";

    if (!report || Object.keys(report).length === 0) {
      reportContainer.innerHTML = "<p>🚫 Geen rapport beschikbaar.</p>";
      return;
    }

    // ✅ Dynamisch HTML genereren uit rapportdata
    reportContainer.innerHTML = `
      <h3>🗓️ Rapportdatum: ${report.report_date}</h3>

      <h4>🧠 Samenvatting BTC</h4>
      <p>${report.btc_summary}</p>

      <h4>📉 Macro Samenvatting</h4>
      <p>${report.macro_summary}</p>

      <h4>📋 Setup Checklist</h4>
      <pre>${report.setup_checklist}</pre>

      <h4>🎯 Dagelijkse Prioriteiten</h4>
      <pre>${report.priorities}</pre>

      <h4>🔍 Wyckoff Analyse</h4>
      <pre>${report.wyckoff_analysis}</pre>

      <h4>📈 Aanbevelingen</h4>
      <pre>${report.recommendations}</pre>

      <h4>✅ Conclusie</h4>
      <p>${report.conclusion}</p>

      <h4>🔮 Vooruitblik</h4>
      <pre>${report.outlook}</pre>
    `;
  } catch (error) {
    console.error("❌ Fout bij laden rapport:", error);
    status.textContent = "❌ Rapport ophalen mislukt";
    reportContainer.innerHTML = "<p style='color:red;'>Fout bij laden van het rapport.</p>";
  }
});
