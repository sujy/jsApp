# -*- coding: utf-8 -*-

# Description: Provide function for staff's operations

from config import Staffs, Clinics
from func import checkFieldCorrect, getField, checkData

import uuid

staffMessage = {
  'success': 'Operation success',
  'password': 'The password is not correct',
  'staffID': 'The ID of staff had not been signed up in the system',
  'duplicate': 'The ID of staff had been used for another staff',
  'information': 'The information for this operation is not enough',
  'clinicID': 'The clinicID is not exist',
  'noDepartments': 'The name of departments is not exist',
  'data': 'The data is not a dict',
}

def staffRegister(data):
  message = ''
  result = False
  staff = {}
  requiredList = ['staffID', 'password', 'clinicID']
  if checkData(data):
    if checkFieldCorrect(data, requiredList):
      queryCondition = {'staffID': data['clinicID'] + data['staffID']}
      staff = Staffs.find_one(queryCondition)
      if staff is not None:
        message = staffMessage['duplicate']
      else:
        staff = {}
        queryClinic = {'clinicID': data['clinicID']}
        clinic = Clinics.find_one(queryClinic)
        if clinic is not None:
          newStaff = {
            'uuid': uuid.uuid1().hex,
            'staffID': data['clinicID'] + data['staffID'],
            'password': data['password'],
            'name': data.get('name', ''),
            'gender': data.get('gender', ''),
            'phone': data.get('gender', ''),
            'email': data.get('email', ''),
            'birthday': data.get('birthday', ''),
            'photo': data.get('photo', ''),
            'role': data.get('role', []),
            'clinicID': data['clinicID'],
            'active': True,
          }
          Staffs.insert(newStaff)
          staff = newStaff
          result = True
          message = staffMessage['success']
        else:
          message = staffMessage['clinicID']
    else:
      message = staffMessage['information']
  else:
    message = staffMessage['data']
  return {
    'uuid': staff.get('uuid', ''),
    'result': result,
    'message': message,
  }

def staffLogin(data):
  result = False
  message = ''
  staff = {}
  requiredList = ['staffID', 'password']
  if checkData(data):
    if checkFieldCorrect(data, requiredList):
      queryCondition = {'staffID': data['staffID']}
      staff = Staffs.find_one(queryCondition)
      if staff is not None:
        if staff['password'] == data['password']:
          result = True
          message = staffMessage['success']
        else:
          message = staffMessage['password']
          staff = {}
      else:
        message = staffMessage['staffID']
        staff = {}
    else:
      message = staffMessage['information']
  else:
    message = staffMessage['data']
  return {
    'uuid': staff.get('uuid', ''),
    'clinicID': staff.get('clinicID', ''),
    'role': staff.get('role', ''),
    'result': result,
    'message': message,
  }

def staffInformation(data):
  result = False
  message = ''
  staff = {}
  requiredList = ['staffID']
  if checkData(data):
    if checkFieldCorrect(data, requiredList):
      queryCondition = {'staffID': data['staffID']}
      staff = Staffs.find_one(queryCondition)
      if staff is not None:
        result = True
        message = staffMessage['success']
        staff.pop('_id')
      else:
        message = staffMessage['staffID']
    else:
      message = staffMessage['information']
  else:
    message = staffMessage['data']
  return {
    'result': result,
    'message': message,
    'staff': staff,
  }

def staffUpdate(data):
  result = False
  message = ''
  if checkData(data):
    if checkFieldCorrect(data, requiredList):
      queryCondition = {'staffID', data['staffID']}
      staff = Staffs.find_one(queryCondition)
      if staff is not None:
        Staffs.update(queryCondition, {'$set': data})
        result = True
        message = staffMessage['success']
      else:
        message = staffMessage['staffID']
    else:
      message = staffMessage['information']
  else:
    message = staffMessage['data']
  return {
    'result': result,
    'message': message,
  }
