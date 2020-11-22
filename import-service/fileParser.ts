import { S3, SQS } from 'aws-sdk';
import * as csv from 'csv-parser';
import { Transform } from 'stream';
import { config  } from '../config';
const BUCKET = 'photos-bucket-aws-in-cloud-rs-school';

class SendToSQS extends Transform {
  constructor( private sqs:SQS) {
    super({objectMode: true});
  }

  _transform(record, _enc, callback) {
    this.sqs.sendMessage({
        QueueUrl: process.env.SQS_URL,
        MessageBody: JSON.stringify(record),
    }, (error, result) => {
        if (error) {
          console.error(error);
        }
        console.log(result);
    })
    callback(null, record);
  }
}

export const importFileParser = (event) => {
  console.log('importFileParser Lambda started execution');
  
  const sqs = new SQS({ region: config.region });

  const s3 = new S3({ region: config.region });

  console.log('initialize importFileParser handler');

  const toSqsStream = new  SendToSQS(sqs);

  event.Records.forEach((record) => {
    const objectKey = record.s3.object.key;
    const s3Stream = s3
      .getObject({
        Bucket: BUCKET,
        Key: objectKey,
      })
      .createReadStream();

    s3Stream
      .pipe(csv())
      .on('data', (data) => console.log(data))
      .pipe(csv())   
      .pipe(toSqsStream)
      .on('end', async () => {
        const newObjectKey = objectKey.replace('uploaded', 'parsed');
        await s3
          .copyObject({
            Bucket: BUCKET,
            CopySource: `${BUCKET}/${objectKey}`,
            Key: newObjectKey,
          })
          .promise();

        await s3
          .deleteObject({
            Bucket: BUCKET,
            Key: objectKey,
          })
          .promise();
        
      });
  });
  return {
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },

    statusCode: 202,
  };
};
