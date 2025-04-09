<!-- ✅ Setup Inspector Popup -->
<div id="setupInspector" class="popup-form" style="display:none">
  <h3>📋 Setup Inspectie</h3>
  <div id="setupListDetails"></div>
  <button onclick="hideSetupInspector()">❌ Sluiten</button>
</div>

<script>
  window.showSetupInspector = async function () {
    try {
      const res = await fetch(`${API_BASE_URL}/api/score/setup`);
      if (!res.ok) throw new Error("Fout bij ophalen van setups");
      const data = await res.json();
      const setups = data.setups || [];

      const container = document.getElementById("setupListDetails");
      container.innerHTML = setups.map(setup => {
        const scoreClass = `score-${setup.score}`.replace("-", "minus");
        const star = setup.score >= 1 ? "⭐️" : "";
        return `
          <div class="setup-box ${scoreClass}">
            <strong><span class="highlight">${star}</span>${setup.name}</strong>
            <code>score ${setup.score}</code>
            <em>${setup.explanation || "Geen uitleg beschikbaar"}</em>
          </div>
        `;
      }).join("");

      document.getElementById("setupInspector").style.display = "block";
    } catch (err) {
      alert("❌ Setupgegevens ophalen mislukt.");
      console.error(err);
    }
  }

  function hideSetupInspector() {
    document.getElementById("setupInspector").style.display = "none";
  }
</script>
