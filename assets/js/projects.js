(() => {
  const root = document.getElementById('projects');
  if (!root) return;

  fetch('/data/projects.json', { cache: 'no-store' })
    .then(r => r.json())
    .then(items => {
      if (!Array.isArray(items) || items.length === 0) {
        root.innerHTML = '<p class="tagline">No projects added yet.</p>';
        return;
      }

      // Sort by pinned then by year/period if present
      items.sort((a, b) => (b.pinned === true) - (a.pinned === true));

      const grid = document.createElement('div');
      grid.className = 'cards';

      for (const p of items) {
        const title = p.title || 'Untitled project';
        const desc = p.description || '';
        const tags = Array.isArray(p.tags) ? p.tags : [];
        const year = p.year || '';
        const gh = p.github || null;
        const demo = p.demo || null;

        const card = document.createElement('article');
        card.className = 'card';
        card.innerHTML = `
          <h3>${title}${year ? ` <span style="color: var(--muted); font-weight: 600; font-size: 14px;">· ${year}</span>` : ''}</h3>
          ${desc ? `<p>${desc}</p>` : ''}
          ${tags.length ? `<div class="tags">${tags.map(t => `<span>${t}</span>`).join('')}</div>` : ''}
          <div class="project-links">
            ${demo ? `<a class="btn" href="${demo}" target="_blank" rel="noopener">Demo</a>` : ''}
            ${gh ? `<a class="btn" href="${gh}" target="_blank" rel="noopener">GitHub</a>` : ''}
          </div>
        `;
        grid.appendChild(card);
      }

      root.appendChild(grid);
    })
    .catch(() => {
      root.innerHTML = '<p class="tagline">Could not load projects.</p>';
    });
})();

