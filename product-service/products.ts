import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { invoke, addProduct } from './pg-client';

export const getProducts: APIGatewayProxyHandler = async (event) => {
  console.log("getProducts", JSON.stringify(event.body));
  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: '',
  };

  try {
    const products = await invoke();   
    response.body = JSON.stringify(products, null, 2);
  } catch (error) {
    response.statusCode = 500;
    response.body = JSON.stringify(error, null, 2);
  }

  return response;
};

export const createProduct: APIGatewayProxyHandler = async (event) => {
  console.log("createProduct", JSON.stringify(event.body));
  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: '',
  };

  const { title, description, price, count } = JSON.parse(event.body);

  try {
    const products = await addProduct(title, description, price, count);
    response.body = JSON.stringify(products, null, 2);
  } catch (error) {
    response.statusCode = 500;
    response.body = JSON.stringify(error, null, 2);
  }

  console.log(title, description, price, count);

  return response;
};
