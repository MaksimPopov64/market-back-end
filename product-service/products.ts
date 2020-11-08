import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { invoke, addProduct } from './pg-client';

export const getProducts: APIGatewayProxyHandler = async () => {
  const products = await invoke();
  return {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    statusCode: 200,
    body: JSON.stringify(products, null, 2),
  };
};

export const createProduct: APIGatewayProxyHandler = async (event) => { 
  const { title, description, price, count } = JSON.parse(event.body);
  const products = await addProduct(title, description, price, count); 
  return {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    statusCode: 200,
    body: JSON.stringify(products, null, 2),
  };
}
