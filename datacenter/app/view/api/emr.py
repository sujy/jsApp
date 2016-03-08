# -*- coding: utf-8 -*-
# Description: EMR of view package for api

from flask import *
import json
from . import api, db

apiTable = {
  'insert': db.emr.insertEmrFromLocalToCloud,
  'findById': db.emr.queryEmrById,
  'findByCli': db.emr.queryEmrsByClinic,
  'findByDoct': db.emr.queryEmrsByDoctor,
  'findByUser': db.emr.queryEmrsByUser
}

@api.route('/emr/<apiName>', methods=['POST'])
def emrAPI(apiName):
  if apiName not in apiTable:
    abort(404)
  indata = request.get_json()
  print indata
  res = apiTable[apiName](indata)
  print res
  return jsonify(res)
