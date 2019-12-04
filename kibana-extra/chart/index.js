export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch', 'canvas'],
    name: 'chart',
    uiExports: {
      visTypes: [
        'plugins/chart/vis-registry'
      ],
      canvas: [
        'plugins/chart/index'
      ]
    }
  });
}
