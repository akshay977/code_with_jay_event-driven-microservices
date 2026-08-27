const express = require('express');
const { RPCObserver, RPCRequest } = require('./rpc');
const PORT = 9000;

const app = express();
app.use(express.json());

const fakeCustomerResponse = {
	_id: '1sdche56',
	name: 'Mike',
	country: 'Poland'
};

RPCObserver('CUSTOMER_RPC', fakeCustomerResponse);

app.get('/wishlist', async (req, res) => {
	const requestPayload = {
		productId: '123',
		customerId: '1sdche56'
	};
	try {
		const resp = await RPCRequest('PRODUCT_RPC', requestPayload);
		console.log(resp);
		return res.status(200).json(resp);
	} catch (err) {
		console.log(err);
		return res.status(500).json(err);
	}
});

app.get('/', (req, res) => {
	return res.json('Customer service');
});

app.listen(PORT, () => {
	console.log(`Customer is running on ${PORT}`);
	console.clear();
});