import React, { useEffect } from "react";
import Header from "../components/Header";
import Record from "../components/Record";
import ExpenseList from "../components/ExpenseList";
import AddExpenseForm from "../components/AddExpenseForm";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { doesSessionExist } from "supertokens-auth-react/recipe/session";

function Home() {
  let { userId } = useSessionContext(); // Getting user details from session context
  const [budget, setBudget] = React.useState(0); // budget for the user
  const [expenseList, setExpenseList] = React.useState([]); // list of expenses for the user
  const [totalExpense, setTotalExpense] = React.useState(0); // total expense for the user
  const [remainingAmount, setRemainingAmount] = React.useState(0); // Remaining amount for the user
  const [profile, setProfile] = React.useState();

  useEffect(() => {
    getDataForUser();
  }, []);

  // Get the budget and list of expenses for a user
  function getDataForUser() {
    fetch("http://localhost:3001/data")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        if (data["response"].budget) {
          setBudget(parseInt(data["response"].budget));
          let list = [];
          let totalAmount = 0;
          data["response"]["budgetItems"].map((row) => {
            if (row.item && row.amount) {
              let expense = {
                id: row.id,
                userId: row.user_id,
                item: row.item,
                amount: parseInt(row.amount),
              };
              totalAmount += parseInt(row.amount);
              list.push(expense);
            }
            return null;
          });
          setExpenseList(list);
          setTotalExpense(totalAmount);
          setRemainingAmount(data["response"].budget - totalAmount);
        }
        setProfile(data["userInfo"]);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <>
      <Header
        getDataForUser={getDataForUser}
        user={userId}
        budget={budget}
        profile={profile}
      />
      <div className="container mt-5">
        {/* Budget Overview */}
        <div className="row g-4">
          <div className="col-md-4">
            <Record
              class="alert alert-secondary shadow-sm"
              title="Budget"
              amount={budget}
            />
          </div>
          <div className="col-md-4">
            <Record
              class="alert alert-danger shadow-sm text-danger"
              title="Remaining"
              amount={remainingAmount}
            />
          </div>
          <div className="col-md-4">
            <Record
              class="alert alert-primary shadow-sm"
              title="Spent so far"
              amount={totalExpense}
            />
          </div>
        </div>

        {/* Expense List */}
        <div className="mt-5">
          <h3 className="text-primary">Expenses</h3>
          <div className="mt-4">
            <ExpenseList
              expenseList={expenseList}
              getDataForUser={getDataForUser}
              userId={userId}
            />
          </div>
        </div>

        {/* Add Expense Form */}
        <div className="mt-5">
          <h3 className="text-success">Add Expense</h3>
          <div className="mt-4">
            <AddExpenseForm
              getDataForUser={getDataForUser}
              user={userId}
              budget={budget}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
