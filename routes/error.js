const router = require('express').Router();
const fs = require('fs');
const { resolve } = require('path');
router.prefix = '/error';

// 发生同步错误
router.get('/sync', (req, res) => {
	throw new Error('Error happen');
});

// 发生异步错误
router.get('/async', (req, res, next) => {
	fs.readFile('/a.js', (err, data) => {
		if (err) {
			next(err);
		}
		res.send(data);
	});
});

// 抛出自定义错误
router.get('/custom', (req, res, next) => {
	throw new global.HttpException.NotFoundException();
});

module.exports = router;
