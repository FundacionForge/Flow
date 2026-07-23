import { supabase } from './supabase.js';

export async function getTeacherProfile() {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .single();
  if (error?.code === 'PGRST116') return null; // no rows
  if (error) throw error;
  return data;
}

export async function createTeacherProfile({ name, institution, countryCode, email }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('teachers')
    .insert({ name, institution, country_code: countryCode, email, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}
