import React, { useState, useEffect } from "react";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

const ExpenseList = (props) => {
  const [userInfoMap, setUserInfoMap] = useState({});
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
        user_id: expense.userId,
      }),
    })
      .then(async (response) => {
        if (response.status === 400) {
          const data = await response.text();
          toast.error(data, {
            position: "top-center",
            theme: "colored",
          });
          return false;
        }
        props.getDataForUser();
        return true;
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
          const isdeleted = handleDeleteItem(expense);
          if (!isdeleted) return;
          toast.success("Deleted successfully", {
            position: "top-center",
            theme: "colored",
          });
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
