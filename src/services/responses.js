import { supabase } from './supabase.js';

export async function insertResponse({ groupCode, answers, countryCode, origin, odData }) {
  const row = {
    group_code: groupCode ?? null,
    answers,
    stars: null,
    commitment: null,
    country_code: countryCode ?? null,
    origin,
    od_name:     odData?.name     ?? null,
    od_lastname: odData?.lastname ?? null,
    od_age:      odData?.age      ?? null,
    od_email:    odData?.email    ?? null,
  };

  const { data, error } = await supabase
    .from('responses')
    .insert(row)
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function updateStars(id, stars) {
  if (!id) return;
  await supabase.from('responses').update({ stars }).eq('id', id);
}

export async function updateCommitment(id, commitment) {
  if (!id) return;
  await supabase.from('responses').update({ commitment }).eq('id', id);
}
