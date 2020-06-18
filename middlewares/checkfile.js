const DB = require('../model/db');

/**
 * 验证数据是否存在
 * @param {any} req
 * @param {any} res
 * @param {any} next
 * @returns {any}
 */
async function isExist(req, res, next) {
	const { tileId } = req.params;
	let tile = await DB.findById(tileId);
	if (tile) {
		return next();
	}
	res.redirect('/404');
}

module.exports = {
	isExist,
};
