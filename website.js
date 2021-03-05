const express = require('express');
const app = new express();

app.get('/ping', async (req, res) => {
	res.send('sent ping');
	console.log('recieved ping');
});

app.listen(3000);
console.log('server listening on port 3000');
