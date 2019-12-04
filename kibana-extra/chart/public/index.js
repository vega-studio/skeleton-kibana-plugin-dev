/*global kbnInterpreter */
import { DiamondChart, mobx } from './lib';

// Browser functions are Canvas functions which run in the browser, and can be used in
// expressions (such as `random | metric "Random Number"`)
const browserFunctions = [
  () => ({
    name: 'diamondchart',
    help: 'Configure a Diamond Chart',
    aliases: [],
    type: 'render',
    args: {},
    context: {
      types: [],
    },
    fn(context, args) {
      console.log('Diamond Expression!', context, args);
      return {
        type: 'render',
        as: 'diamondchart',
        value: {},
      };
    },
  }),
];

// Elements show up in the Canvas elements menu and can be visually added to a canvas
const elements = [
  () => ({
    name: 'diamondchart',
    displayName: 'Diamond Chart',
    help: 'Diamond comparator chart',
    image: 'https://images.contentstack.io/v3/assets/bltefdd0b53724fa2ce/bltb59c89a07c05b937/5c583a6602ac90e80ba0ab8f/icon-white-circle-elastic-stack.svg',
    expression: `
      filters
      | demodata
      | pointseries color="project" size="max(price)"
      | diamondchart
      | render
    `
  }),
];

const renderers = [
  () => ({
    name: 'diamondchart',
    displayName: 'Diamond Chart',
    help: 'Diamond comparator chart',
    reuseDomNode: false,

    render(domNode, config, handlers) {
      console.log('RENDER DIAMOND', domNode, config, handlers);
      const chart = new Chart({
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

      // Register for the chart getting removed
      handlers.onDestroy(() => {
        console.log('DESTROYED');
        chart.destroy();
      });

      // Register for the chart getting resized
      handlers.onResize(() => {
        const box = domNode.getBoundingClientRect();
        const size = chart.state.size;

        if (Math.abs(size[0] - box.width) > 2 || Math.abs(size[1] - box.height) > 2) {
          chart.resize();
        }
      });

      return handlers.done();
    }
  })
]

// Register our elements and browserFunctions with the Canvas interpreter.
kbnInterpreter.register({
  elements,
  renderers,
  browserFunctions,
});

