const fs = require('fs');

class DB {
	/**
	 * 根据id查询记录
	 * @param {any} tileId
	 * @returns {any}
	 */
	static findById(tileId) {
		return new Promise((resolve, reject) => {
			fs.readFile(global.config.db.path, (err, data) => {
				data = data.toString();
				if (err) {
					return reject(err);
				}
				data = data.split('\n');
				if (!data) {
					return resolve(false);
				}
				let tile = null;
				data.forEach(item => {
					if (!item.length) {
						item = '{}';
					}
					item = JSON.parse(item);
					if (item.tileId === tileId) {
						tile = item;
					}
				});
				resolve(tile);
			});
		});
	}

	/**
	 * 插入单条数据
	 * @param {any} file
	 * @returns {any}
	 */
	static insertOne(data) {
		// 持久化上传文件的信息
		return new Promise((resolve, reject) => {
			fs.appendFile(global.config.db.path, data, err => {
				if (err) {
					reject(err);
				}
				resolve(data);
			});
		});
	}

	/**
	 * 根据id删除记录
	 * @param {any} tileId
	 * @returns {any}
	 */
	static deleteById(tileId) {
		return new Promise((resolve, reject) => {
			const isExist = fs.existsSync(global.config.db.path);
			if (!isExist) {
				return resolve(false);
			}
			fs.readFile(global.config.db.path, (err, data) => {
				if (err) {
					return reject(err);
				}
				let idx = null;
				data = data.toString().split('\n');
				data.forEach((item, index) => {
					if (item.length > 0) {
						item = JSON.parse(item);
						if (item.tileId === tileId) {
							idx = index;
						}
					}
				});
				idx !== null && data.splice(idx, 1);
				data = data.join('\n');
				fs.writeFile(global.config.db.path, data, err => {
					if (err) {
						return reject(err);
					}
					resolve(true);
				});
			});
		});
	}

	/**
	 * 获取所有数据
	 * @returns {any}
	 */
	static getAll() {
		return new Promise((resolve, reject) => {
			fs.readFile(global.config.db.path, (err, data) => {
				if (err) {
					reject(err);
				}
				data = data.toString().split('\n');
				let newdata = [];
				data.forEach(item => {
					if (item.length > 0) {
						newdata.push(JSON.parse(item));
					}
				});
				resolve(newdata);
			});
		});
	}
}

module.exports = DB;
