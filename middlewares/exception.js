// express的中间件执行顺序为链式型
// koa的中间件执行顺序为洋葱模型
const path = require('path');
const { HttpException } = require('../core/http-exception');

/**
 * 对于找不到的瓦片，直接返回空字符串
 * @param {any} req 请求
 * @param {any} res 相应
 * @param {any} next    执行下一个中间件
 * @returns {void}
 */
const CustomNotFound = async (req, res) => {
	// 如果静态资源目录有相应的话就不会来到这一步
	if (path.extname(req.url) === '.png' || req.url === '/favicon.ico') {
		res.send('');
	} else {
		res.redirect('/404');
	}
};

/**
 * 使用类的方式抛出错误
 * @param {any} err
 * @param {any} req
 * @param {any} res
 * @param {any} next
 * @returns {any}
 */
const CatchHttpException = (error, req, res, next) => {
	// 判断环境 输出错误消息在控制台 编写错误日志

	debugger;
	const isDev = process.env.NODE_ENV === 'development';
	const isHttpException = error instanceof HttpException;

	// 如果是开发环境
	if (isDev && !isHttpException) {
		throw error;
	}

	// 生产环境  错误日志输出
	let response = null,
		status = null;
	if (isHttpException) {
		response = {
			msg: error.msg,
			code: error.code,
			requestUrl: `${req.method} ${req.path}`,
		};
		status = error.status;
		res.status(status).send(response);
	} else {
		if (/^\/api/.test(req.url)) {
			response = {
				msg: 'we made a mistake ^_^',
				code: global.code.CUSTOM_CODE.WE_MAKE_MISTAKE,
				requestUrl: `${req.method} ${req.path}`,
			};
			status = 500;
			res.status(status).send(response);
			return;
		}
		res.render('404');
	}
};

module.exports = {
	CatchHttpException,
	CustomNotFound,
};
