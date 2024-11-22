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
    <form onSubmit={handleChanges}>
      <div className="row">
        <div className="col-sm">
          <label for="name">Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            value={item}
            onChange={(e) => setItem(e.target.value)}
          ></input>
        </div>
        <div className="col-sm">
          <label for="cost">Cost</label>
          <input
            required="required"
            type="text"
            className="form-control"
            id="cost"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          ></input>
        </div>
      </div>
      <div className="row">
        <div className="col-sm">
          <button type="submit" className="btn btn-primary mt-3">
            Save
          </button>
        </div>
        <ToastContainer />
      </div>
    </form>
  );
};

export default AddExpenseForm;
