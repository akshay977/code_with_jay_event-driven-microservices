const dotEnv = require("dotenv");

if (process.env.NODE_ENV !== "prod") {
  const configFile = `./.env.${process.env.NODE_ENV}`;
  dotEnv.config({ path: configFile });
} else {
  dotEnv.config();
}

module.exports = {
  PORT: Number(process.env.PORT) || 8080,
  DB_URL: process.env.MONGODB_URI,
  APP_SECRET: process.env.APP_SECRET,
  MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL,
  EXCHANGE_NAME: process.env.EXCHANGE_NAME,
  CUSTOMER_BINDING_KEY: 'CUSTOMER_SERVICE',
  SHOPPING_BINDING_KEY: 'SHOPPING_SERVICE',
  QUEUE_NAME: 'SHOPPING_QUEUE' // Data will be sent to customer queue
};
