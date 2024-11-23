import React from "react";
import { toast, ToastContainer } from "react-toastify";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

const AddExpenseForm = (props) => {
  const [item, setItem] = React.useState("");
  const [amount, setAmount] = React.useState(0);

  const handleChanges = (event) => {
    event.preventDefault();
    let itemTrim = item.trim();
    if (amount <= 0) {
      toast.error("Amount must be greater than 0", {
        position: "top-center",
        theme: "colored",
      });
    } else if (itemTrim.length === 0) {
      toast.error("Item name cannot be empty", {
        position: "top-center",
        theme: "colored",
      });
    } else {
      fetch("http://localhost:3001/create-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: props.user,
          item: item,
          amount: amount,
        }),
      }).then((response) => {
        if (response.status !== 200) {
          toast.error("Error creating item", {
            position: "top-center",
            theme: "colored",
          });
          return;
        }
        withReactContent(Swal).fire({
          title: "Success!",
          text: "Item created successfully",
          icon: "success",
          confirmButtonText: "Ok",
        });
        setItem("");
        setAmount(0);
        props.getDataForUser();
      });
    }
  };

  return (
    <form onSubmit={handleChanges} className="shadow-sm p-4 bg-white rounded">
      <h5 className="text-center mb-4">Add New Expense</h5>
      <div className="row g-3">
        <div className="col-sm-6">
          <label htmlFor="name" className="form-label">
            Name
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            placeholder="Enter item name"
            value={item}
            onChange={(e) => setItem(e.target.value)}
          />
        </div>
        <div className="col-sm-6">
          <label htmlFor="cost" className="form-label">
            Cost (VND)
          </label>
          <input
            type="number"
            className="form-control"
            id="cost"
            placeholder="Enter cost"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>
      <div className="row mt-4">
        <div className="col text-center">
          <button type="submit" className="btn btn-primary">
            Save Expense
          </button>
        </div>
      </div>
      <ToastContainer />
    </form>
  );
};

export default AddExpenseForm;
