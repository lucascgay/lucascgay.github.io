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

      // Colors (paired gradient-ish palette)
      const base = ['#6ee7b7','#7dd3fc','#fca5a5','#c4b5fd','#fde68a','#a7f3d0','#93c5fd','#f9a8d4','#fcd34d','#fdba74'];
      const bg = labels.map((_, i) => base[i % base.length]);

      const textColor = getComputedStyle(document.body).getPropertyValue('--text') || '#e6e6e6';
      const bgBorder = '#0b0c10';

      // Center text plugin (shows hovered segment percent)
      const center = {
        id: 'centerText',
        afterDraw(chart) {
          const {ctx, chartArea, _active} = chart;
          const {left, right, top, bottom} = chartArea;
          const x = (left + right) / 2;
          const y = (top + bottom) / 2;
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = textColor.trim() || '#e6e6e6';

          if (_active && _active.length) {
            const a = _active[0];
            const label = chart.data.labels[a.index];
            const val = chart.data.datasets[a.datasetIndex].data[a.index];
            ctx.font = '700 26px Inter, system-ui, sans-serif';
            ctx.fillText(`${val.toFixed(1)}%`, x, y - 8);
            ctx.font = '600 12px Inter, system-ui, sans-serif';
            ctx.globalAlpha = 0.7;
            ctx.fillText(label, x, y + 14);
            ctx.globalAlpha = 1;
          } else {
            ctx.font = '700 18px Inter, system-ui, sans-serif';
            ctx.globalAlpha = 0.8;
            ctx.fillText('Allocation', x, y);
            ctx.globalAlpha = 1;
          }
          ctx.restore();
        }
      };

      const chart = new Chart(el.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            label: 'Allocation %',
            data: weights,
            backgroundColor: bg,
            borderColor: bgBorder,
            borderWidth: 2,
            spacing: 2,
            hoverOffset: 14
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '62%',
          rotation: -90, // start at top
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: textColor,
                usePointStyle: true,
                pointStyle: 'circle',
              }
            },
            tooltip: {
              backgroundColor: 'rgba(17,18,24,0.9)',
              borderColor: '#1e2029',
              borderWidth: 1,
              padding: 10,
              callbacks: {
                title: (items) => items[0]?.label || '',
                label: (ctx) => ` ${ctx.parsed.toFixed(2)}%`,
              }
            }
          },
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 900,
            easing: 'cubicBezier(.15,.75,.35,1)'
          },
          onHover: (evt, elements, chartInstance) => {
            chartInstance._active = elements; // used by centerText plugin
            chartInstance.update('none');
            evt.native && (evt.native.target.style.cursor = elements.length ? 'pointer' : 'default');
          },
          onClick: (evt, elements, chartInstance) => {
            // Toggle isolate: clicking a segment hides others; clicking again resets
            const ds = chartInstance.data.datasets[0];
            if (!elements.length) {
              // reset
              ds.hidden = false;
              chartInstance.update();
              return;
            }
            const index = elements[0].index;
            if (ds._isolatedIndex === index) {
              ds._isolatedIndex = undefined;
              chartInstance.update();
              return;
            }
            ds._isolatedIndex = index;
            // Implement isolate by setting other values to 0 in a view copy
            const original = weights;
            ds.data = original.map((v, i) => (i === index ? v : 0));
            setTimeout(() => { ds.data = original; chartInstance.update(); }, 1200);
            chartInstance.update();
          }
        },
        plugins: [center]
      });
    })
    .catch(() => {
      // Silently ignore; chart is optional
    });
})();
