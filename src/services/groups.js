import { supabase } from './supabase.js';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map(b => chars[b % chars.length])
    .join('');
}

export async function getGroups() {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createGroup(name, teacherId) {
  const code = generateCode();
  const { data, error } = await supabase
    .from('groups')
    .insert({ code, name, teacher_id: teacherId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getGroupReport(code) {
  const { data, error } = await supabase
    .from('responses')
    .select('answers, stars, created_at')
    .eq('group_code', code)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getGroupStats(code) {
  const { count, error: countErr } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true })
    .eq('group_code', code);

  const { data, error: dataErr } = await supabase
    .from('responses')
    .select('created_at')
    .eq('group_code', code)
    .order('created_at', { ascending: false })
    .limit(1);

  if (countErr || dataErr) throw countErr ?? dataErr;
  return {
    completions: count ?? 0,
    lastAt: data?.[0]?.created_at ?? null,
  };
}
