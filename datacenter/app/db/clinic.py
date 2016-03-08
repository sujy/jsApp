# -*- coding: utf-8 -*-

# Description: Provide function for clinic's operations

from config import Clinics
from func import checkFieldCorrect, getField, checkData, getCodeFromRegion, skipAndLimit
from statistics import getStatisticsData, setStatisticsData
from .. import libs

import uuid

clinicMessage = {
  'success': 'Operations success',
  'clinicID': 'The clinicID is not exist',
  'duplicate': 'The ID of clinic had been used for another doctor',
  'information': 'The information for query is not enough',
  'deLoss': 'The name of department queried is not in the clinic',
  'deDuplicate': 'The name of departments of the clinic is the same as another',
  'data': 'The data is not a dict',
  'number': 'The latitude and longitude is not a number format',
  'password': 'The password of the administrator of clinic is not right',
}

def clinicRegister(data):
  result = False
  message = ''
  clinic = {}
  requriedList = ['name', 'password', 'city', 'district', 'province']
  if checkData(data):
    if checkFieldCorrect(data, requriedList):
      newCode = getCodeFromRegion(data['province'], data['city'], data['district'])
      clinicCount = getStatisticsData('clinic', 'clinicCount')
      clinicCount += 1
      setStatisticsData('clinic', 'clinicCount', clinicCount)
      newCode = newCode + str(clinicCount).zfill(4)
      newClinic = {
        'clinicID': newCode,
        'name': data['name'],
        'password': data['password'],
        'departments': [],
        'province': data['province'],
        'city': data['city'],
        'district': data['district'],
        'address': getField(data, 'address', ''),
        'longitude': getField(data, 'longitude', 0.0),
        'latitude': getField(data, 'latitude', 0.0),
        'zipCode': getField(data, 'zipCode', ''),
        'phone': getField(data, 'phone', ''),
        'photo': getField(data, 'photo', ''),
        'introduction': getField(data, 'introduction', ''),
        'email': getField(data, 'email', ''),
        'announcementID': [],
        'messageBoardID': [],
        'couponID': [],
        'mark': [],
      }
      Clinics.insert(newClinic)
      clinic = newClinic
      result = True
      message = clinicMessage['success']
    else:
      message = clinicMessage['information']
  else:
    message = clinicMessage['data']
  return {
    'message': message,
    'result': result,
    'clinicID': clinic.get('clinicID', ''),
  }

def clinicLogin(data):
  result = False
  message = ''
  clinic = {}
  if checkData(data):
    if checkFieldCorrect(data, ['clinicID', 'password']):
      queryCondition = {'clinicID': data['clinicID']}
      clinic = Clinics.find_one(queryCondition)
      if clinic is not None:
        if clinic['password'] == data['password']:
          result = True
          clinic.pop('_id')
          message = clinicMessage['success']
        else:
          message = clinicMessage['password']
          clinic = {}
      else:
        message = clinicMessage['clinicID']
        clinic = {}
    else:
      message = clinicMessage['information']
  else:
    message = clinicMessage['data']
  return {
    'clinic': clinic,
    'result': result,
    'message': message,
  }

def clinicUpdate(data):
  result = False
  message = ''
  requriedList = ['clinicID']
  if checkData(data):
    if checkFieldCorrect(data, requriedList):
      queryCondition = {'clinicID': data['clinicID']}
      clinic = Clinics.find_one(queryCondition)
      if clinic is not None:
        result = True
        Clinics.update(queryCondition, {'$set': data})
        message = clinicMessage['success']
      else:
        message = clinicMessage['clinicID']
    else:
      message = clinicMessage['information']
  else:
    message = clinicMessage['data']
  return {
    'result': result,
    'message': message,
  }


def clinicInformation(data):
  result = False
  message = ''
  clinic = {}
  requriedList = ['clinicID']
  if checkData(data):
    if checkFieldCorrect(data, requriedList):
      queryCondition = {'clinicID': data['clinicID']}
      clinic = Clinics.find_one(queryCondition)
      if clinic is not None:
        result = True
        message = clinicMessage['success']
        clinic.pop('_id')
      else:
        message = clinicMessage['clinicID']
    else:
      message = clinicMessage['information']
  else:
    message = clinicMessage['data']
  return {
    'result': result,
    'message': message,
    'clinic': clinic,
  }

# for unittest
def clinicDelete():
  result = Clinics.remove({})
  setStatisticsData('clinic', 'clinicCount', 0)
  return result

def departmentRegister(data):
  result = False
  message = ''
  requriedList = ['name', 'clinicID']
  if checkData(data):
    if checkFieldCorrect(data, requriedList):
      queryCondition = {'clinicID': data['clinicID']}
      clinic = Clinics.find_one(queryCondition)
      if clinic is not None:
        newDepartment = {
          'name': data['name'],
          'photo': getField(data, 'photo', ''),
          'phone': getField(data, 'phone', ''),
          'introduction': getField(data, 'introduction', ''),
          'doctors': [],
          'timeTable': [],
        }
        departments = clinic['departments']
        if any([item['name'] == data['name'] for item in departments]):
          message = clinicMessage['deDuplicate']
        else:
          departments.append(newDepartment)
          Clinics.update(queryCondition, {'$set': {'departments': departments}})
          result = True
          message = clinicMessage['success']
      else:
        message = clinicMessage['clinicID']
    else:
      message = clinicMessage['information']
  else:
    message = clinicMessage['data']
  return {
    'message': message,
    'result': result,
  }

def departmentUpdate(data):
  result = False
  message = ''
  requriedList = ['clinicID', 'departmentName']
  if checkData(data):
    if checkFieldCorrect(data, requriedList):
      queryCondition = {'clinicID': data['clinicID']}
      clinic = Clinics.find_one(queryCondition)
      if clinic is not None:
        departments = clinic['departments']
        department = None
        for item in departments:
          if item['name'] == data['departmentName']:
            department = item
        if department is not None:
          departments.remove(department)
          for item in department:
            if item in data:
              department[item] = data[item]
          departments.append(department)
          Clinics.update(queryCondition, {'$set': {'departments': departments}})
          result = True
          message = clinicMessage['success']
        else:
          message = clinicMessage['deLoss']
      else:
        message = clinicMessage['clinicID']
    else:
      message = clinicMessage['information']
  else:
    message = clinicMessage['data']
  return {
    'result': result,
    'message': message,
  }

def departmentInformation(data):
  result = False
  message = ''
  department = {}
  requriedList = ['clinicID', 'departmentName']
  if checkData(data):
    if checkFieldCorrect(data, requriedList):
      queryCondition = {'clinicID': data['clinicID']}
      clinic = Clinics.find_one(queryCondition)
      if clinic is not None:
        departments = [item for item in clinic['departments'] \
          if item['name'] == data['departmentName']]
        if len(departments) == 0:
          message = clinicMessage['deLoss']
        else:
          result = True
          message = clinicMessage['success']
          department = departments[0]
      else:
        message = clinicMessage['clinicID']
    else:
      message = clinicMessage['information']
  else:
    message = clinicMessage['data']
  return {
    'result': result,
    'message': message,
    'department': department,
  }

def allDepartmentsInformation(data):
  result = False
  message = ''
  departments = []
  requriedList = ['clinicID']
  if checkData(data):
    if checkFieldCorrect(data, requriedList):
      queryCondition = {'clinicID': data['clinicID']}
      clinic = Clinics.find_one(queryCondition)
      if clinic is not None:
        departments = clinic['departments']
        result = True
        message = clinicMessage['success']
      else:
        message = clinicMessage['clinicID']
    else:
      message = clinicMessage['information']
  else:
    message = clinicMessage['data']
  return {
    'result': result,
    'message': message,
    'departments': departments,
  }

def searchClinicsByDistrict(data):
  result = False
  message = ''
  clinics = []
  requriedList = ['province', 'city', 'district']
  if checkData(data):
    if checkFieldCorrect(data, requriedList):
      queryCondition = {
        'province': data['province'],
        'city': data['city'],
        'district': data['district'],
      }
      if queryCondition['province'] == '':
        queryCondition.pop('province')
      if queryCondition['city'] == '':
        queryCondition.pop('city')
      if queryCondition['district'] == '':
        queryCondition.pop('district')
      pageNo = int(data.get('pageNo', 1))
      pageCount = int(data.get('pageCount', 0))
      cursor = Clinics.find(queryCondition).skip((pageNo - 1) * pageCount).limit(pageCount)
      for item in cursor:
        item.pop('_id')
        clinics.append(item)
      result = True
      message = clinicMessage['success']
    else:
      message = clinicMessage['information']
  else:
    message = clinicMessage['data']
  return {
    'result': result,
    'message': message,
    'clinics': clinics,
  }

def searchClinicsByCoordinate(data):
  result = False
  message = ''
  clinics = []
  requriedList = ['longitude', 'latitude']
  if checkData(data):
    if checkFieldCorrect(data, requriedList):
      longitude = float(data['longitude'])
      latitude = float(data['latitude'])
      maxLongitude = longitude + 0.1
      minLongitude = longitude - 0.1
      maxLatitude = latitude + 0.1
      minLatitude = latitude - 0.1
      queryCondition = {
        'longitude': {'$gte': minLongitude, '$lte': maxLongitude},
        'latitude': {'$gte': minLatitude, '$lte': maxLatitude},
      }
      pageNo = int(data.get('pageNo', 1))
      pageCount = int(data.get('pageCount', 0))
      cursor = Clinics.find(queryCondition).skip((pageNo - 1) * pageCount).limit(pageCount)
      for item in cursor:
        dist = libs.utils.getDistance(latitude, longitude, item['latitude'], item['longitude'])
        if dist <= 10:
          item['dist'] = dist
          item.pop('_id')
          clinics.append(item)
      clinics = sorted(clinics, key = lambda clinic: -clinic['dist'])
      clinics = skipAndLimit((pageNo - 1) * pageCount, pageCount, clinics)
      result = True
      message = clinicMessage['success']
    else:
      message = clinicMessage['information']
  else:
    message = clinicMessage['data']
  return {
    'result': result,
    'message': message,
    'clinics': clinics,
  }

def searchClinicsByName(data):
  result = False
  message = ''
  clinics = []
  requriedList = ['name']
  if checkData(data):
    if checkFieldCorrect(data, requriedList):
      queryCondition = {
        'name': {
          '$regex': data['name'],
        }
      }
      pageNo = int(data.get('pageNo', 1))
      pageCount = int(data.get('pageCount', 0))
      cursor = Clinics.find(queryCondition).skip((pageNo - 1) * pageCount).limit(pageCount)
      for item in cursor:
        item.pop('_id')
        clinics.append(item)
      result = True
      message = clinicMessage['success']
    else:
      message = clinicMessage['information']
  else:
    message = clinicMessage['data']
  return {
    'result': result,
    'message': message,
    'clinics': clinics,
  }

def getAllClinics(data):
  clinics = []
  pageNo = int(data.get('pageNo', 1))
  pageCount = int(data.get('pageCount', 0))
  cursor = Clinics.find({}).skip((pageNo - 1) * pageCount).limit(pageCount)
  for item in cursor:
    item.pop('_id')
    clinics.append(item)
  result = True
  message = clinicMessage['success']
  return {
    'result': result,
    'message': message,
    'clinics': clinics,
  }
