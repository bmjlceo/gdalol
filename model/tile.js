const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const Shot = require('./shot');
const DB = require('./db');
const { deleteFolderRecursive } = require('../tool/utils');

class Tile {
	/**
	 * 读取文件中的bounding文件属性
	 * @param {buffer} data 16进制数据
	 * @returns {any}
	 */
	static readBounding(data) {
		const dataString = data.toString();
		// 层级
		let zoom = dataString.match(/TileSet\s{1}/gi).length - 1;
		// 显示范围
		let BoundingBoxArr = dataString
			.match(/<BoundingBox(\s|\S)*/gi)[0]
			.match(/(minx|miny|maxx|maxy)="\-?\w*\.\w*"/gi);
		let BoundingBox = new Object();
		BoundingBoxArr.forEach((item, index, arr) => {
			let temp = item.split('=');
			temp[1] = temp[1].replace(/"/g, '');
			BoundingBox[temp[0]] = +temp[1];
		});
		BoundingBoxArr = null;
		BoundingBox.zoom = zoom;
		return BoundingBox;
	}

	/**
	 * 获取瓦片信息
	 * @param {string} name 文件夹名字
	 * @returns {Promise}
	 */

	static async getBounding(name) {
		const FilePath = path.resolve(
			__dirname,
			`../static/tilesResult/${name}/tilemapresource.xml`
		);
		return new Promise((resolve, reject) => {
			const isExist = fs.existsSync(FilePath);
			if (!isExist) {
				// 文件路径不存在
				return resolve(false);
			}
			fs.readFile(FilePath, (err, data) => {
				if (err) {
					reject(err);
					return;
				}
				const Bound = Tile.readBounding(data);
				resolve(Bound);
			});
		});
	}

	/**
	 * 修改数据的瓦片状态值
	 * @param {string} data	追踪数据，类似于数据的id
	 * @returns {Promise}
	 */
	static WriteSuccess(data) {
		data = JSON.parse(data);
		const newData = {
			...data,
			tile_status: global.config.TileStatus.SUCCESS,
		};
		return new Promise((resolve, reject) => {
			fs.readFile(global.config.db.path, (err, result) => {
				if (err) {
					reject(err);
				}
				data = result
					.toString()
					.replace(JSON.stringify(data), JSON.stringify(newData));
				fs.writeFile(global.config.db.path, data, err => {
					if (err) {
						reject(err);
					}
					resolve(true);
				});
			});
		});
	}

	/**
	 * 删除瓦片文件夹信息
	 * @returns {any}
	 */
	static removeDir(tileId) {
		const tilesDirPath = path.resolve(
			__dirname,
			`../static/tilesResult/${tileId}`
		);
		const isExist = fs.existsSync(tilesDirPath);
		if (!isExist) {
			// 文件夹不存在
			return Promise.resolve(false);
		}
		const command = global.config.command.rmdir + ' ' + tilesDirPath;

		return new Promise((resolve, reject) => {
			exec(command, function (err, out) {
				if (err) {
					reject(err);
					return;
				}
				setTimeout(() => {
					// 如果速度太快，系统自带锁导致文件不能被访问，所以需要延迟
					deleteFolderRecursive(tilesDirPath);
				}, 5000);
				resolve(true);
			});
		});
	}

	/**
	 * 删除瓦片文件
	 * @returns {any}
	 */
	static removeTileFile(tileId) {
		const tilesPath = path.resolve(__dirname, '../static/upload/tiles');
		return new Promise((resolve, reject) => {
			const isExist = fs.existsSync(tilesPath);
			if (!isExist) {
				// '文件不存在 IO-TYPE:removeTileFile'
				return resolve(false);
			}
			fs.readdir(tilesPath, (err, files) => {
				if (err) {
					return reject(err);
				}
				files.forEach(file => {
					const filePath = path.resolve(tilesPath, file);
					if (file.includes(tileId)) {
						fs.unlink(filePath, err => {
							if (err) {
								return reject(err);
							}
						});
					}
				});
				resolve(true);
			});
		});
	}

	/**
	 * 删除和tile相关的数据
	 * @param {any} tileId
	 * @returns {any}
	 */
	static async remove(tileId) {
		await Promise.all([
			Tile.removeDir(tileId),
			Tile.removeTileFile(tileId),
			DB.deleteById(tileId),
			Shot.remove(tileId),
		]);
		return true;
	}

	/**
	 * 文件信息转换成数据
	 * @param {any} file
	 * @returns {any}
	 */
	static transformFile2Data(fileInfo) {
		let data = {
			filename: fileInfo.originalname,
			url: `/tilesResult/${fileInfo.urlID}`,
			tile_status: global.config.TileStatus.LOADING,
			tileId: fileInfo.urlID,
		};
		const StringData = JSON.stringify(data) + '\n';
		return StringData;
	}
}

module.exports = Tile;
