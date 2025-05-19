export const qs = selector => document.querySelector(selector);
export const qsa = selector => document.querySelectorAll(selector);
export const formatCurrency = value => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};
export const createEl = (tag, props = {}) => {
  const el = document.createElement(tag);
  Object.entries(props).forEach(([key, val]) => {
    if (key === 'text') el.textContent = val;
    else if (key in el) el[key] = val;
    else el.setAttribute(key, val);
  });
  return el;
};