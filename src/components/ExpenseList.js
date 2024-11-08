import React from "react";

const ExpenseList = (props) => {
  const handleDeleteItem = (expense) => {
    console.log(expense);

    fetch("http://localhost:3001/delete-budget-item", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_budget_item: expense.id,
      }),
    })
      .then((response) => {
        return response.text();
      })
      .then((data) => {
        alert(data);
        props.getDataForUser();
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <div className="expense-list">
      <ul className="list-group">
        {props.expenseList.map((expense) => (
          <li className="list-group-item d-flex justify-content-between align-items-center">
            {expense.item}
            <div className="d-flex">
              <div className="me-2 fw-bold d-flex align-items-center">
                {expense.amount} VND
              </div>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => {
                  handleDeleteItem(expense);
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpenseList;
