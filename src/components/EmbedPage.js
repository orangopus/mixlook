import React from "react";
import axios from "axios";
import * as Vibrant from "node-vibrant";
import "./Embed.css";

import Tooltip from "rc-tooltip";
import "rc-tooltip/assets/bootstrap.css";

const apiurl = "https://mixer.com/api/v1/channels";
const player = "https://mixer.com/embed/player/";
const chat = "https://mixer.com/embed/chat/";

export default class EmbedPage extends React.Component {
  state = {
    mixer: [],
    user: [],
    type: [],
    loading: true,
    color: "#1fbaed"
  };

  loadData() {
    let username = this.props.username;
    axios.get(`${apiurl}/${username}`).then(res => {
      this.setState({
        mixer: res.data,
        type: res.data.type,
        user: res.data.user
      });
      document.title = res.data.token + "'s embed";
    });
  }

  componentDidMount() {
    demoAsyncCall().then(() => this.setState({ loading: false }));
    this.interval = setInterval(() => this.loadData(), 1000);
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
          <h1 className="fetching">Loading Mixlook embed...</h1>
        </div>
      );
    }
    var date = new Date(this.state.mixer.createdAt);
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    if (month === 1) {
      month = "Jan";
    }
    if (month === 2) {
      month = "Feb";
    }
    if (month === 3) {
      month = "Mar";
    }
    if (month === 4) {
      month = "Apr";
    }
    if (month === 5) {
      month = "May";
    }
    if (month === 6) {
      month = "Jun";
    }
    if (month === 7) {
      month = "Jul";
    }
    if (month === 8) {
      month = "Aug";
    }
    if (month === 9) {
      month = "Sep";
    }
    if (month === 10) {
      month = "Oct";
    }
    if (month === 11) {
      month = "Nov";
    }
    if (month === 12) {
      month = "Dec";
    }
    var joinDate = day + " " + month + ", " + year;

    const followers = new Intl.NumberFormat().format(
      this.state.mixer.numFollowers
    );

    const experience = new Intl.NumberFormat().format(
      this.state.user.experience
    );

    const level = new Intl.NumberFormat().format(this.state.user.level);

    const sparks = new Intl.NumberFormat().format(this.state.user.sparks);

    let avatarStyle;

    let overlay;

    let currentlyplaying;
    if (this.state.type !== null) {
      var gameTitle = this.state.type.name;
      currentlyplaying = "Currently playing " + gameTitle;
      if (gameTitle === "Programming") {
        currentlyplaying = "Programming 👨‍💻";
      } else if (gameTitle === "Music" || gameTitle === "Radio") {
        currentlyplaying = "Playing Music 🎶";
      } else if (gameTitle === "Development") {
        currentlyplaying = "Developing 👨‍💻";
      } else if (gameTitle === "Web Show") {
        currentlyplaying = "Hosting a Web Show 📺";
      } else if (gameTitle === "Creative") {
        currentlyplaying = "Being Creative 🎨";
      }
    } else if (this.state.type === null) {
      currentlyplaying = "Currently playing nothing...";
    }

    if (this.state.mixer.online === false) {
      if (gameTitle === undefined) {
        currentlyplaying = "Last seen playing nothing...";
      } else {
        currentlyplaying = "Last seen playing " + gameTitle;
      }
    }

    var coverUrl;

    if (this.state.type) {
      coverUrl = this.state.type.coverUrl;
    } else {
      coverUrl = "https://i.imgur.com/JYgnFhN.png";
    }

    return (
      <div className="container">
        <div className="embedpage">
          <div className="embedinfo">
            <img
              style={{
                border:
                  this.state.mixer.online != true
                    ? "5px solid #7a7a7a"
                    : "5px solid #158105"
              }}
              className="avatar"
              src={this.state.user.avatarUrl}
            />
            <h1 className="username">{this.state.mixer.token}</h1>
            <h1 className="followers">{followers} followers</h1>
            <h1>{currentlyplaying}</h1>
          </div>
        </div>
      </div>
    );
  }
}

function demoAsyncCall() {
  return new Promise(resolve => setTimeout(() => resolve(), 2000));
}
