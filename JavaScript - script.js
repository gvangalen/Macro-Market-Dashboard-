document.addEventListener("DOMContentLoaded", function () {
    if (typeof JustGage === "undefined") {
        console.error("JustGage is niet correct geladen!");
        return;
    }

    // 📊 Initialiseer de gauges
    let macroGauge = new JustGage({
        id: "macroGauge",
        value: 50,
        min: 0,
        max: 100,
        title: "Macro Trend",
        gaugeWidthScale: 0.6,
        levelColors: ["#FF5733", "#FFC300", "#4CAF50"],
    });

    let technicalGauge = new JustGage({
        id: "technicalGauge",
        value: 70,
        min: 0,
        max: 100,
        title: "Technische Analyse",
        gaugeWidthScale: 0.6,
        levelColors: ["#FF5733", "#FFC300", "#4CAF50"],
    });

    let setupGauge = new JustGage({
        id: "setupGauge",
        value: 30,
        min: 0,
        max: 100,
        title: "Huidige Setup",
        gaugeWidthScale: 0.6,
        levelColors: ["#FF5733", "#FFC300", "#4CAF50"],
    });

    // ✅ Simulatie van het laden van echte data na een paar seconden
    setTimeout(() => {
        macroGauge.refresh(65); // Simuleert nieuwe data
        technicalGauge.refresh(85);
        setupGauge.refresh(40);
    }, 2000);
});
