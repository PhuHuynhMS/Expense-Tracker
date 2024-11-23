import React, { useState, useEffect } from "react";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

const ExpenseList = (props) => {
  const [userInfoMap, setUserInfoMap] = useState({}); // Lưu trữ thông tin người dùng theo userId

  const fetchUserInfo = async (userId) => {
    if (userInfoMap[userId]) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/get-user-info/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserInfoMap((prev) => ({
          ...prev,
          [userId]: data.emails[0], // Lưu email theo userId
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    props.expenseList.forEach((expense) => {
      fetchUserInfo(expense.userId);
    });
  }, [props.expenseList]);

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
      .then((response) => response.text())
      .then((_data) => {
        props.getDataForUser(); // Tải lại danh sách chi tiêu sau khi xóa
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleClick = (expense) => {
    withReactContent(Swal)
      .fire({
        show: true,
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      })
      .then((result) => {
        if (result.isConfirmed) {
          handleDeleteItem(expense);
          withReactContent(Swal).fire(
            "Deleted!",
            "Your file has been deleted.",
            "success"
          );
        }
      });
  };

  return (
    <div className="expense-list container mt-4">
      <h2 className="text-center mb-4 text-primary">Expense List</h2>
      <ul className="list-group">
        {props.expenseList.map((expense) => (
          <li
            className="list-group-item d-flex justify-content-between align-items-center p-3 mb-2 shadow-sm"
            key={expense.id}
            style={{
              backgroundColor: "#f9f9f9",
              borderRadius: "8px",
            }}
          >
            <div>
              <h5 className="mb-1">{expense.item}</h5>
              <small className="text-muted">
                {expense.userId === props.userId
                  ? "Yours"
                  : userInfoMap[expense.userId] || "Loading..."}
              </small>
            </div>
            <div className="d-flex align-items-center">
              <div className="me-3 text-primary fw-bold">
                {expense.amount.toLocaleString()} VND
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
