import { S3 } from 'aws-sdk';
import * as csv from 'csv-parser';
const BUCKET = 'photos-bucket-aws-in-cloud-rs-school';

export const importFileParser = (event) => {
  console.log('importFileParser Lambda started execution');

  const s3 = new S3({ region: 'us-east-1' });
  console.log('initialize importFileParser handler');

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

        console.log(`Copied into ${BUCKET}/${newObjectKey}`);
        console.log(`Deleted from ${BUCKET}/uploaded`);
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
