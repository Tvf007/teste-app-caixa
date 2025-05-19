const STORAGE_KEY = 'sales-history';
export const loadSales = () => JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
export const saveSales = list => localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
export const addSale = item => {
  const list = loadSales();
  list.push(item);
  saveSales(list);
  return list;
};
export const getTotal = () =>
  loadSales().reduce((sum, { price, quantity = 1 }) => sum + price * quantity, 0);
export const clearSales = () => localStorage.removeItem(STORAGE_KEY);