import React from "react";
import m from "../manifest.json";
import Logo from "./Logo";

function Navbar() {
  return (
    <div className="navbar">
      <div className="container nav">
        <Logo />
      </div>
    </div>
  );
}

export default Navbar;
