# -*- coding: utf-8 -*-
# Description: staff of view package for api

from flask import *
import json
from . import api, db

apiTable = {
  'login': db.staff.staffLogin,
  'update': db.staff.staffUpdate,
  'info': db.staff.staffInformation,
  # temp
  'register': db.staff.staffRegister,
}

@api.route('/staff/<apiName>', methods=['POST'])
def staffAPI(apiName):
  if apiName not in apiTable:
    abort(404)
  indata = request.get_json()
  res = apiTable[apiName](indata)
  return jsonify(res)
