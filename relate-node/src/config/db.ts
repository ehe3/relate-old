import { Sequelize } from 'sequelize';

import { DB_NAME, DB_USERNAME, DB_PASSWORD, DB_ENDPOINT, DB_PORT } from './env';

const db = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_ENDPOINT,
  port: parseInt(DB_PORT, 10),
  dialect: 'mysql',
  dialectOptions: { decimalNumbers: true },
  pool: { max: 20, min: 0, idle: 10000 },
  logging: false,
});

export default db;
