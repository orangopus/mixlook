import React from "react";
import logo from "../assets/logo.png";

function Logo() {
  return (
    <a href="/">
      <img className="logo" src={logo} />
    </a>
  );
}

export default Logo;
