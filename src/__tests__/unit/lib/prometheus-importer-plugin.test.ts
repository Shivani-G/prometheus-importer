import {PrometheusImporter} from '../../../lib/prometheus-importer';
import {AuthenticationProvider} from '../../../lib/prometheus-importer/helpers/auth-provider';
import {ParseAndEnrichDataTransformer} from '../../../lib/prometheus-importer/helpers/data-transformer';

const defaultRangeQueryRawResponse: Record<string, any> = {
  status: 'success',
  isPartial: false,
  data: {
    resultType: 'matrix',
    result: [
      {
        metric: {
          cluster: 'cluster1',
          container: 'container1',
        },
        values: [
          [1715933559.727, '0'],
          [1715937159.727, '0'],
        ],
      },
      {
        metric: {
          cluster: 'cluster2',
          container: 'container2',
        },
        values: [
          [1715933559.727, '0'],
          [1715937159.727, '0'],
        ],
      },
      {
        metric: {
          cluster: 'cluster3',
          container: 'container1',
        },
        values: [
          [1715933559.727, '9'],
          [1715937159.727, '10'],
        ],
      },
    ],
  },
  stats: {
    seriesFetched: '1',
    executionTimeMsec: 10,
  },
};
const expectedOutput = [
  {
    'cloud/instance-type': 'default_instance_type',
    'cloud/vendor': 'aws',
    container: 'container1',
    'cpu/utilization': 0,
    duration: 3600,
    timestamp: 1715933559.727,
  },
  {
    'cloud/instance-type': 'default_instance_type',
    'cloud/vendor': 'aws',
    container: 'container1',
    'cpu/utilization': 0,
    duration: 3600,
    timestamp: 1715937159.727,
  },
  {
    'cloud/instance-type': 'default_instance_type',
    'cloud/vendor': 'aws',
    container: 'container2',
    'cpu/utilization': 0,
    duration: 3600,
    timestamp: 1715933559.727,
  },
  {
    'cloud/instance-type': 'default_instance_type',
    'cloud/vendor': 'aws',
    container: 'container2',
    'cpu/utilization': 0,
    duration: 3600,
    timestamp: 1715937159.727,
  },
  {
    'cloud/instance-type': 'default_instance_type',
    'cloud/vendor': 'aws',
    container: 'container1',
    'cpu/utilization': 9,
    duration: 3600,
    timestamp: 1715933559.727,
  },
  {
    'cloud/instance-type': 'default_instance_type',
    'cloud/vendor': 'aws',
    container: 'container1',
    'cpu/utilization': 10,
    duration: 3600,
    timestamp: 1715937159.727,
  },
];

jest.mock('node-fetch-commonjs', () => ({
  __esModule: true, // this property tells Jest it's an ES module
  default: jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(defaultRangeQueryRawResponse),
    })
  ),
}));

describe('lib/prometheus-importer: ', () => {
  describe('PrometheusImporter(): ', () => {
    it('has metadata field.', () => {
      const pluginInstance = PrometheusImporter({});

      expect(pluginInstance).toHaveProperty('metadata');
      expect(pluginInstance).toHaveProperty('execute');
      expect(pluginInstance.metadata).toHaveProperty('kind');
      expect(typeof pluginInstance.execute).toBe('function');
    });

    describe('execute(): ', () => {
      it('applies no logic when inputs array provided.', async () => {
        const pluginInstance = PrometheusImporter({});
        const inputs = [{}];

        const response = await pluginInstance.execute(inputs, {});
        expect(response).toEqual(inputs);
      });
    });

    describe('execute(): ', () => {
      it('applies logic when no inputs array provided.', async () => {
        process.env.HOST = 'https://mocked_url';
        const pluginInstance = PrometheusImporter({
          step: '1h',
          start: '-2d',
          end: '-1d',
          query: 'cluster1|cluster2|cluster3',
          metricLabels: ['container'],
          metricName: 'cpu/utilization',
          defaultLabels: {
            'cloud/instance-type': 'default_instance_type',
            duration: 3600,
            'cloud/vendor': 'aws',
          },
        });

        const response = await pluginInstance.execute([]);
        expect(response).toEqual(expectedOutput);
      });
    });
  });
});

describe('helpers/auth-provider: ', () => {
  describe('AuthProvider(): ', () => {
    it('returns basic-auth headers when basic-auth creds are provided', () => {
      const authCredentials = {
        USERNAME: 'admin',
        PASSWORD: 'default_password',
      };
      const expectedAuthHeader = {
        Authorization: 'Basic YWRtaW46ZGVmYXVsdF9wYXNzd29yZA==',
      };
      const authProviderInstance = AuthenticationProvider();
      const response = authProviderInstance.getAuthHeaders(authCredentials);
      expect(response).toEqual(expectedAuthHeader);
    });

    it('returns bearer-token headers when bearer token creds are provided', () => {
      const authCredentials = {
        BEARER_TOKEN: '77f4871b-7cfe-42bc-bc65-06ec4e6d8ce2',
      };
      const expectedAuthHeader = {
        Authorization: 'Bearer 77f4871b-7cfe-42bc-bc65-06ec4e6d8ce2',
      };
      const authProviderInstance = AuthenticationProvider();
      const response = authProviderInstance.getAuthHeaders(authCredentials);
      expect(response).toEqual(expectedAuthHeader);
    });

    it('returns empty headers when no creds are provided', () => {
      const authCredentials = {};
      const expectedAuthHeader = {};
      const authProviderInstance = AuthenticationProvider();
      const response = authProviderInstance.getAuthHeaders(authCredentials);
      expect(response).toEqual(expectedAuthHeader);
    });

    it('returns empty headers when incorrect creds are provided', () => {
      const authCredentials = {
        USERNAME: 'admin',
      };
      const expectedAuthHeader = {};
      const authProviderInstance = AuthenticationProvider();
      const response = authProviderInstance.getAuthHeaders(authCredentials);
      expect(response).toEqual(expectedAuthHeader);
    });
  });
});

describe('helpers/data-transformer: ', () => {
  describe('ParseAndEnrichDataTransformer(): ', () => {
    it('parses raw api response and transforms to user defined format', async () => {
      const dataTransformer = ParseAndEnrichDataTransformer();
      const metricLabels = ['container'];
      const defaultLabels = {
        'cloud/instance-type': 'default_instance_type',
        duration: 3600,
        'cloud/vendor': 'aws',
      };

      const response = await dataTransformer.parseMetrics(
        defaultRangeQueryRawResponse,
        metricLabels,
        'cpu/utilization',
        defaultLabels
      );
      expect(response).toEqual(expectedOutput);
    });
  });
});
