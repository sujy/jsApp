# -*- coding: utf-8 -*-
# Author: lams
# Email: lams2135@gmail.com
# Date: 2015-02-04
# Description: The computing method for distance between two (longitude, latitude) point

import math
import numpy
import pycurl
import json
import StringIO

def getDistance(lat1, lng1, lat2, lng2):
  earth_radius = 6378.137
  radLat1 = math.radians(lat1)
  radLat2 = math.radians(lat2)
  A = radLat1 - radLat2
  B = math.radians(lng1) - math.radians(lng2)
  S = 2.0 * math.asin(math.sqrt(math.pow(math.sin(A/2),2) + math.cos(radLat1)*math.cos(radLat2)*math.pow(math.sin(B/2),2)))
  S = S * earth_radius
  dist = numpy.round(S*10000)/10000
  return dist

#url为所请求路径
#dic 如{"key":"value"}
def postJSON(url, dic):
  data = json.dumps(dic)
  c = pycurl.Curl()
  b = StringIO.StringIO()
  #设置请求url
  c.setopt(pycurl.URL, url)
  #设置请求头
  c.setopt(pycurl.HTTPHEADER, ['Content-Type:application/json'])
  #回调写进buffer
  c.setopt(pycurl.WRITEFUNCTION, b.write)
  c.setopt(pycurl.FOLLOWLOCATION, 1)
  #设置重定向次数
  c.setopt(pycurl.MAXREDIRS, 5)
  #超时设置
  c.setopt(pycurl.CONNECTTIMEOUT, 60)
  #浏览器模拟
  #c.setopt(pycurl.USERAGENT, "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322)")
  #发送数据
  c.setopt(pycurl.POSTFIELDS, data)
  c.setopt(pycurl.POST, 1)
  #进行上述操作
  c.perform()
  status = c.getinfo(pycurl.HTTP_CODE)
  content = b.getvalue()
  time = c.getinfo(pycurl.TOTAL_TIME)
  b.close()
  c.close()
  print "POSTJSON [%s] status: %d time: %f sec" % (url, status, time)
  return content, status, time
