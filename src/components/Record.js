import React from "react";

const Record = (props) => {
  return (
    <div className={`record-container shadow-sm p-3 rounded ${props.class}`}>
      <span className="record-title">
        <strong>{props.title}:</strong>
        <span className="record-amount"> {props.amount} VND</span>
      </span>
    </div>
  );
};

export default Record;
