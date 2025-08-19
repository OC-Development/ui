// script.js
document.addEventListener('DOMContentLoaded', () => {
  // النافذة داخل التابلت: أظهر/أخفّي الحاوية بدل body (لكن لو ما وُجدت استعمل body)
  const root = document.querySelector('.factory-window') || document.body;

  let showOnlyLow = false;

  // ========== NUI Actions ==========
  function closeWindow() {
    if (typeof GetParentResourceName === 'function') {
      fetch(`https://${GetParentResourceName()}/closeUI`, { method: 'POST' });
    }
    root.style.display = 'none';
  }
  window.closeWindow = closeWindow;

  // ========== Helpers ==========
  const tbody = document.querySelector('#materialsTable tbody');
  const searchInput = document.getElementById('search-bar');
  const toggleLowBtn = document.getElementById('toggleLowBtn');
  const closeBtn = document.getElementById('closeBtn');

  function classByPct(pct) {
    if (pct < 15) return 'danger';
    if (pct < 35) return 'warn';
    return '';
  }

  function applyFilters() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    const rows = tbody.querySelectorAll('tr');
    rows.forEach((row) => {
      const name = row.getAttribute('data-name') || '';
      const pct = Number(row.getAttribute('data-pct') || '0');
      const matchesSearch = !q || name.includes(q);
      const matchesLow = !showOnlyLow || pct < 35;
      row.style.display = matchesSearch && matchesLow ? '' : 'none';
    });
  }

  // ========== Render ==========
  function renderRows(items) {
    tbody.innerHTML = '';

    if (!Array.isArray(items)) return;

    items.forEach((it) => {
      const name = String(it.material || '').trim();
      const pct = Math.max(0, Math.min(100, Number(it.percentage || 0)));
      const cls = classByPct(pct);
      const icon = `https://images.dz-crew.com/inventory/icons/${name}.png`;

      // نبني الصف: نمرر النسبة عبر style --pct ونخزّن name/pct للفلترة
      const tr = document.createElement('tr');
      tr.style.setProperty('--pct', String(pct));
      tr.setAttribute('data-name', name.toLowerCase());
      tr.setAttribute('data-pct', String(pct));

      tr.innerHTML = `
        <td>
          <div class="mat">
            <img class="mat-icon" src="${icon}" alt="">
            <span class="mat-name">${name}</span>
          </div>
        </td>
        <td><div class="segbar ${cls}"></div></td>
        <td class="pct ${cls}">${pct}%</td>
      `;

      tbody.appendChild(tr);
    });

    applyFilters();
  }

  // ========== Events ==========
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (toggleLowBtn) {
    toggleLowBtn.addEventListener('click', () => {
      showOnlyLow = !showOnlyLow;
      toggleLowBtn.classList.toggle('active', showOnlyLow);
      applyFilters();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeWindow);
  }

  // ========== NUI Messages ==========
  window.addEventListener('message', (event) => {
    const data = event.data || {};

    if (data.type === 'openUI') {
      root.style.display = 'grid'; // يتطابق مع layout .factory-window
    } else if (data.type === 'closeUI') {
      root.style.display = 'none';
    } else if (data.type === 'updateItems') {
      // يسمح بإرسال مصفوفة مباشرة أو JSON string
      let items = data.items;
      if (typeof items === 'string') {
        try { items = JSON.parse(items); } catch { items = []; }
      }
      renderRows(items);
    }
  });

  // ابدأ مخفية (نفس سلوكك السابق)
  root.style.display = 'none';
});
