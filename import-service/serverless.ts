import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'import-service',
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 's3:ListBucket',
        Resource: 'arn:aws:s3:::photos-bucket-aws-in-cloud-rs-school',
      },
      {
        Effect: 'Allow',
        Action: 's3:*',
        Resource: 'arn:aws:s3:::photos-bucket-aws-in-cloud-rs-school/*',
      },
    ],
  },
  functions: {
    importProductsFile: {
      handler: 'import.importProductsFile',
      events: [
        {
          http: {
            method: 'get',
            path: 'import',
            request: {
              parameters: { querystrings: { name: true } },
            },
          },
        },
      ],
    },
    importFileParser: {
      handler: 'fileParser.importFileParser',
      events: [
        {
          s3: {
            bucket: 'arn:aws:s3:::photos-bucket-aws-in-cloud-rs-school/',
            existing: true,
            event: 's3:ObjectCreated:*',
            rules: [
              {
                prefix: `uploaded/`,
                suffix: '.csv',
              },
            ],
          },
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
