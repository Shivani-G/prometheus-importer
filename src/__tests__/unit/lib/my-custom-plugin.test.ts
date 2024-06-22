import {PrometheusImporter} from '../../../lib/prometheus-importer';

describe('lib/my-custom-plugin: ', () => {
  describe('PrometheusImporter(): ', () => {
    it('has metadata field.', () => {
      const pluginInstance = PrometheusImporter({});

      expect(pluginInstance).toHaveProperty('metadata');
      expect(pluginInstance).toHaveProperty('execute');
      expect(pluginInstance.metadata).toHaveProperty('kind');
      expect(typeof pluginInstance.execute).toBe('function');
    });

    describe('execute(): ', () => {
      it('applies logic on provided inputs array.', async () => {
        const pluginInstance = PrometheusImporter({});
        const inputs = [{}];

        const response = await pluginInstance.execute(inputs, {});
        expect(response).toEqual(inputs);
      });
    });
  });
});
