const { spawn } = require('child_process');
const { resolve } = require('path');
const Tile = require('../model/tile');

// --process 设置进程数量，默认为单进程

let shell = {
	file: 'gdal2tiles.py',
	option: ['--profile=raster', '--webviewer=none', '--process=4'],
};

/**
 * 通过cmd调用gdal2tiles.py制作瓦片
 * @param {string} entry_file	瓦片源文件名
 * @param {string} output_name	输出瓦片文件夹名字
 * @param {string} data	用于追踪数据
 * @returns {any}
 */
function gdal2tiles(entry_file, output_name, data) {
	const entry = resolve(__dirname, `../static/upload/tiles/${entry_file}`);
	const output = resolve(__dirname, `../static/tilesResult/${output_name}`);
	if (
		!entry ||
		typeof entry !== 'string' ||
		!output ||
		typeof output !== 'string'
	) {
		throw new Error('please enter correct argument');
	}

	let result = spawn('python', [shell.file, ...shell.option, entry, output], {
		cwd: 'C:/Program Files/GDAL',
	});

	result.stdout.on('data', function (data) {
		process.stdout.write(data);
	});
	result.stderr.on('data', function (data) {
		console.log('stderr: ' + data);
	});

	result.on('close', function (code) {
		console.log('child process exited with code :' + code);
		if (code === 0) {
			Tile.WriteSuccess(data);
			console.log(`\n ${entry_file}, 瓦片制作成功`);
		}
	});
}

module.exports = gdal2tiles;
