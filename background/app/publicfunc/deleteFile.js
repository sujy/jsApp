//=====================================
//function:   delete File function
//            delete file after post the file to photo server
//=====================================

var fs = require('fs');

//删除文件，删除成功返回true 失败log出错误原因，返回false；
function deleteFile(path){
	fs.unlink(path, function (err) {
		if (err) {
			console.log(err);
			return false;
		} else {
			return true;
		}
	});
}

module.exports = deleteFile;