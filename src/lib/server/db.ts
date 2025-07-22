import mariadb from 'mariadb';
import { DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME } from '$env/static/private';

export const pool = mariadb.createPool({
  host: DATABASE_HOST,
  port: Number(DATABASE_PORT ?? 3306),
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
  connectionLimit: 5
});

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(sql, params);
    // mariadb lib returns metadata row; slice if needed
    return rows as T[];
  } finally {
    if (conn) conn.release();
  }
}

export async function execute(sql: string, params: any[] = []): Promise<void> {
  await query(sql, params);
}