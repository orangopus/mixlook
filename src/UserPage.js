import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import Navbar from "./components/Navbar";
import Quote from "./components/Quote";
import { Helmet } from "react-helmet";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import * as Vibrant from "node-vibrant";
import { useSpring, animated } from "react-spring";
import { faHome, faGreaterThanEqual } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tooltip from "rc-tooltip";
import "rc-tooltip/assets/bootstrap.css";

import { TwitterTimelineEmbed } from "react-twitter-embed";
import { render } from "@testing-library/react";

const apiurl = "https://mixer.com/api/v1";
const player = "https://mixer.com/embed/player/";
const chat = "https://mixer.com/embed/chat/";

export default class UserPage extends React.Component {
  state = {
    loading: true,
    mixer: [],
    user: [],
    type: [],
    social: [],
    steam: [],
    color: "#1fbaed",
    hosteeName: [],
    hosteeAvatar: [],
    clips: [],
    smclips: [],
    smerror: []
  };

  loadData() {
    let username = this.props.username;
    axios
      .get(`${apiurl}/channels/${username}`)
      .then(res => {
        this.setState({
          mixer: res.data,
          type: res.data.type,
          user: res.data.user,
          social: res.data.user.social
        });
        document.title = res.data.token;
        document.querySelector("link[rel*='icon']").href =
          res.data.user.avatarUrl;
        document.getElementsByClassName("gamebg")[0].style.background =
          "url(" + this.state.type.backgroundUrl + ")";
        document.querySelectorAll("body")[0].style.background = "#151D28";

        Vibrant.from(
          "https://cors-anywhere.herokuapp.com/" + res.data.user.avatarUrl
        )
          .getPalette()
          .then(c => {
            let clr = "";
            if (c.Vibrant) {
              this.setState({ color: c.Vibrant.getHex() });
            }
          });
      })
      .catch(function(error) {
        if (!error.response || error.code === "ECONNABORTED") {
          // network error
        }
      });
  }

  loadUserData() {
    axios.get(`${apiurl}/users/${this.state.mixer.userId}`).then(res => {
      this.setState({
        steam: res.data.social.steam
      });
    });
  }

  loadHostData() {
    let username = this.props.username;
    axios.get(`${apiurl}/channels/${this.state.mixer.hosteeId}`).then(res => {
      this.setState({
        hosteeName: res.data.token,
        hosteeAvatar: res.data.user.avatarUrl
      });
    });
  }

  loadClipsData() {
    axios.get(`${apiurl}/clips/channels/${this.state.mixer.id}`).then(res => {
      this.setState({
        clips: res.data
      });
    });

    axios
      .get(`https://api.smartclips.app/clip/list/${this.state.mixer.id}/1`)
      .then(res => {
        this.setState({
          smclips: res.data.docs
        });
      })
      .catch(error => {
        this.setState({
          smerror: error.response.status
        });
      });
  }

  componentDidMount() {
    demoAsyncCall().then(() => this.setState({ loading: false }));
    this.interval = setInterval(() => this.loadData(), 1000);
    this.interval = setInterval(() => this.loadUserData(), 1000);
    this.interval = setInterval(() => this.loadHostData(), 1000);
    this.interval = setInterval(() => this.loadClipsData(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const { loading } = this.state;

    if (loading) {
      return (
        <div className="loadingscreen">
          <Navbar />
          <div className="loader"></div>
          <Quote />
        </div>
      );
    }

    // Conditionals

    let socials = this.state.social;

    let tip;

    if (this.state.mixer.token === "Cheese") {
      tip = (
        <a href="https://www.tipeeestream.com/cheese/donation" target="_blank">
          <span className="donatelabel">
            <i class="fas fa-dollar-sign"></i> Tip
          </span>
        </a>
      );
    } else if (this.state.mixer.token === "Solsey") {
      tip = (
        <a href="https://streamlabs.com/Solsey/tip" target="_blank">
          <span className="donatelabel">
            <i class="fas fa-dollar-sign"></i> Tip
          </span>
        </a>
      );
    } else {
      tip = " ";
    }

    // Hosting checking

    let hosting;
    let hostName = this.state.hosteeName;
    if (hostName) {
      hosting = (
        <div
          className="container overlay"
          style={{
            display: this.state.mixer.hosteeId != null ? "block" : "none"
          }}
        >
          <span className="grey dark">
            {this.state.mixer.token} {" is hosting "}{" "}
            <a className="green hosted" href={this.state.hosteeName}>
              <img className="hostAvatar" src={this.state.hosteeAvatar} />{" "}
              {this.state.hosteeName}
            </a>
          </span>
        </div>
      );
    } else if ((hostName = "Null")) {
      hosting = <div></div>;
    }

    var smclips;
    if (this.state.mixer.partnered === false) {
      if (this.state.smerror === 404) {
        smclips = <div style={{ marginTop: "100px" }}></div>;
      }
      if (this.state.smclips.length > 2) {
        smclips = (
          <div className="container">
            <div className="clips row">
              <a
                target="_blank"
                href={`https://smartclips.app/clip/${this.state.smclips[0]._id}`}
              >
                <div className="clipsitem">
                  <span className="clipsviews scspan">
                    <img
                      className="scicon"
                      src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjwh%0D%0ARE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cu%0D%0AdzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+Cjxzdmcgd2lkdGg9IjEwMCUi%0D%0AIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDEyOTggMTIwMiIgdmVyc2lvbj0iMS4xIiB4bWxu%0D%0Acz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3Lncz%0D%0ALm9yZy8xOTk5L3hsaW5rIiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxuczpzZXJpZj0iaHR0cDov%0D%0AL3d3dy5zZXJpZi5jb20vIiBzdHlsZT0iZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5v%0D%0AZGQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjI7Ij4KICAgIDxnIHRy%0D%0AYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMCwtMykiPgogICAgICAgIDxnIHRyYW5zZm9ybT0ibWF0%0D%0Acml4KDQuMTY2NjcsMCwwLDQuMTY2NjcsMCwwKSI+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0wLDEz%0D%0AMy43MDlMMCwxMTQuMjgzQzMxLjA2NCwxMDguNjkgMzAuMTU4LDc2LjY3OSAyOS44OTMsNTIuNjgy%0D%0AQzI5LjgxNyw0My4yNyAyOS43OCwzMy41OTYgMzEuOTM0LDI0LjQxMUMzNC43NjksMTIuMzk0IDQy%0D%0ALjg1Niw2LjU3NCA1NC4yNjksMy4xNzNDNjUuMDc4LC0wLjA3OCA3OC4zOCwwLjk0MiA4OS42OCww%0D%0ALjk0MkwyMjUuNDY3LDAuOTQyQzIzNS43MDgsMC45NDIgMjQ3LjMxLDAuMTg3IDI1Ny4xNzQsMy4x%0D%0ANzNDMjY4LjU4OCw2LjU3NCAyNzYuNjc0LDEyLjM5NCAyNzkuNTA5LDI0LjQxMUMyODEuNjYzLDMz%0D%0ALjU5NiAyODEuNjI2LDQzLjI3IDI4MS41NTEsNTIuNjgyQzI4MS4yODUsNzYuNjc5IDI4MC4zNzks%0D%0AMTA4LjY5IDMxMS40NDQsMTE0LjI4M0wzMTEuNDQ0LDEzMy43MDlDMzAzLjI4LDEzNS4yOTUgMjk1%0D%0ALjk0OSwxMzguOTYyIDI5MC42NTgsMTQ1Ljk1NEMyNzEuOCwxNzAuNzQ2IDI5MS4wMzYsMjA3LjAy%0D%0ANyAyNzUuMzg5LDIzMi41NzVDMjY0LjkyMiwyNDkuNjIgMjQwLjE2OCwyNDYuNzg1IDIyMy4yLDI0%0D%0ANi43ODVMOTAuMTM0LDI0Ni43ODVDNzIuNzg3LDI0Ni43ODUgNDYuODI0LDI1MC4wNzMgMzYuMDUz%0D%0ALDIzMi41NzVDMjcuMDIxLDIxNy43OTcgMzAuMTIsMTk3LjcyOSAyOS41OTEsMTgwLjkxM0MyOC45%0D%0AMSwxNTkuNzg2IDI0LjE4NiwxMzguMzU3IDAsMTMzLjcwOVoiIHN0eWxlPSJmaWxsOnJnYigyMSwx%0D%0AODksMjMzKTsiLz4KICAgICAgICAgICAgPHBhdGggZD0iTTI4My40MzksMTYxLjUyNUMyNzcuOTYs%0D%0AMTg0LjQyNiAyODcuOTc1LDIxMS45NzcgMjc1LjM4OSwyMzIuNTc1QzI2NC45MjIsMjQ5LjYyIDI0%0D%0AMC4xNjgsMjQ2Ljc4NSAyMjMuMiwyNDYuNzg1TDEzMC42MSwyNDYuNzg1TDg1LjMzMywxNjkuOTE0%0D%0ATDIyNy4yMDUsODEuNzQzTDI4My40MzksMTYxLjUyNVoiIHN0eWxlPSJmaWxsOnJnYig5LDg1LDE1%0D%0ANCk7Ii8+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNTYuMjMzLDQyLjI1QzIwMi4zMzgsNDIuMjUg%0D%0AMjM5LjcxNSw3OS42MjggMjM5LjcxNSwxMjUuNzM0QzIzOS43MTUsMTcxLjg0MSAyMDIuMzM4LDIw%0D%0AOS4yNTYgMTU2LjIzMywyMDkuMjU2QzExMC4xMjcsMjA5LjI1NiA3Mi43MTIsMTcxLjg0MSA3Mi43%0D%0AMTIsMTI1LjczNEM3Mi43MTIsNzkuNjI4IDExMC4xMjcsNDIuMjUgMTU2LjIzMyw0Mi4yNVoiIHN0%0D%0AeWxlPSJmaWxsOndoaXRlOyIvPgogICAgICAgICAgICA8cGF0aCBkPSJNMjAyLjcxNywxMzQuNDI2%0D%0ATDE3Mi4xODEsMTUyLjA3NkwxNDEuMDAxLDE3MC4wNjZDMTMwLjU3MSwxNzYuMDc1IDEyNi45MDYs%0D%0AMTczLjg0NCAxMjYuOTA2LDE2MS4yMjFMMTI2LjkwNiwxMjUuOTIzTDEyNi45MDYsODkuOTQ0QzEy%0D%0ANi45MDYsNzcuODg5IDEzMC42ODQsNzUuODQ3IDE0MS42MDcsODIuMTU5TDE3Mi4xODEsOTkuODA5%0D%0ATDIwMy4zNTgsMTE3Ljc5OEMyMTMuNzksMTIzLjgwNiAyMTMuNjc1LDEyOC4xMTUgMjAyLjcxNywx%0D%0AMzQuNDI2WiIgc3R5bGU9ImZpbGw6cmdiKDg4LDg5LDkxKTsiLz4KICAgICAgICAgICAgPHBhdGgg%0D%0AZD0iTTIzMy4xNzYsMTY3LjY0NkMyNDMuNDU1LDE3NC43MTQgMjUyLjkwNCwxODUuMDY5IDI2MC42%0D%0AODksMTk0Ljc0NEMyNjguNjYzLDIwNC42NDYgMjc2LjIyMSwyMTUuNTMgMjgyLjU3MSwyMjYuNjAz%0D%0AQzI4NC43NjIsMjMwLjQ1OSAyODcuMDMsMjM0LjYxNSAyODguNjkyLDIzOC43NzNDMjkwLjc3MSwy%0D%0ANDMuOTg5IDI5MS45MDUsMjUwLjQxNCAyODYuMzEyLDI1NC4xMThMMjMzLjc0MywyODlMMjI5LjIw%0D%0AOSwyODYuNDI5QzIxNy45ODUsMjgwLjA4IDIwNi43OTgsMjczLjM1MyAxOTUuOTE0LDI2Ni40NzRD%0D%0AMTg5LjA3NCwyNjIuMTI5IDE4Mi4xNTgsMjU3LjYzMyAxNzUuNjk2LDI1Mi43OTVDMTcxLjM0OCwy%0D%0ANDkuNTQ0IDE2NC42MjIsMjQ0LjQ0MyAxNjIuNjE4LDIzOS4yNjVDMTU5LjQ4MiwyMzEuMjEzIDE2%0D%0AMi43NzEsMjE3LjIzMiAxNjQuOTYxLDIwOS4wNjhDMTY2LjkyOCwyMDEuOTI1IDE3MS4wMDksMTg4%0D%0ALjYyMSAxNzUuNDMsMTgyLjcyNkMxNzcuMjA2LDE4MC4zNDUgMTc5LjU4NywxNzguODcxIDE4Mi4z%0D%0AODUsMTc4LjAwMkwxNTcuNzgyLDE1Ni4xMjFDMTQ5LjMxOCwxNDkuNjk1IDE0Ni4yOTMsMTM4LjQz%0D%0AMyAxNTMuMjQ2LDEyOS40NzZDMTU5Ljc4NSwxMjEuMDg3IDE3MS4wNDYsMTE5LjcyNSAxNzkuNTEx%0D%0ALDEyNS44NDdMMTc5LjY2MywxMjUuOTIzTDIzMy4xNzYsMTY3LjY0NloiIHN0eWxlPSJmaWxsOndo%0D%0AaXRlOyIvPgogICAgICAgICAgICA8cGF0aCBkPSJNMjI4LjE1LDE3NC40ODdMMTc0LjU2MSwxMzIu%0D%0ANzI2QzE3NC41NjEsMTMyLjcyNiAxNjYuMTcyLDEyNi43MTcgMTU5Ljk3MywxMzQuNjkxQzE1My43%0D%0AMzgsMTQyLjcwMyAxNjMuMTQ3LDE0OS41MDUgMTYzLjE0NywxNDkuNTA1TDIwOC43MjUsMTkwLjA5%0D%0ANkMyMDguNzI1LDE5MC4wOTYgMTg2LjkyLDE4MS41OTIgMTgyLjIzMywxODcuODI4QzE3Ny41ODUs%0D%0AMTk0LjA2NCAxNjYuOTY2LDIyNi45MDYgMTcwLjU1NSwyMzYuMjAzQzE3NC4xNDUsMjQ1LjUwMSAy%0D%0AMzMuMzY1LDI3OS4wMjMgMjMzLjM2NSwyNzkuMDIzTDI4MS41ODgsMjQ3LjA0OUMyODUuNDgxLDI0%0D%0ANC40NDMgMjU0LjYwNCwxOTIuNTkgMjI4LjE1LDE3NC40ODdaIiBzdHlsZT0iZmlsbDpyZ2IoODgs%0D%0AODksOTEpOyIvPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+Cg=="
                    />
                  </span>
                  <img
                    className="clipsthumb"
                    src={`https://cdn.sclip.cc/file/smartclips/${this.state.smclips[0]._id}.jpg`}
                  />
                  <h1 className="clipstitle">
                    {this.state.smclips[0].meta.title}
                  </h1>
                </div>
              </a>
              <a
                target="_blank"
                href={`https://smartclips.app/clip/${this.state.smclips[1]._id}`}
              >
                <div className="clipsitem clipsitem__middle">
                  <span className="clipsviews scspan">
                    <img
                      className="scicon"
                      src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjwh%0D%0ARE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cu%0D%0AdzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+Cjxzdmcgd2lkdGg9IjEwMCUi%0D%0AIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDEyOTggMTIwMiIgdmVyc2lvbj0iMS4xIiB4bWxu%0D%0Acz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3Lncz%0D%0ALm9yZy8xOTk5L3hsaW5rIiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxuczpzZXJpZj0iaHR0cDov%0D%0AL3d3dy5zZXJpZi5jb20vIiBzdHlsZT0iZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5v%0D%0AZGQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjI7Ij4KICAgIDxnIHRy%0D%0AYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMCwtMykiPgogICAgICAgIDxnIHRyYW5zZm9ybT0ibWF0%0D%0Acml4KDQuMTY2NjcsMCwwLDQuMTY2NjcsMCwwKSI+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0wLDEz%0D%0AMy43MDlMMCwxMTQuMjgzQzMxLjA2NCwxMDguNjkgMzAuMTU4LDc2LjY3OSAyOS44OTMsNTIuNjgy%0D%0AQzI5LjgxNyw0My4yNyAyOS43OCwzMy41OTYgMzEuOTM0LDI0LjQxMUMzNC43NjksMTIuMzk0IDQy%0D%0ALjg1Niw2LjU3NCA1NC4yNjksMy4xNzNDNjUuMDc4LC0wLjA3OCA3OC4zOCwwLjk0MiA4OS42OCww%0D%0ALjk0MkwyMjUuNDY3LDAuOTQyQzIzNS43MDgsMC45NDIgMjQ3LjMxLDAuMTg3IDI1Ny4xNzQsMy4x%0D%0ANzNDMjY4LjU4OCw2LjU3NCAyNzYuNjc0LDEyLjM5NCAyNzkuNTA5LDI0LjQxMUMyODEuNjYzLDMz%0D%0ALjU5NiAyODEuNjI2LDQzLjI3IDI4MS41NTEsNTIuNjgyQzI4MS4yODUsNzYuNjc5IDI4MC4zNzks%0D%0AMTA4LjY5IDMxMS40NDQsMTE0LjI4M0wzMTEuNDQ0LDEzMy43MDlDMzAzLjI4LDEzNS4yOTUgMjk1%0D%0ALjk0OSwxMzguOTYyIDI5MC42NTgsMTQ1Ljk1NEMyNzEuOCwxNzAuNzQ2IDI5MS4wMzYsMjA3LjAy%0D%0ANyAyNzUuMzg5LDIzMi41NzVDMjY0LjkyMiwyNDkuNjIgMjQwLjE2OCwyNDYuNzg1IDIyMy4yLDI0%0D%0ANi43ODVMOTAuMTM0LDI0Ni43ODVDNzIuNzg3LDI0Ni43ODUgNDYuODI0LDI1MC4wNzMgMzYuMDUz%0D%0ALDIzMi41NzVDMjcuMDIxLDIxNy43OTcgMzAuMTIsMTk3LjcyOSAyOS41OTEsMTgwLjkxM0MyOC45%0D%0AMSwxNTkuNzg2IDI0LjE4NiwxMzguMzU3IDAsMTMzLjcwOVoiIHN0eWxlPSJmaWxsOnJnYigyMSwx%0D%0AODksMjMzKTsiLz4KICAgICAgICAgICAgPHBhdGggZD0iTTI4My40MzksMTYxLjUyNUMyNzcuOTYs%0D%0AMTg0LjQyNiAyODcuOTc1LDIxMS45NzcgMjc1LjM4OSwyMzIuNTc1QzI2NC45MjIsMjQ5LjYyIDI0%0D%0AMC4xNjgsMjQ2Ljc4NSAyMjMuMiwyNDYuNzg1TDEzMC42MSwyNDYuNzg1TDg1LjMzMywxNjkuOTE0%0D%0ATDIyNy4yMDUsODEuNzQzTDI4My40MzksMTYxLjUyNVoiIHN0eWxlPSJmaWxsOnJnYig5LDg1LDE1%0D%0ANCk7Ii8+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNTYuMjMzLDQyLjI1QzIwMi4zMzgsNDIuMjUg%0D%0AMjM5LjcxNSw3OS42MjggMjM5LjcxNSwxMjUuNzM0QzIzOS43MTUsMTcxLjg0MSAyMDIuMzM4LDIw%0D%0AOS4yNTYgMTU2LjIzMywyMDkuMjU2QzExMC4xMjcsMjA5LjI1NiA3Mi43MTIsMTcxLjg0MSA3Mi43%0D%0AMTIsMTI1LjczNEM3Mi43MTIsNzkuNjI4IDExMC4xMjcsNDIuMjUgMTU2LjIzMyw0Mi4yNVoiIHN0%0D%0AeWxlPSJmaWxsOndoaXRlOyIvPgogICAgICAgICAgICA8cGF0aCBkPSJNMjAyLjcxNywxMzQuNDI2%0D%0ATDE3Mi4xODEsMTUyLjA3NkwxNDEuMDAxLDE3MC4wNjZDMTMwLjU3MSwxNzYuMDc1IDEyNi45MDYs%0D%0AMTczLjg0NCAxMjYuOTA2LDE2MS4yMjFMMTI2LjkwNiwxMjUuOTIzTDEyNi45MDYsODkuOTQ0QzEy%0D%0ANi45MDYsNzcuODg5IDEzMC42ODQsNzUuODQ3IDE0MS42MDcsODIuMTU5TDE3Mi4xODEsOTkuODA5%0D%0ATDIwMy4zNTgsMTE3Ljc5OEMyMTMuNzksMTIzLjgwNiAyMTMuNjc1LDEyOC4xMTUgMjAyLjcxNywx%0D%0AMzQuNDI2WiIgc3R5bGU9ImZpbGw6cmdiKDg4LDg5LDkxKTsiLz4KICAgICAgICAgICAgPHBhdGgg%0D%0AZD0iTTIzMy4xNzYsMTY3LjY0NkMyNDMuNDU1LDE3NC43MTQgMjUyLjkwNCwxODUuMDY5IDI2MC42%0D%0AODksMTk0Ljc0NEMyNjguNjYzLDIwNC42NDYgMjc2LjIyMSwyMTUuNTMgMjgyLjU3MSwyMjYuNjAz%0D%0AQzI4NC43NjIsMjMwLjQ1OSAyODcuMDMsMjM0LjYxNSAyODguNjkyLDIzOC43NzNDMjkwLjc3MSwy%0D%0ANDMuOTg5IDI5MS45MDUsMjUwLjQxNCAyODYuMzEyLDI1NC4xMThMMjMzLjc0MywyODlMMjI5LjIw%0D%0AOSwyODYuNDI5QzIxNy45ODUsMjgwLjA4IDIwNi43OTgsMjczLjM1MyAxOTUuOTE0LDI2Ni40NzRD%0D%0AMTg5LjA3NCwyNjIuMTI5IDE4Mi4xNTgsMjU3LjYzMyAxNzUuNjk2LDI1Mi43OTVDMTcxLjM0OCwy%0D%0ANDkuNTQ0IDE2NC42MjIsMjQ0LjQ0MyAxNjIuNjE4LDIzOS4yNjVDMTU5LjQ4MiwyMzEuMjEzIDE2%0D%0AMi43NzEsMjE3LjIzMiAxNjQuOTYxLDIwOS4wNjhDMTY2LjkyOCwyMDEuOTI1IDE3MS4wMDksMTg4%0D%0ALjYyMSAxNzUuNDMsMTgyLjcyNkMxNzcuMjA2LDE4MC4zNDUgMTc5LjU4NywxNzguODcxIDE4Mi4z%0D%0AODUsMTc4LjAwMkwxNTcuNzgyLDE1Ni4xMjFDMTQ5LjMxOCwxNDkuNjk1IDE0Ni4yOTMsMTM4LjQz%0D%0AMyAxNTMuMjQ2LDEyOS40NzZDMTU5Ljc4NSwxMjEuMDg3IDE3MS4wNDYsMTE5LjcyNSAxNzkuNTEx%0D%0ALDEyNS44NDdMMTc5LjY2MywxMjUuOTIzTDIzMy4xNzYsMTY3LjY0NloiIHN0eWxlPSJmaWxsOndo%0D%0AaXRlOyIvPgogICAgICAgICAgICA8cGF0aCBkPSJNMjI4LjE1LDE3NC40ODdMMTc0LjU2MSwxMzIu%0D%0ANzI2QzE3NC41NjEsMTMyLjcyNiAxNjYuMTcyLDEyNi43MTcgMTU5Ljk3MywxMzQuNjkxQzE1My43%0D%0AMzgsMTQyLjcwMyAxNjMuMTQ3LDE0OS41MDUgMTYzLjE0NywxNDkuNTA1TDIwOC43MjUsMTkwLjA5%0D%0ANkMyMDguNzI1LDE5MC4wOTYgMTg2LjkyLDE4MS41OTIgMTgyLjIzMywxODcuODI4QzE3Ny41ODUs%0D%0AMTk0LjA2NCAxNjYuOTY2LDIyNi45MDYgMTcwLjU1NSwyMzYuMjAzQzE3NC4xNDUsMjQ1LjUwMSAy%0D%0AMzMuMzY1LDI3OS4wMjMgMjMzLjM2NSwyNzkuMDIzTDI4MS41ODgsMjQ3LjA0OUMyODUuNDgxLDI0%0D%0ANC40NDMgMjU0LjYwNCwxOTIuNTkgMjI4LjE1LDE3NC40ODdaIiBzdHlsZT0iZmlsbDpyZ2IoODgs%0D%0AODksOTEpOyIvPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+Cg=="
                    />
                  </span>
                  <img
                    className="clipsthumb"
                    src={`https://cdn.sclip.cc/file/smartclips/${this.state.smclips[1]._id}.jpg`}
                  />
                  <h1 className="clipstitle">
                    {this.state.smclips[1].meta.title}
                  </h1>
                </div>
              </a>
              <a
                target="_blank"
                href={`https://smartclips.app/clip/${this.state.smclips[2]._id}`}
              >
                <div className="clipsitem">
                  <span className="clipsviews scspan">
                    <img
                      className="scicon"
                      src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjwh%0D%0ARE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cu%0D%0AdzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+Cjxzdmcgd2lkdGg9IjEwMCUi%0D%0AIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDEyOTggMTIwMiIgdmVyc2lvbj0iMS4xIiB4bWxu%0D%0Acz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3Lncz%0D%0ALm9yZy8xOTk5L3hsaW5rIiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxuczpzZXJpZj0iaHR0cDov%0D%0AL3d3dy5zZXJpZi5jb20vIiBzdHlsZT0iZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5v%0D%0AZGQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjI7Ij4KICAgIDxnIHRy%0D%0AYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMCwtMykiPgogICAgICAgIDxnIHRyYW5zZm9ybT0ibWF0%0D%0Acml4KDQuMTY2NjcsMCwwLDQuMTY2NjcsMCwwKSI+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0wLDEz%0D%0AMy43MDlMMCwxMTQuMjgzQzMxLjA2NCwxMDguNjkgMzAuMTU4LDc2LjY3OSAyOS44OTMsNTIuNjgy%0D%0AQzI5LjgxNyw0My4yNyAyOS43OCwzMy41OTYgMzEuOTM0LDI0LjQxMUMzNC43NjksMTIuMzk0IDQy%0D%0ALjg1Niw2LjU3NCA1NC4yNjksMy4xNzNDNjUuMDc4LC0wLjA3OCA3OC4zOCwwLjk0MiA4OS42OCww%0D%0ALjk0MkwyMjUuNDY3LDAuOTQyQzIzNS43MDgsMC45NDIgMjQ3LjMxLDAuMTg3IDI1Ny4xNzQsMy4x%0D%0ANzNDMjY4LjU4OCw2LjU3NCAyNzYuNjc0LDEyLjM5NCAyNzkuNTA5LDI0LjQxMUMyODEuNjYzLDMz%0D%0ALjU5NiAyODEuNjI2LDQzLjI3IDI4MS41NTEsNTIuNjgyQzI4MS4yODUsNzYuNjc5IDI4MC4zNzks%0D%0AMTA4LjY5IDMxMS40NDQsMTE0LjI4M0wzMTEuNDQ0LDEzMy43MDlDMzAzLjI4LDEzNS4yOTUgMjk1%0D%0ALjk0OSwxMzguOTYyIDI5MC42NTgsMTQ1Ljk1NEMyNzEuOCwxNzAuNzQ2IDI5MS4wMzYsMjA3LjAy%0D%0ANyAyNzUuMzg5LDIzMi41NzVDMjY0LjkyMiwyNDkuNjIgMjQwLjE2OCwyNDYuNzg1IDIyMy4yLDI0%0D%0ANi43ODVMOTAuMTM0LDI0Ni43ODVDNzIuNzg3LDI0Ni43ODUgNDYuODI0LDI1MC4wNzMgMzYuMDUz%0D%0ALDIzMi41NzVDMjcuMDIxLDIxNy43OTcgMzAuMTIsMTk3LjcyOSAyOS41OTEsMTgwLjkxM0MyOC45%0D%0AMSwxNTkuNzg2IDI0LjE4NiwxMzguMzU3IDAsMTMzLjcwOVoiIHN0eWxlPSJmaWxsOnJnYigyMSwx%0D%0AODksMjMzKTsiLz4KICAgICAgICAgICAgPHBhdGggZD0iTTI4My40MzksMTYxLjUyNUMyNzcuOTYs%0D%0AMTg0LjQyNiAyODcuOTc1LDIxMS45NzcgMjc1LjM4OSwyMzIuNTc1QzI2NC45MjIsMjQ5LjYyIDI0%0D%0AMC4xNjgsMjQ2Ljc4NSAyMjMuMiwyNDYuNzg1TDEzMC42MSwyNDYuNzg1TDg1LjMzMywxNjkuOTE0%0D%0ATDIyNy4yMDUsODEuNzQzTDI4My40MzksMTYxLjUyNVoiIHN0eWxlPSJmaWxsOnJnYig5LDg1LDE1%0D%0ANCk7Ii8+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNTYuMjMzLDQyLjI1QzIwMi4zMzgsNDIuMjUg%0D%0AMjM5LjcxNSw3OS42MjggMjM5LjcxNSwxMjUuNzM0QzIzOS43MTUsMTcxLjg0MSAyMDIuMzM4LDIw%0D%0AOS4yNTYgMTU2LjIzMywyMDkuMjU2QzExMC4xMjcsMjA5LjI1NiA3Mi43MTIsMTcxLjg0MSA3Mi43%0D%0AMTIsMTI1LjczNEM3Mi43MTIsNzkuNjI4IDExMC4xMjcsNDIuMjUgMTU2LjIzMyw0Mi4yNVoiIHN0%0D%0AeWxlPSJmaWxsOndoaXRlOyIvPgogICAgICAgICAgICA8cGF0aCBkPSJNMjAyLjcxNywxMzQuNDI2%0D%0ATDE3Mi4xODEsMTUyLjA3NkwxNDEuMDAxLDE3MC4wNjZDMTMwLjU3MSwxNzYuMDc1IDEyNi45MDYs%0D%0AMTczLjg0NCAxMjYuOTA2LDE2MS4yMjFMMTI2LjkwNiwxMjUuOTIzTDEyNi45MDYsODkuOTQ0QzEy%0D%0ANi45MDYsNzcuODg5IDEzMC42ODQsNzUuODQ3IDE0MS42MDcsODIuMTU5TDE3Mi4xODEsOTkuODA5%0D%0ATDIwMy4zNTgsMTE3Ljc5OEMyMTMuNzksMTIzLjgwNiAyMTMuNjc1LDEyOC4xMTUgMjAyLjcxNywx%0D%0AMzQuNDI2WiIgc3R5bGU9ImZpbGw6cmdiKDg4LDg5LDkxKTsiLz4KICAgICAgICAgICAgPHBhdGgg%0D%0AZD0iTTIzMy4xNzYsMTY3LjY0NkMyNDMuNDU1LDE3NC43MTQgMjUyLjkwNCwxODUuMDY5IDI2MC42%0D%0AODksMTk0Ljc0NEMyNjguNjYzLDIwNC42NDYgMjc2LjIyMSwyMTUuNTMgMjgyLjU3MSwyMjYuNjAz%0D%0AQzI4NC43NjIsMjMwLjQ1OSAyODcuMDMsMjM0LjYxNSAyODguNjkyLDIzOC43NzNDMjkwLjc3MSwy%0D%0ANDMuOTg5IDI5MS45MDUsMjUwLjQxNCAyODYuMzEyLDI1NC4xMThMMjMzLjc0MywyODlMMjI5LjIw%0D%0AOSwyODYuNDI5QzIxNy45ODUsMjgwLjA4IDIwNi43OTgsMjczLjM1MyAxOTUuOTE0LDI2Ni40NzRD%0D%0AMTg5LjA3NCwyNjIuMTI5IDE4Mi4xNTgsMjU3LjYzMyAxNzUuNjk2LDI1Mi43OTVDMTcxLjM0OCwy%0D%0ANDkuNTQ0IDE2NC42MjIsMjQ0LjQ0MyAxNjIuNjE4LDIzOS4yNjVDMTU5LjQ4MiwyMzEuMjEzIDE2%0D%0AMi43NzEsMjE3LjIzMiAxNjQuOTYxLDIwOS4wNjhDMTY2LjkyOCwyMDEuOTI1IDE3MS4wMDksMTg4%0D%0ALjYyMSAxNzUuNDMsMTgyLjcyNkMxNzcuMjA2LDE4MC4zNDUgMTc5LjU4NywxNzguODcxIDE4Mi4z%0D%0AODUsMTc4LjAwMkwxNTcuNzgyLDE1Ni4xMjFDMTQ5LjMxOCwxNDkuNjk1IDE0Ni4yOTMsMTM4LjQz%0D%0AMyAxNTMuMjQ2LDEyOS40NzZDMTU5Ljc4NSwxMjEuMDg3IDE3MS4wNDYsMTE5LjcyNSAxNzkuNTEx%0D%0ALDEyNS44NDdMMTc5LjY2MywxMjUuOTIzTDIzMy4xNzYsMTY3LjY0NloiIHN0eWxlPSJmaWxsOndo%0D%0AaXRlOyIvPgogICAgICAgICAgICA8cGF0aCBkPSJNMjI4LjE1LDE3NC40ODdMMTc0LjU2MSwxMzIu%0D%0ANzI2QzE3NC41NjEsMTMyLjcyNiAxNjYuMTcyLDEyNi43MTcgMTU5Ljk3MywxMzQuNjkxQzE1My43%0D%0AMzgsMTQyLjcwMyAxNjMuMTQ3LDE0OS41MDUgMTYzLjE0NywxNDkuNTA1TDIwOC43MjUsMTkwLjA5%0D%0ANkMyMDguNzI1LDE5MC4wOTYgMTg2LjkyLDE4MS41OTIgMTgyLjIzMywxODcuODI4QzE3Ny41ODUs%0D%0AMTk0LjA2NCAxNjYuOTY2LDIyNi45MDYgMTcwLjU1NSwyMzYuMjAzQzE3NC4xNDUsMjQ1LjUwMSAy%0D%0AMzMuMzY1LDI3OS4wMjMgMjMzLjM2NSwyNzkuMDIzTDI4MS41ODgsMjQ3LjA0OUMyODUuNDgxLDI0%0D%0ANC40NDMgMjU0LjYwNCwxOTIuNTkgMjI4LjE1LDE3NC40ODdaIiBzdHlsZT0iZmlsbDpyZ2IoODgs%0D%0AODksOTEpOyIvPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+Cg=="
                    />
                  </span>
                  <img
                    className="clipsthumb"
                    src={`https://cdn.sclip.cc/file/smartclips/${this.state.smclips[2]._id}.jpg`}
                  />
                  <h1 className="clipstitle">
                    {this.state.smclips[2].meta.title}
                  </h1>
                </div>
              </a>
            </div>
          </div>
        );
      } else if (this.state.smclips.length === 2) {
        smclips = (
          <div className="container">
            <div className="clips row">
              <a
                target="_blank"
                href={`https://smartclips.app/clip/${this.state.smclips[0]._id}`}
              >
                <div className="clipsitem">
                  <span className="clipsviews scspan">
                    <img
                      className="scicon"
                      src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjwh%0D%0ARE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cu%0D%0AdzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+Cjxzdmcgd2lkdGg9IjEwMCUi%0D%0AIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDEyOTggMTIwMiIgdmVyc2lvbj0iMS4xIiB4bWxu%0D%0Acz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3Lncz%0D%0ALm9yZy8xOTk5L3hsaW5rIiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxuczpzZXJpZj0iaHR0cDov%0D%0AL3d3dy5zZXJpZi5jb20vIiBzdHlsZT0iZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5v%0D%0AZGQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjI7Ij4KICAgIDxnIHRy%0D%0AYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMCwtMykiPgogICAgICAgIDxnIHRyYW5zZm9ybT0ibWF0%0D%0Acml4KDQuMTY2NjcsMCwwLDQuMTY2NjcsMCwwKSI+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0wLDEz%0D%0AMy43MDlMMCwxMTQuMjgzQzMxLjA2NCwxMDguNjkgMzAuMTU4LDc2LjY3OSAyOS44OTMsNTIuNjgy%0D%0AQzI5LjgxNyw0My4yNyAyOS43OCwzMy41OTYgMzEuOTM0LDI0LjQxMUMzNC43NjksMTIuMzk0IDQy%0D%0ALjg1Niw2LjU3NCA1NC4yNjksMy4xNzNDNjUuMDc4LC0wLjA3OCA3OC4zOCwwLjk0MiA4OS42OCww%0D%0ALjk0MkwyMjUuNDY3LDAuOTQyQzIzNS43MDgsMC45NDIgMjQ3LjMxLDAuMTg3IDI1Ny4xNzQsMy4x%0D%0ANzNDMjY4LjU4OCw2LjU3NCAyNzYuNjc0LDEyLjM5NCAyNzkuNTA5LDI0LjQxMUMyODEuNjYzLDMz%0D%0ALjU5NiAyODEuNjI2LDQzLjI3IDI4MS41NTEsNTIuNjgyQzI4MS4yODUsNzYuNjc5IDI4MC4zNzks%0D%0AMTA4LjY5IDMxMS40NDQsMTE0LjI4M0wzMTEuNDQ0LDEzMy43MDlDMzAzLjI4LDEzNS4yOTUgMjk1%0D%0ALjk0OSwxMzguOTYyIDI5MC42NTgsMTQ1Ljk1NEMyNzEuOCwxNzAuNzQ2IDI5MS4wMzYsMjA3LjAy%0D%0ANyAyNzUuMzg5LDIzMi41NzVDMjY0LjkyMiwyNDkuNjIgMjQwLjE2OCwyNDYuNzg1IDIyMy4yLDI0%0D%0ANi43ODVMOTAuMTM0LDI0Ni43ODVDNzIuNzg3LDI0Ni43ODUgNDYuODI0LDI1MC4wNzMgMzYuMDUz%0D%0ALDIzMi41NzVDMjcuMDIxLDIxNy43OTcgMzAuMTIsMTk3LjcyOSAyOS41OTEsMTgwLjkxM0MyOC45%0D%0AMSwxNTkuNzg2IDI0LjE4NiwxMzguMzU3IDAsMTMzLjcwOVoiIHN0eWxlPSJmaWxsOnJnYigyMSwx%0D%0AODksMjMzKTsiLz4KICAgICAgICAgICAgPHBhdGggZD0iTTI4My40MzksMTYxLjUyNUMyNzcuOTYs%0D%0AMTg0LjQyNiAyODcuOTc1LDIxMS45NzcgMjc1LjM4OSwyMzIuNTc1QzI2NC45MjIsMjQ5LjYyIDI0%0D%0AMC4xNjgsMjQ2Ljc4NSAyMjMuMiwyNDYuNzg1TDEzMC42MSwyNDYuNzg1TDg1LjMzMywxNjkuOTE0%0D%0ATDIyNy4yMDUsODEuNzQzTDI4My40MzksMTYxLjUyNVoiIHN0eWxlPSJmaWxsOnJnYig5LDg1LDE1%0D%0ANCk7Ii8+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNTYuMjMzLDQyLjI1QzIwMi4zMzgsNDIuMjUg%0D%0AMjM5LjcxNSw3OS42MjggMjM5LjcxNSwxMjUuNzM0QzIzOS43MTUsMTcxLjg0MSAyMDIuMzM4LDIw%0D%0AOS4yNTYgMTU2LjIzMywyMDkuMjU2QzExMC4xMjcsMjA5LjI1NiA3Mi43MTIsMTcxLjg0MSA3Mi43%0D%0AMTIsMTI1LjczNEM3Mi43MTIsNzkuNjI4IDExMC4xMjcsNDIuMjUgMTU2LjIzMyw0Mi4yNVoiIHN0%0D%0AeWxlPSJmaWxsOndoaXRlOyIvPgogICAgICAgICAgICA8cGF0aCBkPSJNMjAyLjcxNywxMzQuNDI2%0D%0ATDE3Mi4xODEsMTUyLjA3NkwxNDEuMDAxLDE3MC4wNjZDMTMwLjU3MSwxNzYuMDc1IDEyNi45MDYs%0D%0AMTczLjg0NCAxMjYuOTA2LDE2MS4yMjFMMTI2LjkwNiwxMjUuOTIzTDEyNi45MDYsODkuOTQ0QzEy%0D%0ANi45MDYsNzcuODg5IDEzMC42ODQsNzUuODQ3IDE0MS42MDcsODIuMTU5TDE3Mi4xODEsOTkuODA5%0D%0ATDIwMy4zNTgsMTE3Ljc5OEMyMTMuNzksMTIzLjgwNiAyMTMuNjc1LDEyOC4xMTUgMjAyLjcxNywx%0D%0AMzQuNDI2WiIgc3R5bGU9ImZpbGw6cmdiKDg4LDg5LDkxKTsiLz4KICAgICAgICAgICAgPHBhdGgg%0D%0AZD0iTTIzMy4xNzYsMTY3LjY0NkMyNDMuNDU1LDE3NC43MTQgMjUyLjkwNCwxODUuMDY5IDI2MC42%0D%0AODksMTk0Ljc0NEMyNjguNjYzLDIwNC42NDYgMjc2LjIyMSwyMTUuNTMgMjgyLjU3MSwyMjYuNjAz%0D%0AQzI4NC43NjIsMjMwLjQ1OSAyODcuMDMsMjM0LjYxNSAyODguNjkyLDIzOC43NzNDMjkwLjc3MSwy%0D%0ANDMuOTg5IDI5MS45MDUsMjUwLjQxNCAyODYuMzEyLDI1NC4xMThMMjMzLjc0MywyODlMMjI5LjIw%0D%0AOSwyODYuNDI5QzIxNy45ODUsMjgwLjA4IDIwNi43OTgsMjczLjM1MyAxOTUuOTE0LDI2Ni40NzRD%0D%0AMTg5LjA3NCwyNjIuMTI5IDE4Mi4xNTgsMjU3LjYzMyAxNzUuNjk2LDI1Mi43OTVDMTcxLjM0OCwy%0D%0ANDkuNTQ0IDE2NC42MjIsMjQ0LjQ0MyAxNjIuNjE4LDIzOS4yNjVDMTU5LjQ4MiwyMzEuMjEzIDE2%0D%0AMi43NzEsMjE3LjIzMiAxNjQuOTYxLDIwOS4wNjhDMTY2LjkyOCwyMDEuOTI1IDE3MS4wMDksMTg4%0D%0ALjYyMSAxNzUuNDMsMTgyLjcyNkMxNzcuMjA2LDE4MC4zNDUgMTc5LjU4NywxNzguODcxIDE4Mi4z%0D%0AODUsMTc4LjAwMkwxNTcuNzgyLDE1Ni4xMjFDMTQ5LjMxOCwxNDkuNjk1IDE0Ni4yOTMsMTM4LjQz%0D%0AMyAxNTMuMjQ2LDEyOS40NzZDMTU5Ljc4NSwxMjEuMDg3IDE3MS4wNDYsMTE5LjcyNSAxNzkuNTEx%0D%0ALDEyNS44NDdMMTc5LjY2MywxMjUuOTIzTDIzMy4xNzYsMTY3LjY0NloiIHN0eWxlPSJmaWxsOndo%0D%0AaXRlOyIvPgogICAgICAgICAgICA8cGF0aCBkPSJNMjI4LjE1LDE3NC40ODdMMTc0LjU2MSwxMzIu%0D%0ANzI2QzE3NC41NjEsMTMyLjcyNiAxNjYuMTcyLDEyNi43MTcgMTU5Ljk3MywxMzQuNjkxQzE1My43%0D%0AMzgsMTQyLjcwMyAxNjMuMTQ3LDE0OS41MDUgMTYzLjE0NywxNDkuNTA1TDIwOC43MjUsMTkwLjA5%0D%0ANkMyMDguNzI1LDE5MC4wOTYgMTg2LjkyLDE4MS41OTIgMTgyLjIzMywxODcuODI4QzE3Ny41ODUs%0D%0AMTk0LjA2NCAxNjYuOTY2LDIyNi45MDYgMTcwLjU1NSwyMzYuMjAzQzE3NC4xNDUsMjQ1LjUwMSAy%0D%0AMzMuMzY1LDI3OS4wMjMgMjMzLjM2NSwyNzkuMDIzTDI4MS41ODgsMjQ3LjA0OUMyODUuNDgxLDI0%0D%0ANC40NDMgMjU0LjYwNCwxOTIuNTkgMjI4LjE1LDE3NC40ODdaIiBzdHlsZT0iZmlsbDpyZ2IoODgs%0D%0AODksOTEpOyIvPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+Cg=="
                    />
                  </span>
                  <img
                    className="clipsthumb"
                    src={`https://cdn.sclip.cc/file/smartclips/${this.state.smclips[0]._id}.jpg`}
                  />
                  <h1 className="clipstitle">
                    {this.state.smclips[0].meta.title}
                  </h1>
                </div>
              </a>
              <a
                target="_blank"
                href={`https://smartclips.app/clip/${this.state.smclips[1]._id}`}
              >
                <div className="clipsitem clipsitem__middle">
                  <span className="clipsviews scspan">
                    <img
                      className="scicon"
                      src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjwh%0D%0ARE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cu%0D%0AdzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+Cjxzdmcgd2lkdGg9IjEwMCUi%0D%0AIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDEyOTggMTIwMiIgdmVyc2lvbj0iMS4xIiB4bWxu%0D%0Acz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3Lncz%0D%0ALm9yZy8xOTk5L3hsaW5rIiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxuczpzZXJpZj0iaHR0cDov%0D%0AL3d3dy5zZXJpZi5jb20vIiBzdHlsZT0iZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5v%0D%0AZGQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjI7Ij4KICAgIDxnIHRy%0D%0AYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMCwtMykiPgogICAgICAgIDxnIHRyYW5zZm9ybT0ibWF0%0D%0Acml4KDQuMTY2NjcsMCwwLDQuMTY2NjcsMCwwKSI+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0wLDEz%0D%0AMy43MDlMMCwxMTQuMjgzQzMxLjA2NCwxMDguNjkgMzAuMTU4LDc2LjY3OSAyOS44OTMsNTIuNjgy%0D%0AQzI5LjgxNyw0My4yNyAyOS43OCwzMy41OTYgMzEuOTM0LDI0LjQxMUMzNC43NjksMTIuMzk0IDQy%0D%0ALjg1Niw2LjU3NCA1NC4yNjksMy4xNzNDNjUuMDc4LC0wLjA3OCA3OC4zOCwwLjk0MiA4OS42OCww%0D%0ALjk0MkwyMjUuNDY3LDAuOTQyQzIzNS43MDgsMC45NDIgMjQ3LjMxLDAuMTg3IDI1Ny4xNzQsMy4x%0D%0ANzNDMjY4LjU4OCw2LjU3NCAyNzYuNjc0LDEyLjM5NCAyNzkuNTA5LDI0LjQxMUMyODEuNjYzLDMz%0D%0ALjU5NiAyODEuNjI2LDQzLjI3IDI4MS41NTEsNTIuNjgyQzI4MS4yODUsNzYuNjc5IDI4MC4zNzks%0D%0AMTA4LjY5IDMxMS40NDQsMTE0LjI4M0wzMTEuNDQ0LDEzMy43MDlDMzAzLjI4LDEzNS4yOTUgMjk1%0D%0ALjk0OSwxMzguOTYyIDI5MC42NTgsMTQ1Ljk1NEMyNzEuOCwxNzAuNzQ2IDI5MS4wMzYsMjA3LjAy%0D%0ANyAyNzUuMzg5LDIzMi41NzVDMjY0LjkyMiwyNDkuNjIgMjQwLjE2OCwyNDYuNzg1IDIyMy4yLDI0%0D%0ANi43ODVMOTAuMTM0LDI0Ni43ODVDNzIuNzg3LDI0Ni43ODUgNDYuODI0LDI1MC4wNzMgMzYuMDUz%0D%0ALDIzMi41NzVDMjcuMDIxLDIxNy43OTcgMzAuMTIsMTk3LjcyOSAyOS41OTEsMTgwLjkxM0MyOC45%0D%0AMSwxNTkuNzg2IDI0LjE4NiwxMzguMzU3IDAsMTMzLjcwOVoiIHN0eWxlPSJmaWxsOnJnYigyMSwx%0D%0AODksMjMzKTsiLz4KICAgICAgICAgICAgPHBhdGggZD0iTTI4My40MzksMTYxLjUyNUMyNzcuOTYs%0D%0AMTg0LjQyNiAyODcuOTc1LDIxMS45NzcgMjc1LjM4OSwyMzIuNTc1QzI2NC45MjIsMjQ5LjYyIDI0%0D%0AMC4xNjgsMjQ2Ljc4NSAyMjMuMiwyNDYuNzg1TDEzMC42MSwyNDYuNzg1TDg1LjMzMywxNjkuOTE0%0D%0ATDIyNy4yMDUsODEuNzQzTDI4My40MzksMTYxLjUyNVoiIHN0eWxlPSJmaWxsOnJnYig5LDg1LDE1%0D%0ANCk7Ii8+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNTYuMjMzLDQyLjI1QzIwMi4zMzgsNDIuMjUg%0D%0AMjM5LjcxNSw3OS42MjggMjM5LjcxNSwxMjUuNzM0QzIzOS43MTUsMTcxLjg0MSAyMDIuMzM4LDIw%0D%0AOS4yNTYgMTU2LjIzMywyMDkuMjU2QzExMC4xMjcsMjA5LjI1NiA3Mi43MTIsMTcxLjg0MSA3Mi43%0D%0AMTIsMTI1LjczNEM3Mi43MTIsNzkuNjI4IDExMC4xMjcsNDIuMjUgMTU2LjIzMyw0Mi4yNVoiIHN0%0D%0AeWxlPSJmaWxsOndoaXRlOyIvPgogICAgICAgICAgICA8cGF0aCBkPSJNMjAyLjcxNywxMzQuNDI2%0D%0ATDE3Mi4xODEsMTUyLjA3NkwxNDEuMDAxLDE3MC4wNjZDMTMwLjU3MSwxNzYuMDc1IDEyNi45MDYs%0D%0AMTczLjg0NCAxMjYuOTA2LDE2MS4yMjFMMTI2LjkwNiwxMjUuOTIzTDEyNi45MDYsODkuOTQ0QzEy%0D%0ANi45MDYsNzcuODg5IDEzMC42ODQsNzUuODQ3IDE0MS42MDcsODIuMTU5TDE3Mi4xODEsOTkuODA5%0D%0ATDIwMy4zNTgsMTE3Ljc5OEMyMTMuNzksMTIzLjgwNiAyMTMuNjc1LDEyOC4xMTUgMjAyLjcxNywx%0D%0AMzQuNDI2WiIgc3R5bGU9ImZpbGw6cmdiKDg4LDg5LDkxKTsiLz4KICAgICAgICAgICAgPHBhdGgg%0D%0AZD0iTTIzMy4xNzYsMTY3LjY0NkMyNDMuNDU1LDE3NC43MTQgMjUyLjkwNCwxODUuMDY5IDI2MC42%0D%0AODksMTk0Ljc0NEMyNjguNjYzLDIwNC42NDYgMjc2LjIyMSwyMTUuNTMgMjgyLjU3MSwyMjYuNjAz%0D%0AQzI4NC43NjIsMjMwLjQ1OSAyODcuMDMsMjM0LjYxNSAyODguNjkyLDIzOC43NzNDMjkwLjc3MSwy%0D%0ANDMuOTg5IDI5MS45MDUsMjUwLjQxNCAyODYuMzEyLDI1NC4xMThMMjMzLjc0MywyODlMMjI5LjIw%0D%0AOSwyODYuNDI5QzIxNy45ODUsMjgwLjA4IDIwNi43OTgsMjczLjM1MyAxOTUuOTE0LDI2Ni40NzRD%0D%0AMTg5LjA3NCwyNjIuMTI5IDE4Mi4xNTgsMjU3LjYzMyAxNzUuNjk2LDI1Mi43OTVDMTcxLjM0OCwy%0D%0ANDkuNTQ0IDE2NC42MjIsMjQ0LjQ0MyAxNjIuNjE4LDIzOS4yNjVDMTU5LjQ4MiwyMzEuMjEzIDE2%0D%0AMi43NzEsMjE3LjIzMiAxNjQuOTYxLDIwOS4wNjhDMTY2LjkyOCwyMDEuOTI1IDE3MS4wMDksMTg4%0D%0ALjYyMSAxNzUuNDMsMTgyLjcyNkMxNzcuMjA2LDE4MC4zNDUgMTc5LjU4NywxNzguODcxIDE4Mi4z%0D%0AODUsMTc4LjAwMkwxNTcuNzgyLDE1Ni4xMjFDMTQ5LjMxOCwxNDkuNjk1IDE0Ni4yOTMsMTM4LjQz%0D%0AMyAxNTMuMjQ2LDEyOS40NzZDMTU5Ljc4NSwxMjEuMDg3IDE3MS4wNDYsMTE5LjcyNSAxNzkuNTEx%0D%0ALDEyNS44NDdMMTc5LjY2MywxMjUuOTIzTDIzMy4xNzYsMTY3LjY0NloiIHN0eWxlPSJmaWxsOndo%0D%0AaXRlOyIvPgogICAgICAgICAgICA8cGF0aCBkPSJNMjI4LjE1LDE3NC40ODdMMTc0LjU2MSwxMzIu%0D%0ANzI2QzE3NC41NjEsMTMyLjcyNiAxNjYuMTcyLDEyNi43MTcgMTU5Ljk3MywxMzQuNjkxQzE1My43%0D%0AMzgsMTQyLjcwMyAxNjMuMTQ3LDE0OS41MDUgMTYzLjE0NywxNDkuNTA1TDIwOC43MjUsMTkwLjA5%0D%0ANkMyMDguNzI1LDE5MC4wOTYgMTg2LjkyLDE4MS41OTIgMTgyLjIzMywxODcuODI4QzE3Ny41ODUs%0D%0AMTk0LjA2NCAxNjYuOTY2LDIyNi45MDYgMTcwLjU1NSwyMzYuMjAzQzE3NC4xNDUsMjQ1LjUwMSAy%0D%0AMzMuMzY1LDI3OS4wMjMgMjMzLjM2NSwyNzkuMDIzTDI4MS41ODgsMjQ3LjA0OUMyODUuNDgxLDI0%0D%0ANC40NDMgMjU0LjYwNCwxOTIuNTkgMjI4LjE1LDE3NC40ODdaIiBzdHlsZT0iZmlsbDpyZ2IoODgs%0D%0AODksOTEpOyIvPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+Cg=="
                    />
                  </span>
                  <img
                    className="clipsthumb"
                    src={`https://cdn.sclip.cc/file/smartclips/${this.state.smclips[1]._id}.jpg`}
                  />
                  <h1 className="clipstitle">
                    {this.state.smclips[1].meta.title}
                  </h1>
                </div>
              </a>
            </div>
          </div>
        );
      } else if (this.state.smclips.length === 1) {
        smclips = (
          <div className="container">
            <div className="clips row">
              <a
                target="_blank"
                href={`https://smartclips.app/clip/${this.state.smclips[0]._id}`}
              >
                <div className="clipsitem">
                  <span className="clipsviews scspan">
                    <img
                      className="scicon"
                      src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjwh%0D%0ARE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cu%0D%0AdzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+Cjxzdmcgd2lkdGg9IjEwMCUi%0D%0AIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDEyOTggMTIwMiIgdmVyc2lvbj0iMS4xIiB4bWxu%0D%0Acz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3Lncz%0D%0ALm9yZy8xOTk5L3hsaW5rIiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxuczpzZXJpZj0iaHR0cDov%0D%0AL3d3dy5zZXJpZi5jb20vIiBzdHlsZT0iZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5v%0D%0AZGQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjI7Ij4KICAgIDxnIHRy%0D%0AYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMCwtMykiPgogICAgICAgIDxnIHRyYW5zZm9ybT0ibWF0%0D%0Acml4KDQuMTY2NjcsMCwwLDQuMTY2NjcsMCwwKSI+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0wLDEz%0D%0AMy43MDlMMCwxMTQuMjgzQzMxLjA2NCwxMDguNjkgMzAuMTU4LDc2LjY3OSAyOS44OTMsNTIuNjgy%0D%0AQzI5LjgxNyw0My4yNyAyOS43OCwzMy41OTYgMzEuOTM0LDI0LjQxMUMzNC43NjksMTIuMzk0IDQy%0D%0ALjg1Niw2LjU3NCA1NC4yNjksMy4xNzNDNjUuMDc4LC0wLjA3OCA3OC4zOCwwLjk0MiA4OS42OCww%0D%0ALjk0MkwyMjUuNDY3LDAuOTQyQzIzNS43MDgsMC45NDIgMjQ3LjMxLDAuMTg3IDI1Ny4xNzQsMy4x%0D%0ANzNDMjY4LjU4OCw2LjU3NCAyNzYuNjc0LDEyLjM5NCAyNzkuNTA5LDI0LjQxMUMyODEuNjYzLDMz%0D%0ALjU5NiAyODEuNjI2LDQzLjI3IDI4MS41NTEsNTIuNjgyQzI4MS4yODUsNzYuNjc5IDI4MC4zNzks%0D%0AMTA4LjY5IDMxMS40NDQsMTE0LjI4M0wzMTEuNDQ0LDEzMy43MDlDMzAzLjI4LDEzNS4yOTUgMjk1%0D%0ALjk0OSwxMzguOTYyIDI5MC42NTgsMTQ1Ljk1NEMyNzEuOCwxNzAuNzQ2IDI5MS4wMzYsMjA3LjAy%0D%0ANyAyNzUuMzg5LDIzMi41NzVDMjY0LjkyMiwyNDkuNjIgMjQwLjE2OCwyNDYuNzg1IDIyMy4yLDI0%0D%0ANi43ODVMOTAuMTM0LDI0Ni43ODVDNzIuNzg3LDI0Ni43ODUgNDYuODI0LDI1MC4wNzMgMzYuMDUz%0D%0ALDIzMi41NzVDMjcuMDIxLDIxNy43OTcgMzAuMTIsMTk3LjcyOSAyOS41OTEsMTgwLjkxM0MyOC45%0D%0AMSwxNTkuNzg2IDI0LjE4NiwxMzguMzU3IDAsMTMzLjcwOVoiIHN0eWxlPSJmaWxsOnJnYigyMSwx%0D%0AODksMjMzKTsiLz4KICAgICAgICAgICAgPHBhdGggZD0iTTI4My40MzksMTYxLjUyNUMyNzcuOTYs%0D%0AMTg0LjQyNiAyODcuOTc1LDIxMS45NzcgMjc1LjM4OSwyMzIuNTc1QzI2NC45MjIsMjQ5LjYyIDI0%0D%0AMC4xNjgsMjQ2Ljc4NSAyMjMuMiwyNDYuNzg1TDEzMC42MSwyNDYuNzg1TDg1LjMzMywxNjkuOTE0%0D%0ATDIyNy4yMDUsODEuNzQzTDI4My40MzksMTYxLjUyNVoiIHN0eWxlPSJmaWxsOnJnYig5LDg1LDE1%0D%0ANCk7Ii8+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNTYuMjMzLDQyLjI1QzIwMi4zMzgsNDIuMjUg%0D%0AMjM5LjcxNSw3OS42MjggMjM5LjcxNSwxMjUuNzM0QzIzOS43MTUsMTcxLjg0MSAyMDIuMzM4LDIw%0D%0AOS4yNTYgMTU2LjIzMywyMDkuMjU2QzExMC4xMjcsMjA5LjI1NiA3Mi43MTIsMTcxLjg0MSA3Mi43%0D%0AMTIsMTI1LjczNEM3Mi43MTIsNzkuNjI4IDExMC4xMjcsNDIuMjUgMTU2LjIzMyw0Mi4yNVoiIHN0%0D%0AeWxlPSJmaWxsOndoaXRlOyIvPgogICAgICAgICAgICA8cGF0aCBkPSJNMjAyLjcxNywxMzQuNDI2%0D%0ATDE3Mi4xODEsMTUyLjA3NkwxNDEuMDAxLDE3MC4wNjZDMTMwLjU3MSwxNzYuMDc1IDEyNi45MDYs%0D%0AMTczLjg0NCAxMjYuOTA2LDE2MS4yMjFMMTI2LjkwNiwxMjUuOTIzTDEyNi45MDYsODkuOTQ0QzEy%0D%0ANi45MDYsNzcuODg5IDEzMC42ODQsNzUuODQ3IDE0MS42MDcsODIuMTU5TDE3Mi4xODEsOTkuODA5%0D%0ATDIwMy4zNTgsMTE3Ljc5OEMyMTMuNzksMTIzLjgwNiAyMTMuNjc1LDEyOC4xMTUgMjAyLjcxNywx%0D%0AMzQuNDI2WiIgc3R5bGU9ImZpbGw6cmdiKDg4LDg5LDkxKTsiLz4KICAgICAgICAgICAgPHBhdGgg%0D%0AZD0iTTIzMy4xNzYsMTY3LjY0NkMyNDMuNDU1LDE3NC43MTQgMjUyLjkwNCwxODUuMDY5IDI2MC42%0D%0AODksMTk0Ljc0NEMyNjguNjYzLDIwNC42NDYgMjc2LjIyMSwyMTUuNTMgMjgyLjU3MSwyMjYuNjAz%0D%0AQzI4NC43NjIsMjMwLjQ1OSAyODcuMDMsMjM0LjYxNSAyODguNjkyLDIzOC43NzNDMjkwLjc3MSwy%0D%0ANDMuOTg5IDI5MS45MDUsMjUwLjQxNCAyODYuMzEyLDI1NC4xMThMMjMzLjc0MywyODlMMjI5LjIw%0D%0AOSwyODYuNDI5QzIxNy45ODUsMjgwLjA4IDIwNi43OTgsMjczLjM1MyAxOTUuOTE0LDI2Ni40NzRD%0D%0AMTg5LjA3NCwyNjIuMTI5IDE4Mi4xNTgsMjU3LjYzMyAxNzUuNjk2LDI1Mi43OTVDMTcxLjM0OCwy%0D%0ANDkuNTQ0IDE2NC42MjIsMjQ0LjQ0MyAxNjIuNjE4LDIzOS4yNjVDMTU5LjQ4MiwyMzEuMjEzIDE2%0D%0AMi43NzEsMjE3LjIzMiAxNjQuOTYxLDIwOS4wNjhDMTY2LjkyOCwyMDEuOTI1IDE3MS4wMDksMTg4%0D%0ALjYyMSAxNzUuNDMsMTgyLjcyNkMxNzcuMjA2LDE4MC4zNDUgMTc5LjU4NywxNzguODcxIDE4Mi4z%0D%0AODUsMTc4LjAwMkwxNTcuNzgyLDE1Ni4xMjFDMTQ5LjMxOCwxNDkuNjk1IDE0Ni4yOTMsMTM4LjQz%0D%0AMyAxNTMuMjQ2LDEyOS40NzZDMTU5Ljc4NSwxMjEuMDg3IDE3MS4wNDYsMTE5LjcyNSAxNzkuNTEx%0D%0ALDEyNS44NDdMMTc5LjY2MywxMjUuOTIzTDIzMy4xNzYsMTY3LjY0NloiIHN0eWxlPSJmaWxsOndo%0D%0AaXRlOyIvPgogICAgICAgICAgICA8cGF0aCBkPSJNMjI4LjE1LDE3NC40ODdMMTc0LjU2MSwxMzIu%0D%0ANzI2QzE3NC41NjEsMTMyLjcyNiAxNjYuMTcyLDEyNi43MTcgMTU5Ljk3MywxMzQuNjkxQzE1My43%0D%0AMzgsMTQyLjcwMyAxNjMuMTQ3LDE0OS41MDUgMTYzLjE0NywxNDkuNTA1TDIwOC43MjUsMTkwLjA5%0D%0ANkMyMDguNzI1LDE5MC4wOTYgMTg2LjkyLDE4MS41OTIgMTgyLjIzMywxODcuODI4QzE3Ny41ODUs%0D%0AMTk0LjA2NCAxNjYuOTY2LDIyNi45MDYgMTcwLjU1NSwyMzYuMjAzQzE3NC4xNDUsMjQ1LjUwMSAy%0D%0AMzMuMzY1LDI3OS4wMjMgMjMzLjM2NSwyNzkuMDIzTDI4MS41ODgsMjQ3LjA0OUMyODUuNDgxLDI0%0D%0ANC40NDMgMjU0LjYwNCwxOTIuNTkgMjI4LjE1LDE3NC40ODdaIiBzdHlsZT0iZmlsbDpyZ2IoODgs%0D%0AODksOTEpOyIvPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+Cg=="
                    />
                  </span>
                  <img
                    className="clipsthumb"
                    src={`https://cdn.sclip.cc/file/smartclips/${this.state.smclips[0]._id}.jpg`}
                  />
                  <h1 className="clipstitle">
                    {this.state.smclips[0].meta.title}
                  </h1>
                </div>
              </a>
            </div>
          </div>
        );
      } else {
        smclips = <div style={{ marginTop: "40px" }}></div>;
      }
    }

    var clips;
    if (this.state.mixer.partnered === true) {
      if (this.state.clips.length > 2) {
        clips = (
          <div className="container">
            <div className="clips row">
              <a
                target="_blank"
                href={`https://mixer.com/${this.state.mixer.token}?clip=${this.state.clips[0].shareableId}`}
              >
                <div className="clipsitem">
                  <span className="clipsviews">
                    <img
                      className="eyeicon"
                      src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjMiIGhlaWdodD0iMTUiIHZpZXdCb3g9IjAgMCAyMyAxNSIgZmlsbD0ibm9u%0D%0AZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIyLjIyNjYg%0D%0ANi41NjI1QzIyLjM4MjggNi44NzUgMjIuNSA3LjE4NzUgMjIuNSA3LjVDMjIuNSA3Ljg1MTU2IDIy%0D%0ALjM4MjggOC4xNjQwNiAyMi4yMjY2IDguNDM3NUMyMS4wOTM4IDEwLjM1MTYgMTkuNTcwMyAxMS44%0D%0ANzUgMTcuNjU2MiAxMi45Njg4QzE1LjcwMzEgMTQuMTQwNiAxMy41NTQ3IDE0LjY4NzUgMTEuMjUg%0D%0AMTQuNjg3NUM4LjkwNjI1IDE0LjY4NzUgNi43OTY4OCAxNC4xNDA2IDQuODQzNzUgMTIuOTY4OEMy%0D%0ALjg5MDYyIDExLjg3NSAxLjM2NzE5IDEwLjM1MTYgMC4yNzM0MzggOC40Mzc1QzAuMDc4MTI1IDgu%0D%0AMTY0MDYgMCA3Ljg1MTU2IDAgNy41QzAgNy4xODc1IDAuMDc4MTI1IDYuODc1IDAuMjczNDM4IDYu%0D%0ANTYyNUMxLjM2NzE5IDQuNjg3NSAyLjg5MDYyIDMuMTY0MDYgNC44NDM3NSAyLjAzMTI1QzYuNzk2%0D%0AODggMC44OTg0MzggOC45MDYyNSAwLjMxMjUgMTEuMjUgMC4zMTI1QzEzLjU1NDcgMC4zMTI1IDE1%0D%0ALjcwMzEgMC44OTg0MzggMTcuNjU2MiAyLjAzMTI1QzE5LjU3MDMgMy4xNjQwNiAyMS4wOTM4IDQu%0D%0ANjg3NSAyMi4yMjY2IDYuNTYyNVpNMTEuMjUgMTIuODEyNUMxMi4xODc1IDEyLjgxMjUgMTMuMDg1%0D%0AOSAxMi41NzgxIDEzLjkwNjIgMTIuMTA5NEMxNC42ODc1IDExLjY0MDYgMTUuMzUxNiAxMC45NzY2%0D%0AIDE1LjgyMDMgMTAuMTU2MkMxNi4yODkxIDkuMzc1IDE2LjU2MjUgOC40NzY1NiAxNi41NjI1IDcu%0D%0ANUMxNi41NjI1IDYuNTYyNSAxNi4yODkxIDUuNjY0MDYgMTUuODIwMyA0Ljg0Mzc1QzE1LjM1MTYg%0D%0ANC4wNjI1IDE0LjY4NzUgMy4zOTg0NCAxMy45MDYyIDIuOTI5NjlDMTMuMDg1OSAyLjQ2MDk0IDEy%0D%0ALjE4NzUgMi4xODc1IDExLjI1IDIuMTg3NUMxMC4yNzM0IDIuMTg3NSA5LjM3NSAyLjQ2MDk0IDgu%0D%0ANTkzNzUgMi45Mjk2OUM3Ljc3MzQ0IDMuMzk4NDQgNy4xMDkzOCA0LjA2MjUgNi42NDA2MiA0Ljg0%0D%0AMzc1QzYuMTcxODggNS42NjQwNiA1LjkzNzUgNi41NjI1IDUuOTM3NSA3LjVDNS45Mzc1IDguNDc2%0D%0ANTYgNi4xNzE4OCA5LjM3NSA2LjY0MDYyIDEwLjE1NjJDNy4xMDkzOCAxMC45NzY2IDcuNzczNDQg%0D%0AMTEuNjQwNiA4LjU5Mzc1IDEyLjEwOTRDOS4zNzUgMTIuNTc4MSAxMC4yNzM0IDEyLjgxMjUgMTEu%0D%0AMjUgMTIuODEyNVpNMTUuMzEyNSA3LjVDMTUuMzEyNSA2LjQwNjI1IDE0Ljg4MjggNS40Mjk2OSAx%0D%0ANC4xMDE2IDQuNjQ4NDRDMTMuMzIwMyAzLjg2NzE5IDEyLjM0MzggMy40Mzc1IDExLjI1IDMuNDM3%0D%0ANUMxMC41NDY5IDMuNDM3NSA5LjkyMTg4IDMuNTkzNzUgOS4zMzU5NCAzLjkwNjI1QzkuODA0Njkg%0D%0AMy45MDYyNSAxMC4xOTUzIDQuMTAxNTYgMTAuNTA3OCA0LjQxNDA2QzEwLjgyMDMgNC43MjY1NiAx%0D%0AMS4wMTU2IDUuMTE3MTkgMTEuMDE1NiA1LjU4NTk0QzExLjAxNTYgNi4wNTQ2OSAxMC44MjAzIDYu%0D%0ANDg0MzggMTAuNTA3OCA2Ljc5Njg4QzEwLjE5NTMgNy4xMDkzOCA5LjgwNDY5IDcuMjY1NjIgOS4z%0D%0AMzU5NCA3LjI2NTYyQzguODY3MTkgNy4yNjU2MiA4LjQzNzUgNy4xMDkzOCA4LjEyNSA2Ljc5Njg4%0D%0AQzcuODEyNSA2LjQ4NDM4IDcuNjU2MjUgNi4wNTQ2OSA3LjY1NjI1IDUuNTg1OTRDNy4zNDM3NSA2%0D%0ALjIxMDk0IDcuMTg3NSA2LjgzNTk0IDcuMTg3NSA3LjVDNy4xODc1IDguNjMyODEgNy41NzgxMiA5%0D%0ALjYwOTM4IDguMzU5MzggMTAuMzkwNkM5LjE0MDYyIDExLjE3MTkgMTAuMTE3MiAxMS41NjI1IDEx%0D%0ALjI1IDExLjU2MjVDMTIuMzQzOCAxMS41NjI1IDEzLjMyMDMgMTEuMTcxOSAxNC4xMDE2IDEwLjM5%0D%0AMDZDMTQuODgyOCA5LjYwOTM4IDE1LjMxMjUgOC42MzI4MSAxNS4zMTI1IDcuNVoiIGZpbGw9Indo%0D%0AaXRlIi8+Cjwvc3ZnPgo="
                    />{" "}
                    {this.state.clips[0].viewCount}
                  </span>
                  <img
                    className="clipsthumb"
                    src={this.state.clips[0].contentLocators[1].uri}
                  />
                  <h1 className="clipstitle">{this.state.clips[0].title}</h1>
                </div>
              </a>
              <a
                target="_blank"
                href={`https://mixer.com/${this.state.mixer.token}?clip=${this.state.clips[1].shareableId}`}
              >
                <div className="clipsitem clipsitem__middle">
                  <span className="clipsviews">
                    <img
                      className="eyeicon"
                      src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjMiIGhlaWdodD0iMTUiIHZpZXdCb3g9IjAgMCAyMyAxNSIgZmlsbD0ibm9u%0D%0AZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIyLjIyNjYg%0D%0ANi41NjI1QzIyLjM4MjggNi44NzUgMjIuNSA3LjE4NzUgMjIuNSA3LjVDMjIuNSA3Ljg1MTU2IDIy%0D%0ALjM4MjggOC4xNjQwNiAyMi4yMjY2IDguNDM3NUMyMS4wOTM4IDEwLjM1MTYgMTkuNTcwMyAxMS44%0D%0ANzUgMTcuNjU2MiAxMi45Njg4QzE1LjcwMzEgMTQuMTQwNiAxMy41NTQ3IDE0LjY4NzUgMTEuMjUg%0D%0AMTQuNjg3NUM4LjkwNjI1IDE0LjY4NzUgNi43OTY4OCAxNC4xNDA2IDQuODQzNzUgMTIuOTY4OEMy%0D%0ALjg5MDYyIDExLjg3NSAxLjM2NzE5IDEwLjM1MTYgMC4yNzM0MzggOC40Mzc1QzAuMDc4MTI1IDgu%0D%0AMTY0MDYgMCA3Ljg1MTU2IDAgNy41QzAgNy4xODc1IDAuMDc4MTI1IDYuODc1IDAuMjczNDM4IDYu%0D%0ANTYyNUMxLjM2NzE5IDQuNjg3NSAyLjg5MDYyIDMuMTY0MDYgNC44NDM3NSAyLjAzMTI1QzYuNzk2%0D%0AODggMC44OTg0MzggOC45MDYyNSAwLjMxMjUgMTEuMjUgMC4zMTI1QzEzLjU1NDcgMC4zMTI1IDE1%0D%0ALjcwMzEgMC44OTg0MzggMTcuNjU2MiAyLjAzMTI1QzE5LjU3MDMgMy4xNjQwNiAyMS4wOTM4IDQu%0D%0ANjg3NSAyMi4yMjY2IDYuNTYyNVpNMTEuMjUgMTIuODEyNUMxMi4xODc1IDEyLjgxMjUgMTMuMDg1%0D%0AOSAxMi41NzgxIDEzLjkwNjIgMTIuMTA5NEMxNC42ODc1IDExLjY0MDYgMTUuMzUxNiAxMC45NzY2%0D%0AIDE1LjgyMDMgMTAuMTU2MkMxNi4yODkxIDkuMzc1IDE2LjU2MjUgOC40NzY1NiAxNi41NjI1IDcu%0D%0ANUMxNi41NjI1IDYuNTYyNSAxNi4yODkxIDUuNjY0MDYgMTUuODIwMyA0Ljg0Mzc1QzE1LjM1MTYg%0D%0ANC4wNjI1IDE0LjY4NzUgMy4zOTg0NCAxMy45MDYyIDIuOTI5NjlDMTMuMDg1OSAyLjQ2MDk0IDEy%0D%0ALjE4NzUgMi4xODc1IDExLjI1IDIuMTg3NUMxMC4yNzM0IDIuMTg3NSA5LjM3NSAyLjQ2MDk0IDgu%0D%0ANTkzNzUgMi45Mjk2OUM3Ljc3MzQ0IDMuMzk4NDQgNy4xMDkzOCA0LjA2MjUgNi42NDA2MiA0Ljg0%0D%0AMzc1QzYuMTcxODggNS42NjQwNiA1LjkzNzUgNi41NjI1IDUuOTM3NSA3LjVDNS45Mzc1IDguNDc2%0D%0ANTYgNi4xNzE4OCA5LjM3NSA2LjY0MDYyIDEwLjE1NjJDNy4xMDkzOCAxMC45NzY2IDcuNzczNDQg%0D%0AMTEuNjQwNiA4LjU5Mzc1IDEyLjEwOTRDOS4zNzUgMTIuNTc4MSAxMC4yNzM0IDEyLjgxMjUgMTEu%0D%0AMjUgMTIuODEyNVpNMTUuMzEyNSA3LjVDMTUuMzEyNSA2LjQwNjI1IDE0Ljg4MjggNS40Mjk2OSAx%0D%0ANC4xMDE2IDQuNjQ4NDRDMTMuMzIwMyAzLjg2NzE5IDEyLjM0MzggMy40Mzc1IDExLjI1IDMuNDM3%0D%0ANUMxMC41NDY5IDMuNDM3NSA5LjkyMTg4IDMuNTkzNzUgOS4zMzU5NCAzLjkwNjI1QzkuODA0Njkg%0D%0AMy45MDYyNSAxMC4xOTUzIDQuMTAxNTYgMTAuNTA3OCA0LjQxNDA2QzEwLjgyMDMgNC43MjY1NiAx%0D%0AMS4wMTU2IDUuMTE3MTkgMTEuMDE1NiA1LjU4NTk0QzExLjAxNTYgNi4wNTQ2OSAxMC44MjAzIDYu%0D%0ANDg0MzggMTAuNTA3OCA2Ljc5Njg4QzEwLjE5NTMgNy4xMDkzOCA5LjgwNDY5IDcuMjY1NjIgOS4z%0D%0AMzU5NCA3LjI2NTYyQzguODY3MTkgNy4yNjU2MiA4LjQzNzUgNy4xMDkzOCA4LjEyNSA2Ljc5Njg4%0D%0AQzcuODEyNSA2LjQ4NDM4IDcuNjU2MjUgNi4wNTQ2OSA3LjY1NjI1IDUuNTg1OTRDNy4zNDM3NSA2%0D%0ALjIxMDk0IDcuMTg3NSA2LjgzNTk0IDcuMTg3NSA3LjVDNy4xODc1IDguNjMyODEgNy41NzgxMiA5%0D%0ALjYwOTM4IDguMzU5MzggMTAuMzkwNkM5LjE0MDYyIDExLjE3MTkgMTAuMTE3MiAxMS41NjI1IDEx%0D%0ALjI1IDExLjU2MjVDMTIuMzQzOCAxMS41NjI1IDEzLjMyMDMgMTEuMTcxOSAxNC4xMDE2IDEwLjM5%0D%0AMDZDMTQuODgyOCA5LjYwOTM4IDE1LjMxMjUgOC42MzI4MSAxNS4zMTI1IDcuNVoiIGZpbGw9Indo%0D%0AaXRlIi8+Cjwvc3ZnPgo="
                    />{" "}
                    {this.state.clips[1].viewCount}
                  </span>
                  <img
                    className="clipsthumb"
                    src={this.state.clips[1].contentLocators[1].uri}
                  />
                  <h1 className="clipstitle">{this.state.clips[1].title}</h1>
                </div>
              </a>
              <a
                target="_blank"
                href={`https://mixer.com/${this.state.mixer.token}?clip=${this.state.clips[2].shareableId}`}
              >
                <div className="clipsitem">
                  <span className="clipsviews">
                    <img
                      className="eyeicon"
                      src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjMiIGhlaWdodD0iMTUiIHZpZXdCb3g9IjAgMCAyMyAxNSIgZmlsbD0ibm9u%0D%0AZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIyLjIyNjYg%0D%0ANi41NjI1QzIyLjM4MjggNi44NzUgMjIuNSA3LjE4NzUgMjIuNSA3LjVDMjIuNSA3Ljg1MTU2IDIy%0D%0ALjM4MjggOC4xNjQwNiAyMi4yMjY2IDguNDM3NUMyMS4wOTM4IDEwLjM1MTYgMTkuNTcwMyAxMS44%0D%0ANzUgMTcuNjU2MiAxMi45Njg4QzE1LjcwMzEgMTQuMTQwNiAxMy41NTQ3IDE0LjY4NzUgMTEuMjUg%0D%0AMTQuNjg3NUM4LjkwNjI1IDE0LjY4NzUgNi43OTY4OCAxNC4xNDA2IDQuODQzNzUgMTIuOTY4OEMy%0D%0ALjg5MDYyIDExLjg3NSAxLjM2NzE5IDEwLjM1MTYgMC4yNzM0MzggOC40Mzc1QzAuMDc4MTI1IDgu%0D%0AMTY0MDYgMCA3Ljg1MTU2IDAgNy41QzAgNy4xODc1IDAuMDc4MTI1IDYuODc1IDAuMjczNDM4IDYu%0D%0ANTYyNUMxLjM2NzE5IDQuNjg3NSAyLjg5MDYyIDMuMTY0MDYgNC44NDM3NSAyLjAzMTI1QzYuNzk2%0D%0AODggMC44OTg0MzggOC45MDYyNSAwLjMxMjUgMTEuMjUgMC4zMTI1QzEzLjU1NDcgMC4zMTI1IDE1%0D%0ALjcwMzEgMC44OTg0MzggMTcuNjU2MiAyLjAzMTI1QzE5LjU3MDMgMy4xNjQwNiAyMS4wOTM4IDQu%0D%0ANjg3NSAyMi4yMjY2IDYuNTYyNVpNMTEuMjUgMTIuODEyNUMxMi4xODc1IDEyLjgxMjUgMTMuMDg1%0D%0AOSAxMi41NzgxIDEzLjkwNjIgMTIuMTA5NEMxNC42ODc1IDExLjY0MDYgMTUuMzUxNiAxMC45NzY2%0D%0AIDE1LjgyMDMgMTAuMTU2MkMxNi4yODkxIDkuMzc1IDE2LjU2MjUgOC40NzY1NiAxNi41NjI1IDcu%0D%0ANUMxNi41NjI1IDYuNTYyNSAxNi4yODkxIDUuNjY0MDYgMTUuODIwMyA0Ljg0Mzc1QzE1LjM1MTYg%0D%0ANC4wNjI1IDE0LjY4NzUgMy4zOTg0NCAxMy45MDYyIDIuOTI5NjlDMTMuMDg1OSAyLjQ2MDk0IDEy%0D%0ALjE4NzUgMi4xODc1IDExLjI1IDIuMTg3NUMxMC4yNzM0IDIuMTg3NSA5LjM3NSAyLjQ2MDk0IDgu%0D%0ANTkzNzUgMi45Mjk2OUM3Ljc3MzQ0IDMuMzk4NDQgNy4xMDkzOCA0LjA2MjUgNi42NDA2MiA0Ljg0%0D%0AMzc1QzYuMTcxODggNS42NjQwNiA1LjkzNzUgNi41NjI1IDUuOTM3NSA3LjVDNS45Mzc1IDguNDc2%0D%0ANTYgNi4xNzE4OCA5LjM3NSA2LjY0MDYyIDEwLjE1NjJDNy4xMDkzOCAxMC45NzY2IDcuNzczNDQg%0D%0AMTEuNjQwNiA4LjU5Mzc1IDEyLjEwOTRDOS4zNzUgMTIuNTc4MSAxMC4yNzM0IDEyLjgxMjUgMTEu%0D%0AMjUgMTIuODEyNVpNMTUuMzEyNSA3LjVDMTUuMzEyNSA2LjQwNjI1IDE0Ljg4MjggNS40Mjk2OSAx%0D%0ANC4xMDE2IDQuNjQ4NDRDMTMuMzIwMyAzLjg2NzE5IDEyLjM0MzggMy40Mzc1IDExLjI1IDMuNDM3%0D%0ANUMxMC41NDY5IDMuNDM3NSA5LjkyMTg4IDMuNTkzNzUgOS4zMzU5NCAzLjkwNjI1QzkuODA0Njkg%0D%0AMy45MDYyNSAxMC4xOTUzIDQuMTAxNTYgMTAuNTA3OCA0LjQxNDA2QzEwLjgyMDMgNC43MjY1NiAx%0D%0AMS4wMTU2IDUuMTE3MTkgMTEuMDE1NiA1LjU4NTk0QzExLjAxNTYgNi4wNTQ2OSAxMC44MjAzIDYu%0D%0ANDg0MzggMTAuNTA3OCA2Ljc5Njg4QzEwLjE5NTMgNy4xMDkzOCA5LjgwNDY5IDcuMjY1NjIgOS4z%0D%0AMzU5NCA3LjI2NTYyQzguODY3MTkgNy4yNjU2MiA4LjQzNzUgNy4xMDkzOCA4LjEyNSA2Ljc5Njg4%0D%0AQzcuODEyNSA2LjQ4NDM4IDcuNjU2MjUgNi4wNTQ2OSA3LjY1NjI1IDUuNTg1OTRDNy4zNDM3NSA2%0D%0ALjIxMDk0IDcuMTg3NSA2LjgzNTk0IDcuMTg3NSA3LjVDNy4xODc1IDguNjMyODEgNy41NzgxMiA5%0D%0ALjYwOTM4IDguMzU5MzggMTAuMzkwNkM5LjE0MDYyIDExLjE3MTkgMTAuMTE3MiAxMS41NjI1IDEx%0D%0ALjI1IDExLjU2MjVDMTIuMzQzOCAxMS41NjI1IDEzLjMyMDMgMTEuMTcxOSAxNC4xMDE2IDEwLjM5%0D%0AMDZDMTQuODgyOCA5LjYwOTM4IDE1LjMxMjUgOC42MzI4MSAxNS4zMTI1IDcuNVoiIGZpbGw9Indo%0D%0AaXRlIi8+Cjwvc3ZnPgo="
                    />{" "}
                    {this.state.clips[2].viewCount}
                  </span>
                  <img
                    className="clipsthumb"
                    src={this.state.clips[2].contentLocators[1].uri}
                  />
                  <h1 className="clipstitle">{this.state.clips[2].title}</h1>
                </div>
              </a>
            </div>
          </div>
        );
      } else if (this.state.clips.length === 2) {
        clips = (
          <div className="container">
            <div className="clips row">
              <a
                target="_blank"
                href={`https://mixer.com/${this.state.mixer.token}?clip=${this.state.clips[0].shareableId}`}
              >
                <div className="clipsitem">
                  <span className="clipsviews">
                    <img
                      className="eyeicon"
                      src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjMiIGhlaWdodD0iMTUiIHZpZXdCb3g9IjAgMCAyMyAxNSIgZmlsbD0ibm9u%0D%0AZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIyLjIyNjYg%0D%0ANi41NjI1QzIyLjM4MjggNi44NzUgMjIuNSA3LjE4NzUgMjIuNSA3LjVDMjIuNSA3Ljg1MTU2IDIy%0D%0ALjM4MjggOC4xNjQwNiAyMi4yMjY2IDguNDM3NUMyMS4wOTM4IDEwLjM1MTYgMTkuNTcwMyAxMS44%0D%0ANzUgMTcuNjU2MiAxMi45Njg4QzE1LjcwMzEgMTQuMTQwNiAxMy41NTQ3IDE0LjY4NzUgMTEuMjUg%0D%0AMTQuNjg3NUM4LjkwNjI1IDE0LjY4NzUgNi43OTY4OCAxNC4xNDA2IDQuODQzNzUgMTIuOTY4OEMy%0D%0ALjg5MDYyIDExLjg3NSAxLjM2NzE5IDEwLjM1MTYgMC4yNzM0MzggOC40Mzc1QzAuMDc4MTI1IDgu%0D%0AMTY0MDYgMCA3Ljg1MTU2IDAgNy41QzAgNy4xODc1IDAuMDc4MTI1IDYuODc1IDAuMjczNDM4IDYu%0D%0ANTYyNUMxLjM2NzE5IDQuNjg3NSAyLjg5MDYyIDMuMTY0MDYgNC44NDM3NSAyLjAzMTI1QzYuNzk2%0D%0AODggMC44OTg0MzggOC45MDYyNSAwLjMxMjUgMTEuMjUgMC4zMTI1QzEzLjU1NDcgMC4zMTI1IDE1%0D%0ALjcwMzEgMC44OTg0MzggMTcuNjU2MiAyLjAzMTI1QzE5LjU3MDMgMy4xNjQwNiAyMS4wOTM4IDQu%0D%0ANjg3NSAyMi4yMjY2IDYuNTYyNVpNMTEuMjUgMTIuODEyNUMxMi4xODc1IDEyLjgxMjUgMTMuMDg1%0D%0AOSAxMi41NzgxIDEzLjkwNjIgMTIuMTA5NEMxNC42ODc1IDExLjY0MDYgMTUuMzUxNiAxMC45NzY2%0D%0AIDE1LjgyMDMgMTAuMTU2MkMxNi4yODkxIDkuMzc1IDE2LjU2MjUgOC40NzY1NiAxNi41NjI1IDcu%0D%0ANUMxNi41NjI1IDYuNTYyNSAxNi4yODkxIDUuNjY0MDYgMTUuODIwMyA0Ljg0Mzc1QzE1LjM1MTYg%0D%0ANC4wNjI1IDE0LjY4NzUgMy4zOTg0NCAxMy45MDYyIDIuOTI5NjlDMTMuMDg1OSAyLjQ2MDk0IDEy%0D%0ALjE4NzUgMi4xODc1IDExLjI1IDIuMTg3NUMxMC4yNzM0IDIuMTg3NSA5LjM3NSAyLjQ2MDk0IDgu%0D%0ANTkzNzUgMi45Mjk2OUM3Ljc3MzQ0IDMuMzk4NDQgNy4xMDkzOCA0LjA2MjUgNi42NDA2MiA0Ljg0%0D%0AMzc1QzYuMTcxODggNS42NjQwNiA1LjkzNzUgNi41NjI1IDUuOTM3NSA3LjVDNS45Mzc1IDguNDc2%0D%0ANTYgNi4xNzE4OCA5LjM3NSA2LjY0MDYyIDEwLjE1NjJDNy4xMDkzOCAxMC45NzY2IDcuNzczNDQg%0D%0AMTEuNjQwNiA4LjU5Mzc1IDEyLjEwOTRDOS4zNzUgMTIuNTc4MSAxMC4yNzM0IDEyLjgxMjUgMTEu%0D%0AMjUgMTIuODEyNVpNMTUuMzEyNSA3LjVDMTUuMzEyNSA2LjQwNjI1IDE0Ljg4MjggNS40Mjk2OSAx%0D%0ANC4xMDE2IDQuNjQ4NDRDMTMuMzIwMyAzLjg2NzE5IDEyLjM0MzggMy40Mzc1IDExLjI1IDMuNDM3%0D%0ANUMxMC41NDY5IDMuNDM3NSA5LjkyMTg4IDMuNTkzNzUgOS4zMzU5NCAzLjkwNjI1QzkuODA0Njkg%0D%0AMy45MDYyNSAxMC4xOTUzIDQuMTAxNTYgMTAuNTA3OCA0LjQxNDA2QzEwLjgyMDMgNC43MjY1NiAx%0D%0AMS4wMTU2IDUuMTE3MTkgMTEuMDE1NiA1LjU4NTk0QzExLjAxNTYgNi4wNTQ2OSAxMC44MjAzIDYu%0D%0ANDg0MzggMTAuNTA3OCA2Ljc5Njg4QzEwLjE5NTMgNy4xMDkzOCA5LjgwNDY5IDcuMjY1NjIgOS4z%0D%0AMzU5NCA3LjI2NTYyQzguODY3MTkgNy4yNjU2MiA4LjQzNzUgNy4xMDkzOCA4LjEyNSA2Ljc5Njg4%0D%0AQzcuODEyNSA2LjQ4NDM4IDcuNjU2MjUgNi4wNTQ2OSA3LjY1NjI1IDUuNTg1OTRDNy4zNDM3NSA2%0D%0ALjIxMDk0IDcuMTg3NSA2LjgzNTk0IDcuMTg3NSA3LjVDNy4xODc1IDguNjMyODEgNy41NzgxMiA5%0D%0ALjYwOTM4IDguMzU5MzggMTAuMzkwNkM5LjE0MDYyIDExLjE3MTkgMTAuMTE3MiAxMS41NjI1IDEx%0D%0ALjI1IDExLjU2MjVDMTIuMzQzOCAxMS41NjI1IDEzLjMyMDMgMTEuMTcxOSAxNC4xMDE2IDEwLjM5%0D%0AMDZDMTQuODgyOCA5LjYwOTM4IDE1LjMxMjUgOC42MzI4MSAxNS4zMTI1IDcuNVoiIGZpbGw9Indo%0D%0AaXRlIi8+Cjwvc3ZnPgo="
                    />{" "}
                    {this.state.clips[0].viewCount}
                  </span>
                  <img
                    className="clipsthumb"
                    src={this.state.clips[0].contentLocators[1].uri}
                  />
                  <h1 className="clipstitle">{this.state.clips[0].title}</h1>
                </div>
              </a>
              <a
                target="_blank"
                href={`https://mixer.com/${this.state.mixer.token}?clip=${this.state.clips[1].shareableId}`}
              >
                <div className="clipsitem clipsitem__middle">
                  <span className="clipsviews">
                    <img
                      className="eyeicon"
                      src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjMiIGhlaWdodD0iMTUiIHZpZXdCb3g9IjAgMCAyMyAxNSIgZmlsbD0ibm9u%0D%0AZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIyLjIyNjYg%0D%0ANi41NjI1QzIyLjM4MjggNi44NzUgMjIuNSA3LjE4NzUgMjIuNSA3LjVDMjIuNSA3Ljg1MTU2IDIy%0D%0ALjM4MjggOC4xNjQwNiAyMi4yMjY2IDguNDM3NUMyMS4wOTM4IDEwLjM1MTYgMTkuNTcwMyAxMS44%0D%0ANzUgMTcuNjU2MiAxMi45Njg4QzE1LjcwMzEgMTQuMTQwNiAxMy41NTQ3IDE0LjY4NzUgMTEuMjUg%0D%0AMTQuNjg3NUM4LjkwNjI1IDE0LjY4NzUgNi43OTY4OCAxNC4xNDA2IDQuODQzNzUgMTIuOTY4OEMy%0D%0ALjg5MDYyIDExLjg3NSAxLjM2NzE5IDEwLjM1MTYgMC4yNzM0MzggOC40Mzc1QzAuMDc4MTI1IDgu%0D%0AMTY0MDYgMCA3Ljg1MTU2IDAgNy41QzAgNy4xODc1IDAuMDc4MTI1IDYuODc1IDAuMjczNDM4IDYu%0D%0ANTYyNUMxLjM2NzE5IDQuNjg3NSAyLjg5MDYyIDMuMTY0MDYgNC44NDM3NSAyLjAzMTI1QzYuNzk2%0D%0AODggMC44OTg0MzggOC45MDYyNSAwLjMxMjUgMTEuMjUgMC4zMTI1QzEzLjU1NDcgMC4zMTI1IDE1%0D%0ALjcwMzEgMC44OTg0MzggMTcuNjU2MiAyLjAzMTI1QzE5LjU3MDMgMy4xNjQwNiAyMS4wOTM4IDQu%0D%0ANjg3NSAyMi4yMjY2IDYuNTYyNVpNMTEuMjUgMTIuODEyNUMxMi4xODc1IDEyLjgxMjUgMTMuMDg1%0D%0AOSAxMi41NzgxIDEzLjkwNjIgMTIuMTA5NEMxNC42ODc1IDExLjY0MDYgMTUuMzUxNiAxMC45NzY2%0D%0AIDE1LjgyMDMgMTAuMTU2MkMxNi4yODkxIDkuMzc1IDE2LjU2MjUgOC40NzY1NiAxNi41NjI1IDcu%0D%0ANUMxNi41NjI1IDYuNTYyNSAxNi4yODkxIDUuNjY0MDYgMTUuODIwMyA0Ljg0Mzc1QzE1LjM1MTYg%0D%0ANC4wNjI1IDE0LjY4NzUgMy4zOTg0NCAxMy45MDYyIDIuOTI5NjlDMTMuMDg1OSAyLjQ2MDk0IDEy%0D%0ALjE4NzUgMi4xODc1IDExLjI1IDIuMTg3NUMxMC4yNzM0IDIuMTg3NSA5LjM3NSAyLjQ2MDk0IDgu%0D%0ANTkzNzUgMi45Mjk2OUM3Ljc3MzQ0IDMuMzk4NDQgNy4xMDkzOCA0LjA2MjUgNi42NDA2MiA0Ljg0%0D%0AMzc1QzYuMTcxODggNS42NjQwNiA1LjkzNzUgNi41NjI1IDUuOTM3NSA3LjVDNS45Mzc1IDguNDc2%0D%0ANTYgNi4xNzE4OCA5LjM3NSA2LjY0MDYyIDEwLjE1NjJDNy4xMDkzOCAxMC45NzY2IDcuNzczNDQg%0D%0AMTEuNjQwNiA4LjU5Mzc1IDEyLjEwOTRDOS4zNzUgMTIuNTc4MSAxMC4yNzM0IDEyLjgxMjUgMTEu%0D%0AMjUgMTIuODEyNVpNMTUuMzEyNSA3LjVDMTUuMzEyNSA2LjQwNjI1IDE0Ljg4MjggNS40Mjk2OSAx%0D%0ANC4xMDE2IDQuNjQ4NDRDMTMuMzIwMyAzLjg2NzE5IDEyLjM0MzggMy40Mzc1IDExLjI1IDMuNDM3%0D%0ANUMxMC41NDY5IDMuNDM3NSA5LjkyMTg4IDMuNTkzNzUgOS4zMzU5NCAzLjkwNjI1QzkuODA0Njkg%0D%0AMy45MDYyNSAxMC4xOTUzIDQuMTAxNTYgMTAuNTA3OCA0LjQxNDA2QzEwLjgyMDMgNC43MjY1NiAx%0D%0AMS4wMTU2IDUuMTE3MTkgMTEuMDE1NiA1LjU4NTk0QzExLjAxNTYgNi4wNTQ2OSAxMC44MjAzIDYu%0D%0ANDg0MzggMTAuNTA3OCA2Ljc5Njg4QzEwLjE5NTMgNy4xMDkzOCA5LjgwNDY5IDcuMjY1NjIgOS4z%0D%0AMzU5NCA3LjI2NTYyQzguODY3MTkgNy4yNjU2MiA4LjQzNzUgNy4xMDkzOCA4LjEyNSA2Ljc5Njg4%0D%0AQzcuODEyNSA2LjQ4NDM4IDcuNjU2MjUgNi4wNTQ2OSA3LjY1NjI1IDUuNTg1OTRDNy4zNDM3NSA2%0D%0ALjIxMDk0IDcuMTg3NSA2LjgzNTk0IDcuMTg3NSA3LjVDNy4xODc1IDguNjMyODEgNy41NzgxMiA5%0D%0ALjYwOTM4IDguMzU5MzggMTAuMzkwNkM5LjE0MDYyIDExLjE3MTkgMTAuMTE3MiAxMS41NjI1IDEx%0D%0ALjI1IDExLjU2MjVDMTIuMzQzOCAxMS41NjI1IDEzLjMyMDMgMTEuMTcxOSAxNC4xMDE2IDEwLjM5%0D%0AMDZDMTQuODgyOCA5LjYwOTM4IDE1LjMxMjUgOC42MzI4MSAxNS4zMTI1IDcuNVoiIGZpbGw9Indo%0D%0AaXRlIi8+Cjwvc3ZnPgo="
                    />{" "}
                    {this.state.clips[1].viewCount}
                  </span>
                  <img
                    className="clipsthumb"
                    src={this.state.clips[1].contentLocators[1].uri}
                  />
                  <h1 className="clipstitle">{this.state.clips[1].title}</h1>
                </div>
              </a>
            </div>
          </div>
        );
      } else if (this.state.clips.length === 1) {
        clips = (
          <div className="container">
            <div className="clips row">
              <a
                target="_blank"
                href={`https://mixer.com/${this.state.mixer.token}?clip=${this.state.clips[0].shareableId}`}
              >
                <div className="clipsitem">
                  <span className="clipsviews">
                    <img
                      className="eyeicon"
                      src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjMiIGhlaWdodD0iMTUiIHZpZXdCb3g9IjAgMCAyMyAxNSIgZmlsbD0ibm9u%0D%0AZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIyLjIyNjYg%0D%0ANi41NjI1QzIyLjM4MjggNi44NzUgMjIuNSA3LjE4NzUgMjIuNSA3LjVDMjIuNSA3Ljg1MTU2IDIy%0D%0ALjM4MjggOC4xNjQwNiAyMi4yMjY2IDguNDM3NUMyMS4wOTM4IDEwLjM1MTYgMTkuNTcwMyAxMS44%0D%0ANzUgMTcuNjU2MiAxMi45Njg4QzE1LjcwMzEgMTQuMTQwNiAxMy41NTQ3IDE0LjY4NzUgMTEuMjUg%0D%0AMTQuNjg3NUM4LjkwNjI1IDE0LjY4NzUgNi43OTY4OCAxNC4xNDA2IDQuODQzNzUgMTIuOTY4OEMy%0D%0ALjg5MDYyIDExLjg3NSAxLjM2NzE5IDEwLjM1MTYgMC4yNzM0MzggOC40Mzc1QzAuMDc4MTI1IDgu%0D%0AMTY0MDYgMCA3Ljg1MTU2IDAgNy41QzAgNy4xODc1IDAuMDc4MTI1IDYuODc1IDAuMjczNDM4IDYu%0D%0ANTYyNUMxLjM2NzE5IDQuNjg3NSAyLjg5MDYyIDMuMTY0MDYgNC44NDM3NSAyLjAzMTI1QzYuNzk2%0D%0AODggMC44OTg0MzggOC45MDYyNSAwLjMxMjUgMTEuMjUgMC4zMTI1QzEzLjU1NDcgMC4zMTI1IDE1%0D%0ALjcwMzEgMC44OTg0MzggMTcuNjU2MiAyLjAzMTI1QzE5LjU3MDMgMy4xNjQwNiAyMS4wOTM4IDQu%0D%0ANjg3NSAyMi4yMjY2IDYuNTYyNVpNMTEuMjUgMTIuODEyNUMxMi4xODc1IDEyLjgxMjUgMTMuMDg1%0D%0AOSAxMi41NzgxIDEzLjkwNjIgMTIuMTA5NEMxNC42ODc1IDExLjY0MDYgMTUuMzUxNiAxMC45NzY2%0D%0AIDE1LjgyMDMgMTAuMTU2MkMxNi4yODkxIDkuMzc1IDE2LjU2MjUgOC40NzY1NiAxNi41NjI1IDcu%0D%0ANUMxNi41NjI1IDYuNTYyNSAxNi4yODkxIDUuNjY0MDYgMTUuODIwMyA0Ljg0Mzc1QzE1LjM1MTYg%0D%0ANC4wNjI1IDE0LjY4NzUgMy4zOTg0NCAxMy45MDYyIDIuOTI5NjlDMTMuMDg1OSAyLjQ2MDk0IDEy%0D%0ALjE4NzUgMi4xODc1IDExLjI1IDIuMTg3NUMxMC4yNzM0IDIuMTg3NSA5LjM3NSAyLjQ2MDk0IDgu%0D%0ANTkzNzUgMi45Mjk2OUM3Ljc3MzQ0IDMuMzk4NDQgNy4xMDkzOCA0LjA2MjUgNi42NDA2MiA0Ljg0%0D%0AMzc1QzYuMTcxODggNS42NjQwNiA1LjkzNzUgNi41NjI1IDUuOTM3NSA3LjVDNS45Mzc1IDguNDc2%0D%0ANTYgNi4xNzE4OCA5LjM3NSA2LjY0MDYyIDEwLjE1NjJDNy4xMDkzOCAxMC45NzY2IDcuNzczNDQg%0D%0AMTEuNjQwNiA4LjU5Mzc1IDEyLjEwOTRDOS4zNzUgMTIuNTc4MSAxMC4yNzM0IDEyLjgxMjUgMTEu%0D%0AMjUgMTIuODEyNVpNMTUuMzEyNSA3LjVDMTUuMzEyNSA2LjQwNjI1IDE0Ljg4MjggNS40Mjk2OSAx%0D%0ANC4xMDE2IDQuNjQ4NDRDMTMuMzIwMyAzLjg2NzE5IDEyLjM0MzggMy40Mzc1IDExLjI1IDMuNDM3%0D%0ANUMxMC41NDY5IDMuNDM3NSA5LjkyMTg4IDMuNTkzNzUgOS4zMzU5NCAzLjkwNjI1QzkuODA0Njkg%0D%0AMy45MDYyNSAxMC4xOTUzIDQuMTAxNTYgMTAuNTA3OCA0LjQxNDA2QzEwLjgyMDMgNC43MjY1NiAx%0D%0AMS4wMTU2IDUuMTE3MTkgMTEuMDE1NiA1LjU4NTk0QzExLjAxNTYgNi4wNTQ2OSAxMC44MjAzIDYu%0D%0ANDg0MzggMTAuNTA3OCA2Ljc5Njg4QzEwLjE5NTMgNy4xMDkzOCA5LjgwNDY5IDcuMjY1NjIgOS4z%0D%0AMzU5NCA3LjI2NTYyQzguODY3MTkgNy4yNjU2MiA4LjQzNzUgNy4xMDkzOCA4LjEyNSA2Ljc5Njg4%0D%0AQzcuODEyNSA2LjQ4NDM4IDcuNjU2MjUgNi4wNTQ2OSA3LjY1NjI1IDUuNTg1OTRDNy4zNDM3NSA2%0D%0ALjIxMDk0IDcuMTg3NSA2LjgzNTk0IDcuMTg3NSA3LjVDNy4xODc1IDguNjMyODEgNy41NzgxMiA5%0D%0ALjYwOTM4IDguMzU5MzggMTAuMzkwNkM5LjE0MDYyIDExLjE3MTkgMTAuMTE3MiAxMS41NjI1IDEx%0D%0ALjI1IDExLjU2MjVDMTIuMzQzOCAxMS41NjI1IDEzLjMyMDMgMTEuMTcxOSAxNC4xMDE2IDEwLjM5%0D%0AMDZDMTQuODgyOCA5LjYwOTM4IDE1LjMxMjUgOC42MzI4MSAxNS4zMTI1IDcuNVoiIGZpbGw9Indo%0D%0AaXRlIi8+Cjwvc3ZnPgo="
                    />{" "}
                    {this.state.clips[0].viewCount}
                  </span>
                  <img
                    className="clipsthumb"
                    src={this.state.clips[0].contentLocators[1].uri}
                  />
                  <h1 className="clipstitle">{this.state.clips[0].title}</h1>
                </div>
              </a>
            </div>
          </div>
        );
      } else {
        clips = <div style={{ marginTop: "40px" }}></div>;
      }
    } else if (this.state.mixer.partnered === false) {
      clips = " ";
    }

    var date = new Date(this.state.mixer.createdAt);
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    let partnered = this.state.mixer.partnered;

    if (partnered === true) {
      partnered = (
        <Tooltip placement="right" overlay={"Verified"}>
          <img
            className="partnered"
            src={"https://mixer.com/_latest/assets/images/channel/verified.png"}
          />
        </Tooltip>
      );
    } else {
      partnered = " ";
    }

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

    const viewers = new Intl.NumberFormat().format(
      this.state.mixer.viewersCurrent
    );

    const level = new Intl.NumberFormat().format(this.state.user.level);

    const sparks = new Intl.NumberFormat().format(this.state.user.sparks);

    let avatarStyle;

    let overlay;

    if (socials) {
      let twitter;
      if (socials.twitter) {
        twitter = (
          <Tooltip
            placement="right"
            overlay={
              <TwitterTimelineEmbed
                sourceType="url"
                url={socials.twitter}
                theme="dark"
                options={{ height: 400 }}
              />
            }
          >
            <a target="_blank" href={socials.twitter}>
              <i class="fab fa-twitter"></i>
            </a>
          </Tooltip>
        );
      } else if (socials.twitter === undefined) {
        twitter = " ";
      }

      let steam = this.state.steam;
      if (steam) {
        steam = (
          <Tooltip placement="right" overlay={"Steam"}>
            <a target="_blank" href={this.state.steam}>
              <i class="fab fa-steam"></i>
            </a>
          </Tooltip>
        );
      } else if (steam === undefined) {
        steam = " ";
      }

      let facebook;
      if (socials.facebook) {
        facebook = (
          <Tooltip placement="right" overlay={"Facebook"}>
            <a target="_blank" href={socials.facebook}>
              <i class="fab fa-facebook"></i>
            </a>
          </Tooltip>
        );
      } else if (socials.facebook === undefined) {
        facebook = " ";
      }

      let instagram;
      if (socials.instagram) {
        instagram = (
          <Tooltip placement="right" overlay={"Instagram"}>
            <a target="_blank" href={socials.instagram}>
              <i class="fab fa-instagram"></i>
            </a>
          </Tooltip>
        );
      } else if (socials.instagram === undefined) {
        instagram = " ";
      }

      let player;
      if (socials.player) {
        player = (
          <Tooltip placement="right" overlay={"Player.me"}>
            <a class="fab fa-player" target="_blank" href={socials.player}>
              <svg
                class="iconsize"
                width="26"
                height="26"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.1629 9.5716e-05C10.5944 0.000227002 9.04125 0.309338 7.59217 0.909776C6.1431 1.51021 4.8265 2.39022 3.71756 3.49953C2.60861 4.60885 1.72905 5.92574 1.1291 7.37502C0.529145 8.82429 0.220554 10.3776 0.220948 11.9461V12.4271C0.564948 21.1041 9.62995 32.0001 9.62995 32.0001V17.6061C8.30671 17.0135 7.23232 15.9769 6.5928 14.6757C5.95327 13.3746 5.78887 11.8907 6.12805 10.4811C6.46723 9.07145 7.28864 7.8248 8.45007 6.95695C9.6115 6.0891 11.0398 5.65469 12.4878 5.72893C13.9357 5.80316 15.3122 6.38137 16.3788 7.36346C17.4453 8.34554 18.1349 9.66966 18.3282 11.1066C18.5214 12.5435 18.2061 14.0028 17.4369 15.2317C16.6676 16.4607 15.4929 17.382 14.1159 17.8361V23.7391C17.0844 23.2595 19.7629 21.6781 21.6166 19.3105C23.4704 16.943 24.3631 13.9634 24.1165 10.9665C23.87 7.96967 22.5023 5.17604 20.2865 3.14325C18.0708 1.11046 15.1699 -0.0119345 12.1629 9.5716e-05Z"
                  fill="white"
                />
              </svg>
            </a>
          </Tooltip>
        );
      } else if (socials.player === undefined) {
        player = " ";
      }

      let soundcloud;
      if (socials.soundcloud) {
        soundcloud = (
          <Tooltip placement="right" overlay={"Soundcloud"}>
            <a target="_blank" href={socials.soundcloud}>
              <i class="fab fa-soundcloud"></i>
            </a>
          </Tooltip>
        );
      } else if ((socials.soundcloud = undefined)) {
        soundcloud = " ";
      }

      let patreon;
      if (socials.patreon) {
        patreon = (
          <Tooltip placement="right" overlay={"Patreon"}>
            <a target="_blank" href={socials.patreon}>
              <i class="fab fa-patreon"></i>
            </a>
          </Tooltip>
        );
      } else if (socials.patreon === undefined) {
        patreon = " ";
      }

      let users = "https://mixer.com/api/v1/users/" + this.state.mixer.userId;

      let youtube;
      if (socials.youtube) {
        youtube = (
          <Tooltip placement="right" overlay={"YouTube"}>
            <a target="_blank" href={socials.youtube}>
              <i class="fab fa-youtube"></i>
            </a>
          </Tooltip>
        );
      } else if (socials.youtube === undefined) {
        youtube = " ";
      }

      let embed;

      embed = (
        <Tooltip placement="right" overlay={"View embed"}>
          <a href={`/${this.state.mixer.token}/embed`}>
            <i class="fas fa-code"></i>
          </a>
        </Tooltip>
      );

      socials = (
        <div className="socialbuttons">
          {twitter}
          {facebook}
          {instagram}
          {youtube}
          {player}
          {soundcloud}
          {steam}
          {patreon}
          {embed}
        </div>
      );
    }

    var gameTitle = this.state.type.name;
    let currentlyplaying;
    if (this.state.type === null) {
      currentlyplaying = "Currently playing nothing...";
    } else if (gameTitle === "Programming") {
      currentlyplaying = "Programming 👨‍💻";
    } else if (gameTitle === "Music" || gameTitle === "Radio") {
      currentlyplaying = "Playing Music 🎶";
    } else if (gameTitle === "Development") {
      currentlyplaying = "Developing 👨‍💻";
    } else if (gameTitle === "Web Show") {
      currentlyplaying = "Hosting a Web Show 📺";
    } else if (gameTitle === "Creative") {
      currentlyplaying = "Being Creative 🎨";
    } else {
      currentlyplaying = "Currently playing " + gameTitle;
    }

    if (this.state.mixer.online === false) {
      currentlyplaying = "Last seen playing " + this.state.type.name;
    }

    return (
      <div>
        <Navbar />
        <Helmet>
          <title>{this.state.mixer.token}</title>
        </Helmet>
        <div className="userpage">
          <div className="container userstats">
            <div className="row">
              <div className="avatar">
                <img
                  style={{
                    border:
                      this.state.mixer.online != true
                        ? "5px solid #7a7a7a"
                        : "5px solid #158105"
                  }}
                  className="avatar"
                  src={`https://mixer.com/api/v1/users/${this.state.mixer.userId}/avatar`}
                />
              </div>
              <div className="userinfo">
                <h1 className="username">
                  {this.state.mixer.token} {partnered}
                </h1>
                <h1 className="followers">{followers} followers</h1>
                <Tooltip
                  placement="right"
                  overlay={
                    <img
                      className="gameitem"
                      src={this.state.type.coverUrl}
                    ></img>
                  }
                >
                  <h1 className="playing">{currentlyplaying}</h1>
                </Tooltip>
                <span className="statslabel">
                  <span
                    style={{ background: this.state.color }}
                    className="statscircle"
                  >
                    ⚔️
                  </span>{" "}
                  LVL {level}
                </span>
                <span className="statslabel">
                  <span
                    style={{ background: this.state.color }}
                    className="statscircle"
                  >
                    ⚡
                  </span>{" "}
                  {sparks}
                </span>
                <span className="statslabel">
                  <span
                    style={{ background: this.state.color }}
                    className="statscircle"
                  >
                    ✨
                  </span>{" "}
                  {experience} XP
                </span>
                <span className="statslabel">
                  <span
                    style={{ background: this.state.color }}
                    className="statscircle"
                  >
                    📆
                  </span>{" "}
                  {joinDate}
                </span>
                {tip}
              </div>
            </div>
          </div>
          {hosting}
          <div
            className="container overlay"
            style={{
              display: this.state.mixer.online != false ? "block" : "none"
            }}
          >
            <span className="green">{this.state.mixer.name}</span>
            <span className="grey">
              <img
                className="eyeicon"
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjMiIGhlaWdodD0iMTUiIHZpZXdCb3g9IjAgMCAyMyAxNSIgZmlsbD0ibm9u%0D%0AZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIyLjIyNjYg%0D%0ANi41NjI1QzIyLjM4MjggNi44NzUgMjIuNSA3LjE4NzUgMjIuNSA3LjVDMjIuNSA3Ljg1MTU2IDIy%0D%0ALjM4MjggOC4xNjQwNiAyMi4yMjY2IDguNDM3NUMyMS4wOTM4IDEwLjM1MTYgMTkuNTcwMyAxMS44%0D%0ANzUgMTcuNjU2MiAxMi45Njg4QzE1LjcwMzEgMTQuMTQwNiAxMy41NTQ3IDE0LjY4NzUgMTEuMjUg%0D%0AMTQuNjg3NUM4LjkwNjI1IDE0LjY4NzUgNi43OTY4OCAxNC4xNDA2IDQuODQzNzUgMTIuOTY4OEMy%0D%0ALjg5MDYyIDExLjg3NSAxLjM2NzE5IDEwLjM1MTYgMC4yNzM0MzggOC40Mzc1QzAuMDc4MTI1IDgu%0D%0AMTY0MDYgMCA3Ljg1MTU2IDAgNy41QzAgNy4xODc1IDAuMDc4MTI1IDYuODc1IDAuMjczNDM4IDYu%0D%0ANTYyNUMxLjM2NzE5IDQuNjg3NSAyLjg5MDYyIDMuMTY0MDYgNC44NDM3NSAyLjAzMTI1QzYuNzk2%0D%0AODggMC44OTg0MzggOC45MDYyNSAwLjMxMjUgMTEuMjUgMC4zMTI1QzEzLjU1NDcgMC4zMTI1IDE1%0D%0ALjcwMzEgMC44OTg0MzggMTcuNjU2MiAyLjAzMTI1QzE5LjU3MDMgMy4xNjQwNiAyMS4wOTM4IDQu%0D%0ANjg3NSAyMi4yMjY2IDYuNTYyNVpNMTEuMjUgMTIuODEyNUMxMi4xODc1IDEyLjgxMjUgMTMuMDg1%0D%0AOSAxMi41NzgxIDEzLjkwNjIgMTIuMTA5NEMxNC42ODc1IDExLjY0MDYgMTUuMzUxNiAxMC45NzY2%0D%0AIDE1LjgyMDMgMTAuMTU2MkMxNi4yODkxIDkuMzc1IDE2LjU2MjUgOC40NzY1NiAxNi41NjI1IDcu%0D%0ANUMxNi41NjI1IDYuNTYyNSAxNi4yODkxIDUuNjY0MDYgMTUuODIwMyA0Ljg0Mzc1QzE1LjM1MTYg%0D%0ANC4wNjI1IDE0LjY4NzUgMy4zOTg0NCAxMy45MDYyIDIuOTI5NjlDMTMuMDg1OSAyLjQ2MDk0IDEy%0D%0ALjE4NzUgMi4xODc1IDExLjI1IDIuMTg3NUMxMC4yNzM0IDIuMTg3NSA5LjM3NSAyLjQ2MDk0IDgu%0D%0ANTkzNzUgMi45Mjk2OUM3Ljc3MzQ0IDMuMzk4NDQgNy4xMDkzOCA0LjA2MjUgNi42NDA2MiA0Ljg0%0D%0AMzc1QzYuMTcxODggNS42NjQwNiA1LjkzNzUgNi41NjI1IDUuOTM3NSA3LjVDNS45Mzc1IDguNDc2%0D%0ANTYgNi4xNzE4OCA5LjM3NSA2LjY0MDYyIDEwLjE1NjJDNy4xMDkzOCAxMC45NzY2IDcuNzczNDQg%0D%0AMTEuNjQwNiA4LjU5Mzc1IDEyLjEwOTRDOS4zNzUgMTIuNTc4MSAxMC4yNzM0IDEyLjgxMjUgMTEu%0D%0AMjUgMTIuODEyNVpNMTUuMzEyNSA3LjVDMTUuMzEyNSA2LjQwNjI1IDE0Ljg4MjggNS40Mjk2OSAx%0D%0ANC4xMDE2IDQuNjQ4NDRDMTMuMzIwMyAzLjg2NzE5IDEyLjM0MzggMy40Mzc1IDExLjI1IDMuNDM3%0D%0ANUMxMC41NDY5IDMuNDM3NSA5LjkyMTg4IDMuNTkzNzUgOS4zMzU5NCAzLjkwNjI1QzkuODA0Njkg%0D%0AMy45MDYyNSAxMC4xOTUzIDQuMTAxNTYgMTAuNTA3OCA0LjQxNDA2QzEwLjgyMDMgNC43MjY1NiAx%0D%0AMS4wMTU2IDUuMTE3MTkgMTEuMDE1NiA1LjU4NTk0QzExLjAxNTYgNi4wNTQ2OSAxMC44MjAzIDYu%0D%0ANDg0MzggMTAuNTA3OCA2Ljc5Njg4QzEwLjE5NTMgNy4xMDkzOCA5LjgwNDY5IDcuMjY1NjIgOS4z%0D%0AMzU5NCA3LjI2NTYyQzguODY3MTkgNy4yNjU2MiA4LjQzNzUgNy4xMDkzOCA4LjEyNSA2Ljc5Njg4%0D%0AQzcuODEyNSA2LjQ4NDM4IDcuNjU2MjUgNi4wNTQ2OSA3LjY1NjI1IDUuNTg1OTRDNy4zNDM3NSA2%0D%0ALjIxMDk0IDcuMTg3NSA2LjgzNTk0IDcuMTg3NSA3LjVDNy4xODc1IDguNjMyODEgNy41NzgxMiA5%0D%0ALjYwOTM4IDguMzU5MzggMTAuMzkwNkM5LjE0MDYyIDExLjE3MTkgMTAuMTE3MiAxMS41NjI1IDEx%0D%0ALjI1IDExLjU2MjVDMTIuMzQzOCAxMS41NjI1IDEzLjMyMDMgMTEuMTcxOSAxNC4xMDE2IDEwLjM5%0D%0AMDZDMTQuODgyOCA5LjYwOTM4IDE1LjMxMjUgOC42MzI4MSAxNS4zMTI1IDcuNVoiIGZpbGw9Indo%0D%0AaXRlIi8+Cjwvc3ZnPgo="
              />{" "}
              {viewers}
            </span>
            <span
              className="audience"
              style={{
                background:
                  this.state.mixer.audience != "18+" ? "#158105" : "#FF3C3C"
              }}
            >
              {this.state.mixer.audience}
            </span>
          </div>
          <div className="container overlay alpha">
            <a
              target="_blank"
              href="https://feedback.orangop.us/mixlook"
              style={{ textDecoration: "none", color: "#fff" }}
            >
              {" "}
              <span className="grey">
                Mixlook is in early alpha! Please leave feedback ✍️
              </span>
            </a>
          </div>
          <div className="tab">
            <a
              target="_blank"
              href={"https://mixer.com/" + this.state.mixer.token}
            >
              <Tooltip
                placement="top"
                overlay={"mixer.com/" + this.state.mixer.token}
              >
                <img
                  className="mixermerge"
                  src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFk%0D%0Ab2JlIElsbHVzdHJhdG9yIDIxLjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246%0D%0AIDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5z%0D%0APSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMu%0D%0Ab3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBz%0D%0AdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVz%0D%0AZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5%0D%0AbGU+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0xMTYuMDMsNzcuNjhjLTE1Ljc2LTIxLjI5LTQ2Ljcy%0D%0ALTI0LjYxLTY2LjkxLTYuMzZjLTE3LjQyLDE2LjA0LTE4LjgsNDMuMTMtNC43LDYyLjIxbDkwLjk2%0D%0ALDEyMS45MgoJTDQzLjg3LDM3OC40OGMtMTQuMSwxOS4wOC0xMi45OSw0Ni4xNyw0LjcsNjIuMjFj%0D%0AMjAuMTgsMTguMjUsNTEuMTUsMTQuOTMsNjYuOTEtNi4zNmwxMjcuNzMtMTcxLjY5YzMuMDQtNC4x%0D%0ANSwzLjA0LTkuOTUsMC0xNC4xCglMMTE2LjAzLDc3LjY4eiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBk%0D%0APSJNMzk2LjM3LDc3LjY4YzE1Ljc2LTIxLjI5LDQ2LjcyLTI0LjYxLDY2LjkxLTYuMzZjMTcuNDIs%0D%0AMTYuMDQsMTguOCw0My4xMyw0LjcsNjIuMjFsLTkwLjk2LDEyMS45MgoJbDkxLjUxLDEyMy4wM2Mx%0D%0ANC4xLDE5LjA4LDEyLjk5LDQ2LjE3LTQuNyw2Mi4yMWMtMjAuMTgsMTguMjUtNTEuMTUsMTQuOTMt%0D%0ANjYuOTEtNi4zNkwyNjkuNDcsMjYyLjM2Yy0zLjA0LTQuMTUtMy4wNC05Ljk1LDAtMTQuMQoJTDM5%0D%0ANi4zNyw3Ny42OHoiLz4KPC9zdmc+Cg=="
                />
              </Tooltip>
            </a>
            <span
              className="live"
              style={{
                display: this.state.mixer.online != false ? "block" : "none"
              }}
            ></span>
          </div>
          <div className="socials">{socials}</div>
          <div className="embed">
            <iframe
              title={this.state.mixer.token}
              className="player"
              src={
                player +
                this.state.mixer.token +
                "?muted=true&disableLowLatency=true"
              }
              width="930"
              height="523"
            ></iframe>
            <iframe
              title={this.state.mixer.token}
              className="chat"
              src={chat + this.state.mixer.token}
              width="430"
              height="523"
            ></iframe>
          </div>
          {clips}
          {smclips}
          <div className="container darkbox">
            <h1 className="abouttitle">About {this.state.mixer.token}</h1>
            <div
              className="innerbox"
              dangerouslySetInnerHTML={{ __html: this.state.mixer.description }}
            />
          </div>
          <div className="spacing"></div>
        </div>
      </div>
    );
  }
}

//Functional component, takes `num` as a prop
function FollowCount({ num }) {
  //This is an effect that comes from react-spring, it it designed for animating things, but since all
  //it really does is change numbers we can use it for this, basically if it gets a number/css value, then that value changes, it
  //will interpolate and animate between the two values.
  const aNumber = useSpring({ followers: num });

  return (
    <animated.a>{aNumber.followers.interpolate(x => x.toFixed(0))}</animated.a>
  );
}

function demoAsyncCall() {
  return new Promise(resolve => setTimeout(() => resolve(), 2500));
}
