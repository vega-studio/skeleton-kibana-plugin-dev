import { DiamondChart, mobx } from './lib';

/**
 * DEMO ONLY
 */
function makeColumn(parameters) {
  const row = [];

  for (let i = 0, iMax = parameters.dataRows; i < iMax; ++i) {
    row.push(makeItem());
  }

  return row;
}

/**
 * DEMO ONLY
 */
function makeItem() {
  return {
    state: Math.floor(Math.random() * 4)
  };
}

/**
 * This is the visualization controller that interfaces with the kibana custom visualization system.
 */
class VisController {
  constructor(el, vis) {
    const domNode = el;
    if (!domNode) return;

    // Generate the chart and have it establish it's rendering context.
    this.chart = new DiamondChart({
      initialState: {
        container: domNode,
        labelOffset: [0, 245],
        diamondPosition: [0, 150],
        cellSize: 20,
        rows: [],
        columns: [],
        data: []
      }
    });

    // DEMO ONLY: Update our data
    setTimeout(() => {
      this.updateData();
    }, 1)

    // Polling to watch for changes in size of the visualization. There is nothing that properly fires resize events
    // for the viz to respond to.
    this.poll = setInterval(() => {
      const box = el.getBoundingClientRect();
      const size = this.chart.state.size;

      if (Math.abs(size[0] - box.width) > 2 || Math.abs(size[1] - box.height) > 2) {
        this.chart.resize();
      }
    }, 100);
  }

  /**
   * Handles status triggers and data updates kibana flows down to this viz
   */
  render(_visData, _status) {
    this.chart.resize();
    updateData();

    return new Promise(resolve => {
      resolve('when done rendering');
    });
  }

  /**
   * Handles when the viz is disposed
   */
  destroy() {
    clearInterval(this.poll);
    this.chart.destroy();
  }

  /**
   * DEMO ONLY:
   * This provides a demo data update for the chart so we can see some visuals
   */
  updateData() {
    const parameters = {
      rows: 17,
      columns: 17,
      dataRows: 17,
      dataColumns: 17,
      labelOffsetY: 130
    };

    mobx.transaction(() => {
      while (this.chart.state.rows.length < parameters.rows) {
        this.chart.state.rows.push({ label: `Row ${this.chart.state.rows.length}` });
      }

      while (this.chart.state.rows.length > parameters.rows) {
        this.chart.state.rows.pop();
      }

      while (this.chart.state.columns.length < parameters.columns) {
        this.chart.state.columns.push({
          label: `Column ${this.chart.state.columns.length}`
        });
      }

      while (this.chart.state.columns.length > parameters.columns) {
        this.chart.state.columns.pop();
      }

      while (this.chart.state.data.length < parameters.dataColumns) {
        this.chart.state.data.push(makeColumn(parameters));
      }

      while (this.chart.state.data.length > parameters.dataColumns) {
        this.chart.state.data.pop();
      }

      for (let i = 0, iMax = this.chart.state.data.length; i < iMax; ++i) {
        const row = this.chart.state.data[i];

        while (row.length < parameters.dataRows) {
          row.push(makeItem());
        }

        while (row.length > parameters.dataRows) {
          row.pop();
        }
      }
    });
  }
}

export { VisController };
