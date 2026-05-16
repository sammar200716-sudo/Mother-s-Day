import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DB_KEY = 'bouquet_rankings';

const saveToLocalDB = async (bouquetData) => {
  const id = bouquetData.id || newId();
  try {
    const existingStr = localStorage.getItem(DB_KEY);
    const existing = existingStr ? JSON.parse(existingStr) : [];
    const next = [
      { id, ...bouquetData },
      ...existing.filter((row) => row.userName !== bouquetData.userName),
    ];
    localStorage.setItem(DB_KEY, JSON.stringify(next));
    return id;
  } catch (error) {
    console.error('LocalDB save failed', error);
    return id;
  }
};

const updateLocalDB = async (id, updates) => {
  if (!id) return null;
  try {
    const existingStr = localStorage.getItem(DB_KEY);
    const existing = existingStr ? JSON.parse(existingStr) : [];
    const next = existing.map((row) =>
      row.id === id ? { ...row, ...updates } : row
    );
    localStorage.setItem(DB_KEY, JSON.stringify(next));
    return next.find((row) => row.id === id) || null;
  } catch (error) {
    console.error('LocalDB update failed', error);
    return null;
  }
};

const getLocalDB = async () => {
  try {
    const existingStr = localStorage.getItem(DB_KEY);
    return existingStr ? JSON.parse(existingStr) : [];
  } catch (error) {
    console.error('LocalDB read failed', error);
    return [];
  }
};

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `b-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const addBouquetToDB = async (bouquetData) => {
  const userName = (bouquetData.userName || 'Guest').trim() || 'Guest';
  const timestamp = bouquetData.timestamp || new Date().toISOString();
  const id = bouquetData.id || newId();
  const bouquetRow = {
    id,
    userName,
    flowerName: bouquetData.flowerName,
    name: bouquetData.name,
    comment: bouquetData.comment ?? '',
    timestamp,
  };

  try {
    if (!isSupabaseConfigured) {
      console.error('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Falling back to localStorage.');
      return saveToLocalDB(bouquetRow);
    }
    const { data: existing, error: existingError } = await supabase
      .from('bouquets')
      .select('id')
      .eq('userName', userName)
      .limit(1);

    if (existingError) {
      console.error('Supabase lookup error', existingError);
    }

    const existingRow = Array.isArray(existing) ? existing?.[0] : existing;

    if (existingRow?.id) {
      const updatePayload = {
        flowerName: bouquetRow.flowerName,
        name: bouquetRow.name,
        timestamp: bouquetRow.timestamp,
      };

      if (bouquetData.comment !== undefined && bouquetData.comment !== '') {
        updatePayload.comment = bouquetRow.comment;
      }

      const { data, error } = await supabase
        .from('bouquets')
        .update(updatePayload)
        .eq('id', existingRow.id)
        .select()
        .single();
      if (error) {
        console.error('Supabase update error', error);
        return saveToLocalDB(bouquetRow);
      }

      return data?.id || existingRow.id;
    }

    const { data, error } = await supabase
      .from('bouquets')
      .insert([bouquetRow])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error', error);
      return saveToLocalDB(bouquetRow);
    }

    return data?.id || id;
  } catch (error) {
    console.error('Failed to save bouquet to Supabase', error);
    return saveToLocalDB(bouquetRow);
  }
};

export const updateBouquetInDB = async (id, updates) => {
  if (!id) return null;

  try {
    if (!isSupabaseConfigured) {
      console.error('Supabase not configured. Falling back to localStorage for update.');
      return updateLocalDB(id, updates);
    }
    const { data, error } = await supabase
      .from('bouquets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to update bouquet in Supabase', error);
    return null;
  }
};

export const getBouquetsFromDB = async () => {
  try {
    if (!isSupabaseConfigured) {
      console.error('Supabase not configured. Falling back to localStorage for reads.');
      return getLocalDB();
    }
    const { data, error } = await supabase
      .from('bouquets')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Supabase read error', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to read bouquets from Supabase', error);
    return [];
  }
};
