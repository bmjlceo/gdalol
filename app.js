const express = require('express');
const InitCore = require('./core/init');
const app = express();

InitCore.init(app);

const port = process.env.PORT || 3030;
const server = app.listen(port, () => {
	console.log('\n服务运行成功');
	console.log('server is running at http://localhost:' + port);
});
