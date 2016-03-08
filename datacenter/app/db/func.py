# -*- coding: utf-8 -*-

# Description: The base function for database control

import base64, zlib, StringIO, random, time, os
from PIL import Image

def checkFieldCorrect(data, fields):
  for field in fields:
    if field not in data:
      return False
  return True

def checkFieldForbidden(data, fields):
  for field in fields:
    if field in data:
      return False
  return True

def getField(data, field, default):
  return default if field not in data else data[field]

def checkData(data):
  try:
    iter(data)
    return True
  except:
    return False

def getCodeFromRegion(province, city, district):
  return 'GDAA'

def uploadPicture(data, path, host):
  try:
    file = zlib.decompress(base64.decodestring(data))
    image = Image.open(StringIO.StringIO(file))
    fileName = datetime.datetime.now().strftime('%Y%m%d%H%M%S') + \
      str(int(random.randint(1, 100000))) + '.png'
    filePath = os.path.join(path, fileName)
    image.save(filePath, 'png')
    return True, host + filePath
  except:
    return False, ''

def skipAndLimit(pageSkip, pageLimit, dataList):
  return dataList[pageSkip: pageSkip + pageLimit]