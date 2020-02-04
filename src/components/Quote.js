import React from "react";
import "../App.css";

export default class Quote extends React.Component {
  render() {
    const quotes = [
      "Fetching pizza... 🍕",
      "Flipping tables... (╯°□°）╯︵ ┻━┻",
      "This is fine... 🔥",
      "Optimising artificial intelligence..."
    ];

    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    return (
      <div>
        <h1 className="fetching">{quote}</h1>
      </div>
    );
  }
}
