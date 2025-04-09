<!-- ✅ Setup Inspector Popup -->
<div id="setupInspector" class="popup-form" style="display:none">
  <h3>📋 Setup Inspectie</h3>
  <div id="setupListDetails"></div>
  <button onclick="hideSetupInspector()">❌ Sluiten</button>
</div>

<script>
  window.showSetupInspector = async function () {
    const res = await fetch(`${API_BASE_URL}/api/score/setup`);
    if (!res.ok) return alert("❌ Fout bij ophalen van setups");
    const data = await res.json();

    const setups = data.setups || [];
    const container = document.getElementById("setupListDetails");
    container.innerHTML = setups.map(setup => {
      return `
        <div style="margin-bottom:12px; padding:10px; border:1px solid #ccc; border-radius:8px;">
          <strong>${setup.name}</strong>
          <div><code>Score:</code> ${setup.score}</div>
          <div><em>${setup.explanation || 'Geen uitleg beschikbaar'}</em></div>
        </div>
      `;
    }).join("\n");

    document.getElementById("setupInspector").style.display = "block";
  }

  function hideSetupInspector() {
    document.getElementById("setupInspector").style.display = "none";
  }
</script>
