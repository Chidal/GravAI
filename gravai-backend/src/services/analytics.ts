import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';

let db: Database;

async function initializeDB() {
  db = await open({
    filename: './leaderboard.db',
    driver: sqlite3.Database,
  });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userAddress TEXT,
      prediction REAL,
      type TEXT,
      timestamp INTEGER
    )
  `);
}

initializeDB();

export async function getLeaderboard() {
  return db.all('SELECT * FROM leaderboard ORDER BY prediction DESC LIMIT 10');
}

export async function submitPrediction(userAddress: string, prediction: number, type: string) {
  await db.run(
    'INSERT INTO leaderboard (userAddress, prediction, type, timestamp) VALUES (?, ?, ?, ?)',
    [userAddress, prediction, type, Date.now()]
  );
}
