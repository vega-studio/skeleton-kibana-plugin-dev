import * as datGUI from "dat.gui";
import { Application, mobx } from "../src";
import "./index.html";

/** GUI properties */
const parameters = {
  /** Set up your custom parameters */
};

let chart: Application;

function buildGUI() {
  // Build a new GUI
  const gui = new datGUI.GUI({
    autoPlace: true,
    closed: false,
    hideable: true,
    name: "Demo Control"
  });

  // Controller for row count
  // gui.add(parameters, "rows", 0, 25, 1).onChange(async () => {
  //   updateData();
  // });

  // // Controller for col count
  // gui.add(parameters, "columns", 0, 25, 1).onChange(async () => {
  //   updateData();
  // });

  // // Controller for columns of data
  // gui.add(parameters, "dataColumns", 0, 25, 1).onChange(async () => {
  //   updateData();
  // });

  // // Controller for rows of data
  // gui.add(parameters, "dataRows", 0, 25, 1).onChange(async () => {
  //   updateData();
  // });

  // // Controller for label offset
  // gui.add(parameters, "labelOffsetY", 0, 500, 1).onChange(async () => {
  //   chart.state.labelOffset = [
  //     chart.state.labelOffset[0],
  //     parameters.labelOffsetY
  //   ];
  // });
}

function ready(fn: (e?: any) => void) {
  if (document.readyState !== "loading") {
    fn();
  } else if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    (document as any).attachEvent("onreadystatechange", function() {
      if (document.readyState !== "loading") fn();
    });
  }
}

function updateData() {
  mobx.transaction(() => {
    // Put updates to the chart state here
    // Transactions let you update multiple things on the state with only a single re-render
  });
}

function start() {
  const container = document.getElementById("container");
  if (!container) return;

  chart = new Application({
    initialState: {
      container
    }
  });

  updateData();
  buildGUI();
}

ready(start);
