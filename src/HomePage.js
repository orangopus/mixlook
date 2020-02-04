import React from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Carousel from "./components/Carousel";
import Search from "./components/Search";

export default class HomePage extends React.Component {
  render() {
    return (
      <div>
        <Navbar />
        <Carousel />
        <Search />
      </div>
    );
  }
}
