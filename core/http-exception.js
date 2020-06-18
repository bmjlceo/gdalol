const { STATUS_CODES } = require('http');

class HttpException extends Error {
	/**
	 * 错误基类
	 * @param {number} code    自定义错误码
	 * @param {string} msg     错误消息
	 * @param {number} status  错误状态码
	 * @returns {any}
	 */
	constructor(
		code = global.code.CUSTOM_CODE.COMMON_ERROR,
		status = 500,
		msg = STATUS_CODES[status]
	) {
		super();
		this.code = code;
		this.msg = msg;
		this.status = status;
	}
}

class NotFoundException extends HttpException {
	constructor(
		code = global.code.CUSTOM_CODE.RESOURCE_NOT_FOUND,
		status = 404,
		msg = STATUS_CODES[status]
	) {
		super(code, status, msg);
	}
}

module.exports = {
	HttpException,
	NotFoundException,
};
