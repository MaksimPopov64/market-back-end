import * as AWS from 'aws-sdk';
import { APIGatewayProxyHandler } from "aws-lambda";
const BUCKET = 'photos-bucket-aws-in-cloud-rs-school';

export const importProductsFile:APIGatewayProxyHandler = async(event) => {
  
  const s3 = new AWS.S3({ region: 'us-east-1' });
  let status = 200;
  let urlString ='';
  const {queryStringParameters: {name} = {}} = event;
  const catalogPath = `uploaded/${name}`;
  
  const params = {
    Bucket: BUCKET,
    Key: catalogPath,
    Expires: 60,
    ContentType: 'text/csv',   
  };

  try {
    urlString = await s3.getSignedUrl('putObject', params);    
  } catch (err) {
      console.error(err);
      status = 500;
  }

  const response = {
    statusCode: status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(urlString),
  };
  return response;
}