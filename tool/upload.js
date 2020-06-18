const path = require('path');
const multer = require('multer');
const Shot = require('../model/shot');

//设置瓦片文件上传的路径和文件命名
const TileStorage = multer.diskStorage({
	destination(req, file, cb) {
		//文件上传成功后会放入public下的upload文件夹
		cb(null, path.join(__dirname, '../static/upload/tiles'));
	},
	filename(req, file, cb) {
		// 设置文件的名字为其原本的名字，也可以添加其他字符，来区别相同文件，例如file.originalname+new Date().getTime();利用时间来区分
		// 去除中文
		const filename = file.originalname.replace(/[^A-Za-z0-9_.]+/, '');
		cb(
			null,
			path.parse(filename).name + new Date().getTime() + path.extname(filename)
		);
	},
});

const uploadTile = multer({
	storage: TileStorage,
});

const uploadShot = async (req, res, next) => {
	const { data, tile } = req.body;
	let result = await Shot.saveFile(data, tile, req.header);
	// result.url = `http://${global.config.domain}/upload/shots/${tile}/${result.filename}`;
	result.url = `/upload/shots/${tile}/${result.filename}`
	req.files = [result];
	await next();
};

module.exports = { uploadTile, uploadShot };
