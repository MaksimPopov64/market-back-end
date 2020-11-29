import * as AWS from 'aws-sdk';
import { config  } from '../config';

const BUCKET = 'photos-bucket-aws-in-cloud-rs-school';
export const getProductsLinks = async() => {
  const s3 = new AWS.S3({ region: config.region });
  let status = 200;
  let thumbnails = [];
  const params = {
    Bucket: BUCKET,
    Prefix: 'uploaded/',
  };

  try {
    const s3Response = await s3.listObjectsV2(params).promise();
    thumbnails = s3Response.Contents;
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
    body: JSON.stringify(thumbnails.filter((thumbnail:any) => thumbnail.Size)
                                   .map(thumbnail => `https://${BUCKET}.s3.amazonaws.com/${thumbnail.Key}`)
    )
  };
  return response;
}