// lib/db.ts
import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: 'localhost', // Essaie 'localhost' si '127.0.0.1' ne marche pas
  user: 'root',
  password: '', 
  database: 'clinique_db',
});