import React from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Carousel from "./components/Carousel";
import Search from "./components/Search";

export default class HomePage extends React.Component {
  state = {
    loading: true
  };

  componentDidMount() {
    demoAsyncCall().then(() => this.setState({ loading: false }));
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const { loading } = this.state;

    if (loading) {
      return (
        <div className="loadingscreen loading">
          <div className="loader"></div>
          <h1 className="fetching">Loading Mixlook...</h1>
        </div>
      );
    }

    return (
      <div>
        <Navbar />
        <Carousel />
        <Search />
      </div>
    );
  }
}

function demoAsyncCall() {
  return new Promise(resolve => setTimeout(() => resolve(), 1000));
}
