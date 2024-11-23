const dotenv = require("dotenv");
const mysql = require("mysql2");
dotenv.config();

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

const getData = async () => {
  const budget = await query(`SELECT * FROM budget`);

  const budgetItems = await query(`SELECT * FROM budget_items`);

  const data = {
    budget: budget[0].budget,
    budgetItems: budgetItems,
  };

  return data;
};

const createBudget = (body) => {
  const { budget, userId } = body;
  console.log(userId);

  return query(`INSERT INTO budget (budget, user_id) VALUES (?, ?)`, [
    budget,
    userId,
  ]);
};

const deleteBudgetItem = (body) => {
  const { id_budget_item } = body;
  return query(`DELETE FROM budget_items WHERE id = ?`, [id_budget_item]);
};

const deleteAll = () => {
  return query(`DELETE FROM budget_items WHERE 1 = 1`);
};

const updateBudget = async (body) => {
  const { budget, userId } = body;
  const dbBudget = await query(`SELECT * FROM budget`);
  const budgetId = dbBudget[0].id;
  return query(`UPDATE budget SET budget = ?, user_id = ? WHERE id = ?`, [
    budget,
    userId,
    budgetId,
  ]);
};

const createItem = (body) => {
  const { userId, item, amount } = body;
  return query(
    `INSERT INTO budget_items (user_id, item, amount) VALUES (?, ?, ?)`,
    [userId, item, amount]
  );
};

module.exports = {
  getData,
  createBudget,
  updateBudget,
  createItem,
  deleteBudgetItem,
  deleteAll,
};
