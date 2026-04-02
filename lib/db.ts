import mysql from 'mysql2/promise';

export const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Ajoute ton mot de passe si nécessaire
    database: 'clinique_db',
    waitForConnections: true,
    connectionLimit: 10,
});