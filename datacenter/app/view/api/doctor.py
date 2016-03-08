# -*- coding: utf-8 -*-
# Description: doctor of view package for api

from flask import *
import json
from . import api, db

apiTable = {
  'login': db.doctor.doctorLogin,
  'update': db.doctor.doctorUpdateForDoctor,
  'info': db.doctor.doctorInformation,
  'infoByNameCli': db.doctor.searchDoctorByClinicAndName,
  'infoByDepCli': db.doctor.searchDoctorByClinicAndDepartment,
  'search': db.doctor.searchDoctorByName,
  'infoById': db.doctor.searchDoctorByUuid,
  'infoByCli': db.doctor.searchDoctorByClinic,
  # temp
  'register': db.doctor.doctorRegister,
}

@api.route('/doctor/<apiName>', methods=['POST'])
def doctorAPI(apiName):
  if apiName not in apiTable:
    abort(404)
  indata = request.get_json()
  res = apiTable[apiName](indata)
  return jsonify(res)
