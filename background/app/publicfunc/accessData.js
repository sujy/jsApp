var http = require('http');

function requestData(host, port, path, method, data, callback) {
  try{
	var result;
	//发送请求
    var options = {
      hostname : host,
      port: port,
      path: path,
      method: method,
      headers : {
        'Content-Type' : 'application/json',
        'Content-Length' : Buffer.byteLength(data)
      }
    }
    var req = http.request(options, function (res) {
      console.log('STATUS: ' + res.statusCode);
      // console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      var d = '';
      res.on('data', function (chunk) {
        // Buffer.concat(data);
        // console.log('BODY: ' + chunk.length);
        d += chunk;
      });

      res.on('end', function () {
        console.log('BODY: ' + d);
        result = JSON.parse(d);
        callback(result);
      });
    });

    req.on('error', function (e) {
      console.log('problem with request: ' + e.message);
    });

    req.write(data);
    req.end();
  } catch(e) {
    console.log(e);
  }
}

module.exports = requestData;
