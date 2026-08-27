const amqplib = require('amqplib');
const { v4: uuid4 } = require('uuid');

let amqplibConnection = null;

const getChannel = async () => {
  if (!amqplibConnection) {
    amqplibConnection = await amqplib.connect('amqp://localhost');
  }
  const newChannel = await amqplibConnection.createChannel();
  return newChannel;
};

const expensiveDBOperation = (payload, fakeResponse) => {
  console.log(payload);
  console.log(fakeResponse);

  return new Promise((res, rej) => {
    setTimeout(() => res(fakeResponse), 3000);
  });
}

const RPCObserver = async (RPC_QUEUE_NAME, fakeResponse) => {
  const channel = await getChannel();

  await channel.assertQueue(RPC_QUEUE_NAME, { durable: true, exclusive: false });
  channel.prefetch(1);

  channel.consume(
    RPC_QUEUE_NAME,
    async (msg) => {
      if (!msg || !msg.content) return;

      const payload = JSON.parse(msg.content.toString());
      const response = await expensiveDBOperation(payload, fakeResponse);

      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(response)),
        { correlationId: msg.properties.correlationId }
      );

      channel.ack(msg);
    },
    { noAck: false }
  );
};

const requestData = async (RPC_QUEUE_NAME, requestPayload, uuid) => {
  const channel = await getChannel();
  await channel.assertQueue(RPC_QUEUE_NAME, { durable: true, exclusive: false });

  const q = await channel.assertQueue("", {
	  exclusive: true,
	  autoDelete: true,
	  durable: false,
  });

  channel.sendToQueue(
    RPC_QUEUE_NAME,
    Buffer.from(JSON.stringify(requestPayload)),
    {
      replyTo: q.queue,
      correlationId: uuid,
    }
  );

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('RPC timeout'));
    }, 5000);

    channel.consume(
      q.queue,
      (msg) => {
        if (!msg) return;
        if (msg.properties.correlationId === uuid) {
          clearTimeout(timeout);
          channel.cancel(q.queue); // optional
          resolve(JSON.parse(msg.content.toString()));
        }
        // ignore non-matching correlationId
      },
      { noAck: true }
    );
  });
};

const RPCRequest = async (RPC_QUEUE_NAME, requestPayload) => {
  const uuid = uuid4();
  return await requestData(RPC_QUEUE_NAME, requestPayload, uuid);
};

module.exports = {
  getChannel,
  RPCRequest,
  RPCObserver,
};