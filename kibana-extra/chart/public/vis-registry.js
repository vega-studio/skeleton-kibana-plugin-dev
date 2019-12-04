import { VisController } from './vis-controller';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import { Status } from 'ui/vis/update_status';

/**
 * This is the kibana visualization Registration object that configures and tells kibana what to expect for the
 * visualization.
 */
const DiamondChartVis = (Private) => {
  const VisFactory = Private(VisFactoryProvider);

  return  VisFactory.createBaseVisualization({
    name: 'diamond_chart',
    title: 'Diamond Chart',
    icon: 'grid',
    description: 'A Diamond Shaped visualization showing a status between multiple entities and services.',
    visualization: VisController,
    visConfig: {},
    editorConfig: {},
    requiresUpdateStatus: [
      // Check for changes in the aggregation configuration for the visualization
      Status.AGGS,
      // Check for changes in the actual data returned from Elasticsearch
      Status.DATA,
      // Check for changes in the parameters (configuration) for the visualization
      Status.PARAMS,
      // Check if the visualization has changes its size
      Status.RESIZE,
      // Check if the time range for the visualization has been changed
      Status.TIME,
      // Check if the UI state of the visualization has been changed
      Status.UI_STATE
    ]
  });
}

VisTypesRegistryProvider.register(DiamondChartVis);
