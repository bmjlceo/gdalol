const router = require('express').Router();
const Tile = require('../model/tile');
const DB = require('../model/db');
const Shot = require('../model/shot');
const { isExist } = require('../middlewares/checkfile');

router.prefix = '/';

router.get('/', async (req, res, next) => {
	const { isRedirect } = req.cookies;
	let deli, message, tid;
	if (isRedirect) {
		deli = req.query.del || null;
		tid = req.query.tid || null;
		deli = eval(deli);
		message =
			deli !== undefined && deli === true
				? `切片${tid}删除成功`
				: `切片${tid}删除失败`;
		res.clearCookie('isRedirect');
	}
	let data = await DB.getAll();
	await res.render('index', {
		tiles: data,
		deli,
		message,
	});
});

router.get('/tilesResult/:name', async (req, res, next) => {
	const { name } = req.params;
	const url = `http://${global.config.domain}/tilesResult/${name}/`;
	let bound = await Tile.getBounding(name);
	let captureArr = await Shot.getShots(name);
	captureArr = captureArr.map(capture => {
		// return `http://${global.config.domain}/upload/shots/${name}/${capture}`;
		return `/upload/shots/${name}/${capture}`;
	});
	if (!(bound && captureArr)) {
		next();
		return;
	}
	await res.render('openlayers', {
		title: name,
		tileInfo: bound,
		url,
		captureArr,
	});
});

router.get('/remove/:tileId', isExist, async (req, res, next) => {
	const { tileId } = req.params;
	// 删除文件属于io操作，异步比多线程快
	let delStatus = null;
	delStatus = await Tile.remove(tileId);
	res.cookie('isRedirect', '1');
	res.redirect(`/?del=${delStatus}&tid=${tileId}`);
});

router.get('/404', async (req, res, next) => {
	res.render('404');
});

module.exports = router;
