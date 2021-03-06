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
      SQS_URL: `\$\{cf:product-service-dev.SQSUrl\}`,
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
      {
        Effect: 'Allow',
        Action: ['sqs:SendMessage'],
        Resource: [`\$\{cf:product-service-dev.SQSArn\}`], 
      },
    ],
  },

  resources: {
    Resources: {
      ApiGatewayRestApi: {
        Type: 'AWS::ApiGateway::RestApi',
        Properties: {
          Name: '${self:service}-${self:provider.stage}'
        }
      },
      GatewayResponseDefault4XX: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': '\'*\''
          },
          ResponseType: 'DEFAULT_4XX',
          RestApiId: {
            Ref: 'ApiGatewayRestApi'
          }
        }
      }
    }
  },  

  functions: {
    importProductsFile: {
      handler: 'import.importProductsFile',
      events: [
        {
          http: {
            method: 'get',
            path: 'import',
            authorizer: {
              type: 'token',
              name: 'tokenBasicAuthorizer',
              arn: 'arn:aws:lambda:us-east-1:717164120316:function:authorization-service-dev-basic-authorizer:1',
              resultTtlInSeconds: 0,
              identitySource: 'method.request.header.Authorization'
            },
            cors: {
              origins: '*',
              headers: ['Authorization']
            },
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
            bucket: 'photos-bucket-aws-in-cloud-rs-school',
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
