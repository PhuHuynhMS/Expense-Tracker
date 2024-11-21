import React from "react";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
const ExpenseList = (props) => {
  function handleClick(expense) {
    withReactContent(Swal).fire({
      show: true,
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      preConfirm: () => {
        handleDeleteItem(expense);
      },
    });
  }
  const handleDeleteItem = (expense) => {
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
                onClick={() => handleClick(expense)}
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
