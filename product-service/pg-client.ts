import { Client } from 'pg';

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD } = process.env;

const dbOptions = {
  host: PG_HOST,
  port: PG_PORT,
  database: PG_DATABASE,
  user: PG_USERNAME,
  password: PG_PASSWORD,
  ssl: {
    rejectUnauthorized: false, // to avoid warring in this example
  },
  connectionTimeoutMillis: 5000, // time in millisecond for termination of the database query
};

export const invoke = async () => {
  const client = new Client(dbOptions);
  await client.connect();
  try {
    const { rows: products } = await client.query(`select products.*, stocks.count FROM products LEFT JOIN stocks on products.id = stocks.product_id`);
    return products;   
  } catch (err) {    
    console.error('Error during database request executing:', err);
  } finally {    
    client.end(); 
  }
};

export const addProduct = async (title: string, description: string, price: number, count: number) => {
  const client = new Client(dbOptions);
  await client.connect();
  try {
    await client.query(`insert into products (title, description, price) values ('${title}','${description}',${price})`); 
    await client.query(`insert into stocks (count) values ('${count}')`);       
    const { rows: products } = await client.query(`select products.*, stocks.count FROM products LEFT JOIN stocks on products.id = stocks.product_id`);
    return products;
  } catch (err) {    
    console.error('Error during database request executing:', err);
  } finally {   
    client.end();
  }
};

export const getProductRow = async (id: string) => {
  const client = new Client(dbOptions);
  await client.connect();
  try {     
    const { rows: product } = await client.query(`select products.*, stocks.count FROM products JOIN stocks on products.id = '${id}' and stocks.product_id = '${id}'`);   
    return product;  
  } catch (err) {   
    console.error('Error during database request executing:', err);
  } finally {    
    client.end();
  }
};
