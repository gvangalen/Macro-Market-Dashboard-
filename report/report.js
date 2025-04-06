import { API_BASE_URL } from "../config.js";

console.log("✅ report.js geladen");

document.addEventListener("DOMContentLoaded", async () => {
  const reportContainer = document.getElementById("dailyReportContent");
  const status = document.getElementById("reportStatus");
  const dateSelect = document.getElementById("reportDateSelect");
  const downloadBtn = document.getElementById("downloadPdfBtn");

  // ✅ Rapport laden bij opstart
  await loadReport("latest");

  // ✅ Datumhistoriek ophalen voor dropdown
  try {
    const res = await fetch(`${API_BASE_URL}/daily_report/history`);
    const dates = await res.json();
    if (Array.isArray(dates)) {
      dates.forEach(d => {
        const opt = document.createElement("option");
        opt.value = d;
        opt.textContent = d;
        dateSelect.appendChild(opt);
      });
    }
  } catch (e) {
    console.warn("⚠️ Kon geen datums laden voor select:", e);
  }

  // ✅ Reactie op dropdown
  dateSelect.addEventListener("change", () => {
    const date = dateSelect.value;
    loadReport(date);
  });

  // ✅ PDF download
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const selectedDate = dateSelect.value;
      const url = selectedDate === "latest"
        ? `${API_BASE_URL}/daily_report/export/pdf`
        : `${API_BASE_URL}/daily_report/export/pdf?date=${selectedDate}`;
      window.open(url, "_blank");
    });
  }

  // ✅ Functie: Rapport laden
  async function loadReport(date = "latest") {
    const endpoint = date === "latest"
      ? `${API_BASE_URL}/daily_report/latest`
      : `${API_BASE_URL}/daily_report/${date}`;

    status.textContent = `📡 Rapport laden voor ${date}...`;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Fout bij ophalen rapport");

      const report = await response.json();
      console.log("📄 Rapport ontvangen:", report);
      status.textContent = `✅ Rapport geladen: ${report.report_date || date}`;

      if (!report || Object.keys(report).length === 0) {
        reportContainer.innerHTML = "<p>🚫 Geen rapport beschikbaar.</p>";
        return;
      }

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
  }
});
