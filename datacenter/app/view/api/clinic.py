# -*- coding: utf-8 -*-
# Description: clinic of view package for api

from flask import *
import json
from . import api, db

apiTable = {
  'cliinfo': db.clinic.clinicInformation,
  'depinfo': db.clinic.departmentInformation,
  'depreg': db.clinic.departmentRegister,
  'depinfos': db.clinic.allDepartmentsInformation,
  'cliupdate': db.clinic.clinicUpdate,
  'depupdate': db.clinic.departmentUpdate,
  'searchByAddr': db.clinic.searchClinicsByDistrict,
  'searchByLL': db.clinic.searchClinicsByCoordinate,
  'searchByName': db.clinic.searchClinicsByName,
  # temp
  'clireg': db.clinic.clinicRegister,
  'getAllCli': db.clinic.getAllClinics,
  'clilogin': db.clinic.clinicLogin
}

@api.route('/clinic/<apiName>', methods=['POST'])
def clinicAPI(apiName):
  if apiName not in apiTable:
    abort(404)
 
  indata = request.get_json()
  # print '*********'
  # print request.get_json()
  # print '*********'
  res = apiTable[apiName](indata)
  # print res
  return jsonify(res)
