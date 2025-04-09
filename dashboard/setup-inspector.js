<!-- ✅ Setup Inspector Popup -->
<div id="setupInspector" class="popup-form" style="display:none; max-height:80vh; overflow-y:auto;">
  <h3>📋 Setup Inspectie</h3>
  <div id="setupListDetails"></div>
  <button onclick="hideSetupInspector()">❌ Sluiten</button>
</div>

<script>
  window.showSetupInspector = async function () {
    try {
      const res = await fetch(`${API_BASE_URL}/api/score/setup`);
      if (!res.ok) throw new Error("Fout bij ophalen van setup scores");
      const data = await res.json();

      const setups = (data.setups || []).sort((a, b) => b.score - a.score);
      const container = document.getElementById("setupListDetails");

      container.innerHTML = setups.map(setup => {
        const highlight = setup.score >= 1 ? '⭐️ ' : '';
        const scoreClass = `score-${setup.score}`;
        return `
          <div class="setup-block ${scoreClass}">
            <strong>${highlight}${setup.name}</strong>
            <div><code>Score:</code> ${setup.score}</div>
            <div class="explanation">${setup.explanation || 'Geen uitleg beschikbaar.'}</div>
          </div>
        `;
      }).join("");
      
      document.getElementById("setupInspector").style.display = "block";
    } catch (err) {
      alert("❌ Setup info ophalen mislukt.");
      console.error(err);
    }
  }

  function hideSetupInspector() {
    document.getElementById("setupInspector").style.display = "none";
  }
</script>
