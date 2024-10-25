const dotenv = require("dotenv");
dotenv.config();
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  database: process.env.DATABASE_DB,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});

// Convert `pool.query` to use promises
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

const getData = (userId) => {
  return query(`SELECT * FROM user WHERE id = ?`, [userId]);
};

const createBudget = (body) => {
  const { userId, budget } = body;
  return query(`INSERT INTO user (id, budget) VALUES (?, ?)`, [userId, budget]);
};

const updateBudget = (body) => {
  const { budget, userId } = body;
  return query(`UPDATE user SET budget = ? WHERE id = ?`, [budget, userId]);
};

const createItem = (body) => {
  const { userId, budget, item, amount } = body;
  return query(
    `INSERT INTO user (id, budget, item, amount) VALUES (?, ?, ?, ?)`,
    [userId, budget, item, amount]
  );
};

module.exports = {
  getData,
  createBudget,
  updateBudget,
  createItem,
};
