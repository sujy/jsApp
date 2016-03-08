# -*- coding: utf-8 -*-
# Description: user of view package for api

from flask import *
import json
from . import api, db

apiTable = {
  'register': db.user.userRegister,
  'login': db.user.userLogin,
  'info': db.user.userInfomation,
  'infoByName': db.user.queryUsersByName,
  'infoByCNID': db.user.queryUserByIdentification,
  'infoByPhone': db.user.queryUserByPhone,
  'update': db.user.userUpdate
}

@api.route('/user/<apiName>', methods=['POST'])
def userAPI(apiName):
  if apiName not in apiTable:
    abort(404)
  indata = request.get_json()
  res = apiTable[apiName](indata)
  return jsonify(res)
