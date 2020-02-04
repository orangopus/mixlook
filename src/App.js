import React from "react";
import "./App.css";
import UserPage from "./UserPage";
import HomePage from "./HomePage";
import EmbedPage from "./components/EmbedPage";
import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

class App extends React.Component {
  render() {
    return (
      <Router>
        <div className="svgbg"></div>
        <div className="gamebg"></div>
        <div className="App">
          <Switch>
            <Route path="/" exact component={HomePage} />
            <Route
              path="/:user/embed"
              render={routeProps => (
                <EmbedPage username={routeProps.match.params.user} />
              )}
            />
            <Route
              path="/:user"
              render={routeProps => (
                <UserPage username={routeProps.match.params.user} />
              )}
            />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
