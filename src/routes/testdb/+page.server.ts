import { query } from '$lib/server/db';

export async function load() {
  const rows = await query('SELECT NOW() AS now');
  console.log('DB Test:', rows);
  return { now: rows[0].now };
}