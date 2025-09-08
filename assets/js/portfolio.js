(() => {
  const el = document.getElementById('portfolioChart');
  if (!el || typeof Chart === 'undefined') return;

  fetch('/data/weights.json', { cache: 'no-store' })
    .then((r) => r.json())
    .then((data) => {
      // data: [{ ticker: "AAPL", weight: <number> }]
      // Accept either:
      //  - percentages (sum ≈ 100)
      //  - fractions (sum ≤ 1), which are converted to %
      const labels = data.map((d) => d.ticker);
      const raw = data.map((d) => Number(d.weight));
      const sum = raw.reduce((a, b) => a + (isFinite(b) ? b : 0), 0);
      const weights = (sum <= 1.000001) ? raw.map((x) => x * 100) : raw;

      const colors = [
        '#6ee7b7', '#7dd3fc', '#fca5a5', '#c4b5fd', '#fde68a',
        '#a7f3d0', '#93c5fd', '#f9a8d4', '#fcd34d', '#fdba74'
      ];
      const bg = labels.map((_, i) => colors[i % colors.length]);

      new Chart(el.getContext('2d'), {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            label: 'Allocation %',
            data: weights,
            backgroundColor: bg,
            borderColor: '#1e2029',
            borderWidth: 1
          }]
        },
        options: {
          plugins: {
            legend: { position: 'right', labels: { color: getComputedStyle(document.body).getPropertyValue('--text') } },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.label}: ${ctx.parsed.toFixed(1)}%`
              }
            }
          }
        }
      });
    })
    .catch(() => {
      // Silently ignore; chart is optional
    });
})();
