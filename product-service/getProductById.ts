import { APIGatewayProxyHandler } from 'aws-lambda';
import { getProductRow } from './pg-client';
import 'source-map-support/register';

export const productById: APIGatewayProxyHandler = async (event, _context) => {
  const { id } = event.pathParameters;
  const item = await getProductRow(id);
  const product = item[0];
  return {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    statusCode: 200,
    body: JSON.stringify({     
      product,      
    }, null, 2),
  };
}
