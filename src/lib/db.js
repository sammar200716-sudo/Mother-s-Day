import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DB_KEY = 'bouquets_rankings';

const saveToLocalDB = async (bouquetsData) => {
  const id = bouquetsData.id || newId();
  try {
    const existingStr = localStorage.getItem(DB_KEY);
    const existing = existingStr ? JSON.parse(existingStr) : [];
    const next = [
      { id, ...bouquetsData },
      ...existing.filter((row) => row.userName !== bouquetsData.userName),
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

const isValidUuid = (value) =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export const addbouquetsToDB = async (bouquetsData) => {
  const userName = (bouquetsData.userName || 'Guest').trim() || 'Guest';
  const timestamp = bouquetsData.timestamp || new Date().toISOString();
  const bouquetsRow = {
    userName,
    flowerName: bouquetsData.flowerName,
    name: bouquetsData.name,
    comment: bouquetsData.comment ?? '',
    timestamp,
  };
  const localId = bouquetsData.id || newId();
  const rowForLocal = { id: localId, ...bouquetsRow };

  try {
    if (!isSupabaseConfigured) {
      console.error('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Falling back to localStorage.');
      return saveToLocalDB(rowForLocal);
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
        flowerName: bouquetsRow.flowerName,
        name: bouquetsRow.name,
        timestamp: bouquetsRow.timestamp,
      };

      if (bouquetsData.comment !== undefined && bouquetsData.comment !== '') {
        updatePayload.comment = bouquetsRow.comment;
      }

      const { data, error } = await supabase
        .from('bouquets')
        .update(updatePayload)
        .eq('id', existingRow.id)
        .select()
        .single();
      if (error) {
        console.error('Supabase update error', error);
        return saveToLocalDB(rowForLocal);
      }

      return data?.id || existingRow.id;
    }

    const { data, error } = await supabase
      .from('bouquets')
      .insert([bouquetsRow])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error', error);
      return saveToLocalDB(rowForLocal);
    }

    return data?.id || localId;
  } catch (error) {
    console.error('Failed to save bouquets to Supabase', error);
    return saveToLocalDB(rowForLocal);
  }
};

export const updatebouquetsInDB = async (id, updates) => {
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
    console.error('Failed to update bouquets in Supabase', error);
    return null;
  }
};

export const getbouquetsFromDB =  async () => {
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
