import { SQSHandler } from 'aws-lambda';
import { SNS } from 'aws-sdk';
import { Client } from 'pg';
import { config, dbOptions } from '../config';
export const catalogBatchProcess: SQSHandler = async (event) => {
  const client = new Client(dbOptions);

  await client.connect();

  const tasks = event.Records.map(async ({ body }) => {
    try {
      const { title, description, price, count } = JSON.parse(body);

      if (!title || !description || price < 0 || count < 0) {
        throw new Error(`Invalid data: ${body}`);
      }

      await client.query('BEGIN');

      const queryResult = await client.query(
        `
        insert into products (title, description, price) values
        ($1, $2, $3) returning *`,
        [title, description, price]
      );
      const product = queryResult.rows[0];

      await client.query(`insert into stocks (product_id, count) values ($1, $2)`, [product.id, count]);

      await client.query('COMMIT');
      console.log(`Product was created with id ${product.id}`);
      return product;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Product creation error: ${error}`);
    } finally {
      await client.end();
    }
  });

  const result = await Promise.all(tasks);
  if (result.length > 0) {
    await sendNotification(result);
  }
};

const sendNotification = async (products) => {
  const sns = new SNS({ region: config.region });

  await sns
    .publish({
      Subject: 'Products created',
      Message: JSON.stringify(products, null, 2),
      TopicArn: process.env.SNS_TOPIC_ARN,
    })
    .promise();

  console.log('Email notification');
};
