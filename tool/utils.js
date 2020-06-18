const fs = require('fs');
const path = require('path');

function deleteFolderRecursive(dirPath) {
	if (fs.existsSync(dirPath)) {
		fs.readdirSync(dirPath).forEach(function (file) {
			var curPath = path.resolve(dirPath, file);
			if (fs.statSync(curPath).isDirectory()) {
				// recurse
				deleteFolderRecursive(curPath);
			} else {
				// delete file
				fs.unlinkSync(curPath);
			}
		});
		try {
			fs.rmdirSync(dirPath);
		} catch (error) {
			fs.rmdirSync(dirPath);
		}
	}
}

module.exports = {
	deleteFolderRecursive,
};
