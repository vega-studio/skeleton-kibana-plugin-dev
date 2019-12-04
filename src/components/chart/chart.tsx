import classnames from "classnames";
import { observer } from "mobx-react";
import * as React from "react";
import { store } from "../../store/app.store";
import "./chart.scss";

// TODO: USE ME OR DELETE ME
const myExampleImage = require("../../assets/logo.png");

export interface IChartProps {
  /** Provides a custom class name to the container of this component */
  className?: string;
  /** Props to apply directly to the container div of this component */
  containerProps?: React.HTMLProps<HTMLDivElement>;
}

@observer
export class Chart extends React.Component<IChartProps> {
  container = React.createRef<HTMLDivElement>();

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  componentDidMount() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);

    if (this.container.current) {
      this.container.current;
    }
  }

  componentDidUpdate() {
    // TODO
  }

  handleResize = () => {
    const { width, height } = store.container.getBoundingClientRect();
    store.screenSize = [width, height];
  };

  render() {
    return (
      <div ref={this.container} style={{ color: "white" }}>
        Skeleton is working
      </div>
    );
  }
}
