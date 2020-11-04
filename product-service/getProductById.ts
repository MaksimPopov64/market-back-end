import { APIGatewayProxyHandler } from 'aws-lambda';
import * as data from './productList.json';
import 'source-map-support/register';

export const productById: APIGatewayProxyHandler = async (event, _context) => {
  const { id } = event.pathParameters;
  const item = data.find((item: any) => item.id === id );
  return {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    statusCode: 200,
    body: JSON.stringify({     
      item,      
    }, null, 2),
  };
}
