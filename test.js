import mariadb from 'mariadb';

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'P@ssword',
    database: 'scq',
    connectionLimit: 5
});

try {
    const conn = await pool.getConnection();
    console.log("Connected!");
    conn.end();
} catch (err) {
    console.error("Connection Error: ", err);
}
