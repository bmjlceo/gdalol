const router = require('express').Router();
const { uploadTile: tile, uploadShot: shot } = require('../tool/upload');
const Tile = require('../model/tile');
const { CUSTOM_CODE } = require('../config/code');
const DB = require('../model/db');
const gdal2tiles = require('../tool/gdal2tiles');

router.prefix = '/upload';

router.get('/', async (req, res) => {
	await res.render('upload');
});

router.post('/tile', tile.any(), async (req, res) => {
	const file = req.files[0];
	// let url = `http://${global.config.domain}/upload/tiles/${file.filename}`;
	// urlID: 没有后缀的文件名
	file.urlID = file.filename.slice(0, file.filename.lastIndexOf('.'));
	const tempdata = Tile.transformFile2Data(file);
	const data = await DB.insertOne(tempdata);
	// 制作瓦片
	gdal2tiles(file.filename, file.urlID, data);
	res.send({
		msg: '文件上传成功, 正在制作瓦片',
		// fileUrl: url,
		idName: file.urlID,
		code: CUSTOM_CODE.UPLOAD_SUCESS,
	});
});

router.post('/shot', shot, async (req, res) => {
	const file = req.files[0];
	res.send({
		msg: '上传成功',
		code: 0,
		fileUrl: file.url,
		code: CUSTOM_CODE.UPLOAD_SUCESS,
	});
});

module.exports = router;
