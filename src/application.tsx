import classnames from "classnames";
import { observer } from "mobx-react";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { unmountComponentAtNode } from "react-dom";
import "./application.scss";
import { Chart } from "./components/chart/chart";
import { AppStore, store } from "./store/app.store";

export interface IApplicationProps {
  /** Sets the initial state the application will be in */
  initialState: Partial<AppStore>;
}

/**
 * Properties to configure the top level component for the React pipeline
 */
interface IAppProps {
  /** Provides a custom class name to the container of this component */
  className?: string;
  /** Props to apply directly to the container div of this component */
  containerProps?: React.HTMLProps<HTMLDivElement>;
}

/**
 * This is the entry component for the react framework
 */
@observer
class App extends React.Component<IAppProps> {
  state = {};

  render() {
    const { className, containerProps } = this.props;

    return (
      <div className={classnames("App", className)} {...containerProps}>
        <Chart />
      </div>
    );
  }
}

/**
 * This is a helper method to generate a font face string to embed the base64 encoded fonts that get bundled into
 * the application.
 *
 * @param fontName
 * @param weight
 * @param source
 */
function fontString(fontName: string, weight: number, source: string) {
  return `
    @font-face {
      font-family: '${fontName}';
      src: url(${source}) format('woff2');
      font-weight: ${weight};
      font-style: normal;
    }
  `;
}

/**
 * This method ensures the fonts required for this project are embedded into the page
 */
function ensureEmbeddedFonts() {
  const linkId = "__diamondchart__font__embed__id__";
  if (document.getElementById(linkId)) return;

  const linkElement = document.createElement("style");

  // TODO: Currently no custom fonts needed
  // const font = `
  //     ${fontString(
  //       "Blender Pro",
  //       700,
  //       require("../font/blenderpro-bold-webfont.woff2")
  //     )}
  //     ${fontString(
  //       "Blender Pro",
  //       400,
  //       require("../font/blenderpro-book-webfont.woff2")
  //     )}
  //     ${fontString(
  //       "Blender Pro",
  //       800,
  //       require("../font/blenderpro-heavy-webfont.woff2")
  //     )}
  //     ${fontString(
  //       "Blender Pro",
  //       500,
  //       require("../font/blenderpro-medium-webfont.woff2")
  //     )}
  //     ${fontString(
  //       "Blender Pro",
  //       200,
  //       require("../font/blenderpro-thin-webfont.woff2")
  //     )}
  //   `;
  const font = "";

  linkElement.setAttribute("rel", "stylesheet");
  linkElement.setAttribute("type", "text/css");
  linkElement.innerHTML = font;
  linkElement.setAttribute("id", linkId);

  const head = document.getElementsByTagName("head")[0];
  if (head) head.appendChild(linkElement);
}

/**
 * This is the simple Object for instantiating and working with a new diamond chart instance.
 */
export class Application {
  /**
   * This is a state controller for the application. Simply changing values within this object should cause the
   * necessary  updates to take place unless the store says otherwise.
   */
  state = store;

  constructor(options: IApplicationProps) {
    this.applyOptionsToStore(options);
    this.init();
  }

  /**
   * Transfers any initialization options over to the application's store.
   */
  applyOptionsToStore(options: IApplicationProps) {
    Object.assign(store, options.initialState);
  }

  /**
   * Performs all of the initialization operations to begin the chart rendering
   */
  private async init() {
    // Make sure the fonts are embedded into the page
    ensureEmbeddedFonts();
    // Start up the React pipeline
    ReactDOM.render(<App></App>, store.container);
  }

  /**
   * Frees all resources associated with the chart
   */
  destroy() {
    unmountComponentAtNode(store.container);
  }

  /**
   * Force trigger a resize event for the chart
   */
  resize() {
    const { width, height } = store.container.getBoundingClientRect();
    store.screenSize = [width, height];
  }
}
