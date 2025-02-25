/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";

const CustomCard = ({ children, className }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
};

export default CustomCard;
