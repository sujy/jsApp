# -*- coding: utf-8 -*-

# Description: Provide function for EMR's operations

from config import EMRs
from func import checkFieldCorrect, getField, checkData

emrMessage = {
  'success': 'OK',
  'data': 'The data is not a dict',
  'emrID': 'The ID of EMR had not been created',
  'information': 'The information for this operation is not enough',
  'duplicate': 'The ID of this EMR had been used',
}

def insertEmrFromLocalToCloud(data):
  result = False
  message = ''
  requiredList = ['emrID', 'userID', 'clinicID', 'doctorID', 'time',
    'examinationID', 'prescriptionID', 'emrBody']
  if checkData(data):
    if checkFieldCorrect(data, requiredList):
      queryCondition = {'emrID': data['emrID']}
      emr = EMRs.find_one(queryCondition)
      if emr is None:
        EMRs.insert(data)
        result = True
        message = emrMessage['success']
      else:
        message = emrMessage['duplicate']
    else:
      message = emrMessage['information']
  else:
    message = emrMessage['data']
  return {
    'result': result,
    'message': message,
  }

def queryEmrById(data):
  result = False
  message = ''
  emr = {}
  requiredList = ['emrID']
  if checkData(data):
    if checkFieldCorrect(data, requiredList):
      queryCondition = {'emrID': data['emrID']}
      emr = EMRs.find_one(queryCondition)
      if emr is not None:
        emr.pop('_id')
        result = True
        message = emrMessage['success']
      else:
        message = emrMessage['emrID']
    else:
      message = emrMessage['information']
  else:
    message = emrMessage['data']
  return {
    'result': result,
    'message': message,
    'emr': emr,
  }

def queryEmrsByCondition(data, requiredList):
  result = False
  message = ''
  emrs = []
  if checkData(data):
    if checkFieldCorrect(data, requiredList):
      queryCondition = {}
      for field in requiredList:
        queryCondition[field] = data[field]
      pageNo = int(data.get('pageNo', 1))
      pageCount = int(data.get('pageCount', 0))
      cursor = EMRs.find(queryCondition).skip((pageNo - 1) * pageCount).limit(pageCount)
      for item in cursor:
        item.pop('_id')
        emrs.append(item)
      result = True
      message = emrMessage['success']
    else:
      message = emrMessage['information']
  else:
    message = emrMessage['data']
  return {
    'emrs': emrs,
    'result': result,
    'message': message,
  }

def queryEmrsByClinic(data):
  requiredList = ['clinicID']
  return queryEmrsByCondition(data, requiredList)

def queryEmrsByDoctor(data):
  requiredList = ['doctorID']
  return queryEmrsByCondition(data, requiredList)

def queryEmrsByUser(data):
  requiredList = ['userID']
  return queryEmrsByCondition(data, requiredList)
