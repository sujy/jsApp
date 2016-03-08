//=====================================
//function:   允许跨域请求
//=====================================

function cors(res) {
  if (res) {
    res.setHeader("Access-Control-Allow-Origin", res.req.headers.origin);
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", 3600);
  }

  return res;
}

module.exports = cors;