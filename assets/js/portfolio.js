(() => {
  const el = document.getElementById('portfolioChart');
  if (!el || typeof Chart === 'undefined') return;

  fetch('/data/weights.json', { cache: 'no-store' })
    .then((r) => r.json())
    .then((data) => {
      // data: [{ ticker: "AAPL", weight: 0.25 }, ...] or weight in percent
      const labels = data.map((d) => d.ticker);
      const weights = data.map((d) => (d.weight > 1 ? d.weight : d.weight * 100));

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

