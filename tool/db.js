const fs = require('fs');

/**
 * 保存上传文件的信息到文件中
 * @param {any} data
 * @returns {Promise}
 */
async function save(data) {
	return new Promise((resolve, reject) => {
		fs.appendFile(global.config.dbPath, data, (err) => {
			if (err) {
				reject(err);
			}
			resolve({
				append: true,
				msg: '成功写入文件',
			});
		});
	});
}

/**
 * 读取数据文件， 模仿数据库
 * @returns {Promise}
 */
async function get() {
	return new Promise((resolve, reject) => {
		fs.readFile(global.config.dbPath, (err, data) => {
			if (err) {
				reject(err);
			}
			data = data.toString().split('\n');
			let newdata = [];
			data.forEach((item) => {
				if (item.length > 0) {
					newdata.push(JSON.parse(item));
				}
			});
			resolve(newdata);
		});
	});
}

module.exports = {
	save,
	get,
};
