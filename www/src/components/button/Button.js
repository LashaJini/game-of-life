import React from "react";

const Button = ({ children, click }) => {
  return <button onClick={click}>{children}</button>;
};

export default Button;
