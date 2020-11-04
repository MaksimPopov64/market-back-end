import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import * as data from './productList.json';

export const getProducts: APIGatewayProxyHandler = async () => {
  return {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    statusCode: 200,
    body: JSON.stringify(data, null, 2),
  };
}
