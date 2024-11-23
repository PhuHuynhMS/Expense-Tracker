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

const getData = async (userId) => {
  const budget = await query(`SELECT * FROM user`);

  const budgetItems = await query(`SELECT * FROM budget_items`);
  console.log(budgetItems);

  const data = {
    budget: budget[0].budget,
    budgetItems: budgetItems,
  };

  return data;
};

const createBudget = (body) => {
  const { userId, budget } = body;
  return query(`INSERT INTO user (budget) VALUES (?)`, [budget]);
};

const deleteBudgetItem = (body) => {
  const { id_budget_item } = body;
  return query(`DELETE FROM budget_items WHERE id = ?`, [id_budget_item]);
};

const updateBudget = (body) => {
  const { budget, userId } = body;
  return query(`UPDATE user SET budget = ? WHERE id = ?`, [budget, userId]);
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
};
