console.log("🚀 Onboarding geladen!");

// ✅ Dynamisch ophalen van status via backend
async function fetchStepStatus() {
  const userId = localStorage.getItem("user_id") || "demo"; // fallback demo-gebruiker

  try {
    const res = await fetch(`/api/onboarding_status/${userId}`);
    if (!res.ok) throw new Error("Status ophalen mislukt");

    const data = await res.json(); // verwachte structuur: { "1": true, "2": false, ... }
    return data;
  } catch (err) {
    console.warn("⚠️ Fallback actief (simulatie):", err);
    // fallback demo-status
    return {
      1: false,
      2: false,
      3: false,
      4: false
    };
  }
}

// ✅ Update UI op basis van stap-status
function updateStepStatus(stepStatus) {
  let completed = 0;

  for (let step = 1; step <= 4; step++) {
    const el = document.getElementById(`step${step}-status`);
    const done = stepStatus[step];

    if (el) {
      el.classList.remove("done", "todo");
      el.classList.add(done ? "done" : "todo");
      el.textContent = done ? "✅" : "⬜";
      if (done) completed++;
    }
  }

  const progressEl = document.getElementById("progress");
  if (progressEl) progressEl.style.width = `${(completed / 4) * 100}%`;

  const doneBlock = document.getElementById("onboarding-done");
  if (doneBlock) doneBlock.style.display = completed === 4 ? "block" : "none";
}

// ✅ Bij DOM geladen: status ophalen en verwerken
document.addEventListener("DOMContentLoaded", async () => {
  const status = await fetchStepStatus();
  updateStepStatus(status);
});
