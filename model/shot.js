const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class Shot {
	/**
	 * 将base64转换为文件并保存
	 * @param {any} base64
	 * @param {any} tile
	 * @returns {any}
	 */
	static saveFile(base64, tile) {
		return new Promise((resolve, reject) => {
			const filename = 'shot' + new Date().getTime() + '.png';
			const dirPath = path.resolve(__dirname, `../static/upload/shots/${tile}`);
			if (!fs.existsSync(dirPath)) {
				fs.mkdirSync(dirPath);
			}
			const savePath = path.resolve(
				__dirname,
				`../static/upload/shots/${tile}`,
				filename
			);
			const dataBuffer = Buffer.from(base64, 'base64'); //把base64码转成buffer对象，
			fs.writeFile(savePath, dataBuffer, err => {
				if (err) {
					return reject(err);
				}
				resolve({
					filename,
					savePath,
				});
			});
		});
	}

	/**
	 * 获取对应的截图列表信息
	 * @param {any} tileId 瓦片标识
	 * @returns {any}
	 */
	static getShots(tileId) {
		const relativePath = `../static/upload/shots/${tileId}`;
		const dirPath = path.resolve(__dirname, relativePath);
		return new Promise((resolve, reject) => {
			const isExist = fs.existsSync(dirPath);
			if (!isExist) {
				// 文件不存在
				return resolve([]);
			}
			fs.readdir(dirPath, (err, files) => {
				if (err) {
					return reject(err);
				}
				resolve(files);
			});
		});
	}

	/**
	 * 删除对应的截图信息
	 * @param {string} tileId
	 * @returns {any}
	 */
	static remove(tileId) {
		const dirPath = path.resolve(__dirname, `../static/upload/shots/${tileId}`);
		const isExist = fs.existsSync(dirPath);
		if (!isExist) {
			// 文件夹不存在
			return Promise.resolve(false);
		}
		const command = global.config.command.rmdir + ' ' + dirPath;
		return new Promise((resolve, reject) => {
			exec(command, function (err, out) {
				if (err) {
					reject(err);
					return;
				}
				resolve(true);
			});
		});
	}
}

module.exports = Shot;
