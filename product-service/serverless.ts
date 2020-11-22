import type { Serverless } from 'serverless/aws';
import { config } from '../config';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'product-service',
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
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
    region: config.region,
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      PG_HOST: `lesson4-instance.cr99zrmm0khq.${config.region}.rds.amazonaws.com`,
      PG_PORT: '5432',
      PG_DATABASE: 'lesson4',   
     
    }    
  },
  resources: {
    Resources: {
      SQSQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalog-items-queue',
          ReceiveMessageWaitTimeSeconds: 20,
        }
      },
      SNSTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'create-product-topic',
        },
      },
      SNSSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'maximsc1285@gmail.com',
          Protocol: 'email',
          TopicArn: { Ref: 'SNSTopic' },
        }
      }
    },
    Outputs: {
      SQSUrl: {
        Value: { Ref: 'SQSQueue' }
      },
      SQSArn: {
        Value: { 'Fn::GetAtt': ['SQSQueue', 'Arn'] },
      },
    }
  },
  functions: {
    products: {
      handler: 'products.getProducts',
      events: [
        {
          http: {
            method: 'get',
            path: 'products',
            cors: true,
          },
        },
      ],
    },
    productById: {
      handler: 'getProductById.productById',
      events: [
        {
          http: {
            method: 'get',
            path: 'product/{id}',
            cors: true,           
            }                             
        }
      ]
    },
    createProduct: {
      handler: 'products.createProduct',
      events: [
        {
          http: {
            method: 'post',
            path: 'products',
            cors: true,
          },
        },
      ],
    },
    catalogBatchProcess: {
      handler: 'catalogBatchProcess.catalogBatchProcess',
      events: [
        {
          sqs: {
            batchSize: 5,
            arn: { 'Fn::GetAtt': ['SQSQueue', 'Arn'] },
          },
        },
      ],
    }, 
  },
  
};

module.exports = serverlessConfiguration;
