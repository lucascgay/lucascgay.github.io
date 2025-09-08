(() => {
  const root = document.getElementById('reads');
  if (!root) return;

  fetch('/data/reads.json', { cache: 'no-store' })
    .then(r => r.json())
    .then(items => {
      if (!Array.isArray(items) || items.length === 0) {
        root.innerHTML = '<p class="tagline">No recommendations yet.</p>';
        return;
      }

      // Sort by type, then year desc
      items.sort((a, b) => (a.type || '').localeCompare(b.type || '') || (b.year || 0) - (a.year || 0));

      const el = document.createElement('div');
      el.className = 'cards reads-grid';

      for (const it of items) {
        const type = (it.type || 'book').toLowerCase();
        const tags = Array.isArray(it.tags) ? it.tags : [];
        const url = it.link || '#';
        const safeTitle = it.title || 'Untitled';
        const byline = [type.charAt(0).toUpperCase() + type.slice(1), it.year, it.author || it.authors]?.filter(Boolean).join(' · ');

        const card = document.createElement('article');
        card.className = 'card read-card';
        card.innerHTML = `
          <a class="read-title" href="${url}" target="_blank" rel="noopener">
            ${safeTitle}
            <span class="read-ext" aria-hidden>↗</span>
          </a>
          <div class="read-meta">${byline}</div>
          ${it.notes ? `<p class="read-notes">${it.notes}</p>` : ''}
          ${tags.length ? `<div class="tags">${tags.map(t => `<span>${t}</span>`).join('')}</div>` : ''}
        `;
        el.appendChild(card);
      }

      root.appendChild(el);
    })
    .catch(() => {
      root.innerHTML = '<p class="tagline">Could not load recommendations.</p>';
    });
})();

