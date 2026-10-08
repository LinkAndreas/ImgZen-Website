// The format explorer: choosing a quality level updates the size and bar of every lossy format.
// The page renders the default level, so it reads correctly without JavaScript.

export function initExplorer(root) {
  if (!root) return;
  const chips = root.querySelector('[data-quality-chips]');
  const hint = root.querySelector('[data-quality-hint]');
  const hints = JSON.parse(root.querySelector('[data-quality-hints]').textContent);
  const largest = Number(root.dataset.largest);
  const number = new Intl.NumberFormat(root.dataset.lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const buttons = [...chips.querySelectorAll('[data-quality]')];
  chips.hidden = false;

  function select(button) {
    const quality = button.dataset.quality;
    buttons.forEach((b) => {
      const selected = b === button;
      b.setAttribute('aria-checked', String(selected));
      b.tabIndex = selected ? 0 : -1;
    });
    hint.textContent = hints[quality];
    root.querySelectorAll('[data-sizes]').forEach((row) => {
      const mb = JSON.parse(row.dataset.sizes)[quality];
      row.querySelector('[data-size]').textContent = `${number.format(mb)} MB`;
      row.querySelector('[data-bar]').style.width = `${Math.max(2, (mb / largest) * 100).toFixed(1)}%`;
    });
  }

  buttons.forEach((button) => {
    button.tabIndex = button.getAttribute('aria-checked') === 'true' ? 0 : -1;
    button.addEventListener('click', () => select(button));
  });

  // Arrow keys move between the levels, as in any radio group.
  chips.addEventListener('keydown', (event) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const current = buttons.findIndex((b) => b.getAttribute('aria-checked') === 'true');
    const next = buttons[(current + step + buttons.length) % buttons.length];
    select(next);
    next.focus();
  });
}
