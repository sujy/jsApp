//=====================================
//function:   request function 
//            connect the remote server
//=====================================

var http = require('http');

function request(host, port, method, url, data, callback){
	//请求数据
	var postData = JSON.stringify(data);
	// console.log(postData);
	//连接配置
	var options = {
	  hostname: host,
	  port: port,
	  path: url,
	  method: method,
	  headers: {
	  	'Content-Type': 'application/json',
	    'Content-Length': Buffer.byteLength(postData)
	  }
	};

	//设置连接请求操作
	var req = http.request(options, function(res) {
	  console.log('STATUS: ' + res.statusCode);
	  console.log('HEADERS: ' + JSON.stringify(res.headers));
	  res.setEncoding('utf8');
	  var result = '';
	  res.on('data', function (chunk) {
		result += chunk;
	  });
	  res.on('end', function () {
        console.log('BODY: ' + result);
        result = JSON.parse(result);
        callback(result);
      });
	});

	//连接失败
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	  callback(e.message);
	});

	//填充请求信息
	req.write(postData);
	req.end();
}

module.exports = request;