const path = require('path');
const fs = require('fs');

/**
 * 读取文件中的bounding文件属性
 * @param {buffer} data 流
 * @returns {any}
 */
function readBounding(data) {
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
async function getBounding(name) {
	const FilePath = path.resolve(
		__dirname,
		`../static/tilesResult/${name}/tilemapresource.xml`
	);
	return new Promise((resolve, reject) => {
		fs.readFile(FilePath, (err, data) => {
			if (err) {
				reject(err);
			}
			const Bound = readBounding(data);
			resolve(Bound);
		});
	});
}

/**
 * 修改数据的瓦片状态值
 * @param {string} data	追踪数据，类似于数据的id
 * @returns {Promise}
 */
function WriteSuccess(data) {
	const newData = {
		...data,
		tile_status: global.config.TileStatus.SUCCESS,
	};
	return new Promise((resolve, reject) => {
		fs.readFile(global.config.dbPath, (err, result) => {
			if (err) {
				reject(err);
			}
			data = result
				.toString()
				.replace(JSON.stringify(data), JSON.stringify(newData));
			fs.writeFile(global.config.dbPath, data, (err) => {
				if (err) {
					reject(err);
				}
				resolve(true);
			});
		});
	});
}

module.exports = {
	getBounding,
	WriteSuccess,
};
