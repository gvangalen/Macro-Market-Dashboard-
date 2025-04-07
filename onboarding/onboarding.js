console.log("🚀 Onboarding geladen!");

// Simuleer backend data (later ophalen per gebruiker)
const stepStatus = {
  1: true,  // Setup toegevoegd
  2: true,  // Technisch toegevoegd
  3: false, // Macro nog niet
  4: false  // Dashboard bekeken
};

// ✅ Update UI status
function updateStepStatus() {
  let completed = 0;
  Object.entries(stepStatus).forEach(([step, done]) => {
    const el = document.getElementById(`step${step}-status`);
    if (el) {
      el.classList.add(done ? "done" : "todo");
      el.textContent = done ? "✅" : "⬜";
      if (done) completed++;
    }
  });

  const percent = (completed / 4) * 100;
  document.getElementById("progress").style.width = `${percent}%`;

  if (completed === 4) {
    document.getElementById("onboarding-done").style.display = "block";
  }
}

document.addEventListener("DOMContentLoaded", updateStepStatus);

