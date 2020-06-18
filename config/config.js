const path = require('path');
const os = require('os');
const type = Symbol('platform');

/*
	瓦片状态
*/

const TileStatus = {
	get SUCCESS() {
		return 0;
	},
	get FAIL() {
		return -1;
	},
	get LOADING() {
		return 2;
	},
};

/*
	持久化文件
*/

const db = {
	get path() {
		return path.resolve(__dirname, '../db');
	},
};

/*
	终端命令
*/

const command = {
	// 代表私有变量
	[type]: os.type(),
	get win_rd() {
		return 'rd /s /q';
	},
	get lunix() {
		return 'rm -rf';
	},
	get rmdir() {
		return this[type] === 'Windows_NT' ? this.win_rd : this.lunix;
	},
};


module.exports = {
	TileStatus,
	db,
	command,
};
