const DB_KEY = 'bouquet_rankings';

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `b-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const addBouquetToDB = (bouquetData) => {
  const id = bouquetData.id || newId();
  try {
    const existingStr = localStorage.getItem(DB_KEY);
    const existing = existingStr ? JSON.parse(existingStr) : [];
    const entry = { ...bouquetData, id };
    const newData = [entry, ...existing];
    localStorage.setItem(DB_KEY, JSON.stringify(newData));
    return id;
  } catch (error) {
    console.error('Failed to save to mock DB', error);
    return id;
  }
};

export const updateBouquetInDB = (id, updates) => {
  if (!id) return;
  try {
    const existingStr = localStorage.getItem(DB_KEY);
    const existing = existingStr ? JSON.parse(existingStr) : [];
    const next = existing.map((row) =>
      row.id === id ? { ...row, ...updates } : row
    );
    localStorage.setItem(DB_KEY, JSON.stringify(next));
  } catch (error) {
    console.error('Failed to update mock DB', error);
  }
};

export const getBouquetsFromDB = () => {
  try {
    const existingStr = localStorage.getItem(DB_KEY);
    return existingStr ? JSON.parse(existingStr) : [];
  } catch (error) {
    console.error('Failed to read from mock DB', error);
    return [];
  }
};
