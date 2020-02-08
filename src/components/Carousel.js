import React from "react";
import axios from "axios";
import CarouselItem from "@brainhubeu/react-carousel";
import "@brainhubeu/react-carousel/lib/style.css";
import Tooltip from "rc-tooltip";
import "rc-tooltip/assets/bootstrap.css";

export default class Carousel extends React.Component {
  state = {
    carousel: []
  };

  loadData() {
    axios
      .get(
        "https://mixer.com/api/v1/channels?limit=5&page=0&order=online:desc,featured:true,viewersCurrent:desc,token:desc&noCount=1&scope=names"
      )
      .then(res => {
        this.setState({
          carousel: res.data
        });
        console.log(res.data);
      });
  }

  componentDidMount() {
    demoAsyncCall().then(() => this.setState({ loading: false }));
    this.loadData();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    let imgNumber = 0;

    let imgCarousel = "imgCarousel";

    return (
      <div className="container">
        <CarouselItem
          slidesPerPage={5}
          animationSpeed={1000}
          stopAutoPlayOnHover
          centered
          infinite
          autoPlay={2000}
        >
          {this.state.carousel.map(c => (
            <div key={c.id}>
              <a href={c.token}>
                <Tooltip placement="top" overlay={c.token}>
                  <img
                    className={imgCarousel + imgNumber++}
                    src={c.user.avatarUrl}
                  />
                </Tooltip>
              </a>
            </div>
          ))}
        </CarouselItem>
      </div>
    );
  }
}

function demoAsyncCall() {
  return new Promise(resolve => setTimeout(() => resolve(), 1000));
}
