import React from "react";
import carousel from "../assets/carousel.svg";
import axios from "axios";
import Tooltip from "rc-tooltip";
import "rc-tooltip/assets/bootstrap.css";

export default class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query: "",
      results: {},
      loading: false,
      message: "",
      totalResults: 0,
      totalPages: 0,
      currentPageNo: 0
    };

    this.cancel = "";
  }

  fetchSearchResults = query => {
    const searchUrl = `https://mixer.com/api/v1/channels?scope=names&q=${query}`;

    if (this.cancel) {
      this.cancel.cancel();
    }

    this.cancel = axios.CancelToken.source();

    axios
      .get(searchUrl, {
        cancelToken: this.cancel.token
      })
      .then(res => {
        const resultNotFoundMsg = !res.data.length
          ? "There are no more search results. Please try a new search"
          : "";
        console.log(res.data.length);
        this.setState({
          results: res.data,
          message: resultNotFoundMsg,
          loading: false
        });
      })
      .catch(error => {
        if (axios.isCancel(error) || error) {
          this.setState({
            loading: false,
            message: "Failed to fetch the data. Please check network"
          });
        }
      });
  };

  handleOnInputChange = event => {
    const query = event.target.value;
    if (!query) {
      this.setState({
        query,
        results: {},
        message: "",
        totalPages: 0,
        totalResults: 0
      });
    } else {
      this.setState({ query, message: "" }, () => {
        this.fetchSearchResults(query);
      });
    }
  };

  renderSearchResults = () => {
    const { results } = this.state;

    if (Object.keys(results).length && results.length) {
      return (
        <div>
          <div>
            <h1 className="featured">Results ({results.length})</h1>
          </div>
          <div className="results-container">
            {results.map(result => {
              return (
                <a key={result.id} href={result.token} className="result-item">
                  <div className="image-wrapper">
                    <Tooltip placement="top" overlay={result.token}>
                      <img
                        style={{
                          border:
                            result.online != true
                              ? "5px solid #7a7a7a"
                              : "5px solid #158105"
                        }}
                        className="avatar"
                        src={`https://mixer.com/api/v1/users/${result.userId}/avatar`}
                        alt={`${result.token}`}
                      />
                    </Tooltip>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      );
    }
  };

  render() {
    const { query } = this.state;

    return (
      <div>
        <div className="searchcontainer">
          <input
            type="text"
            name="query"
            value={query}
            id="search-input"
            autocomplete="off"
            placeholder="Search..."
            onChange={this.handleOnInputChange}
            placeholder="SEARCH FOR MIXLOOK PROFILE..."
          ></input>
          <div className="or">
            <h1>OR</h1>
          </div>
          <button className="mixerlogin">Login with Mixer</button>
        </div>
        <div className="section-profiles">
          <div className="container">
            <div className="row margin">
              <div>{this.renderSearchResults()}</div>
              <div className="container"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
