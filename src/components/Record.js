import React from "react";

const Record = (props) => {
  return (
    <div className={props.class}>
      <span>
        {props.title}: {props.amount} VND
      </span>
    </div>
  );
};

export default Record;
