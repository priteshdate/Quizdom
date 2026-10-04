// Click ripple for every <button> in the app. Import once in main.jsx.
document.addEventListener("pointerdown", (e) => {
  const btn = e.target.closest("button");
  if (!btn || btn.disabled) return;

  const r = btn.getBoundingClientRect();
  const d = Math.max(r.width, r.height) * 2;
  const dot = document.createElement("span");

  dot.className = "ripple";
  dot.style.cssText =
    `width:${d}px;height:${d}px;` +
    `left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;

  btn.appendChild(dot);
  setTimeout(() => dot.remove(), 600);
});
