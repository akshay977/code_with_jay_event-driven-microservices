const express = require('express');
const { RPCObserver, RPCRequest } = require('./rpc');
const PORT = 8000;

const app = express();
app.use(express.json());

const fakeProductResponse = {
	_id: '789jhkh',
	name: 'iPhone',
	price: 600
};

RPCObserver('PRODUCT_RPC', fakeProductResponse);

app.get('/customer', async (req, res) => {
	const requestPayload = {
		customerId: '1sdche56'
	};
	try {
		const resp = await RPCRequest('CUSTOMER_RPC', requestPayload);
		console.log(resp);
		return res.status(200).json(resp);
	} catch (err) {
		console.log(err);
		return res.status(500).json(err);
	}
});

app.get('/', (req, res) => {
	return res.json('Product service');
});

app.listen(PORT, () => {
	console.log(`Product is running on ${PORT}`);
	console.clear();
});