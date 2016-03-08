# -*- coding: utf-8 -*-

# Description: Provide function for doctor's operations

from config import Doctors, Clinics, Staffs
from func import checkFieldCorrect, getField, checkData

import uuid

doctorMessage = {
  'success': 'Operation success',
  'password': 'The password is not correct',
  'uuid': 'The uuid of doctor is not exist',
  'doctorID': 'The ID of doctor had not been signed up in the system',
  'duplicate': 'The ID of doctor or staff had been used for another doctor',
  'information': 'The information for this operation is not enough',
  'clinicID': 'The clinicID is not exist',
  'noDepartments': 'The name of departments is not exist',
  'data': 'The data is not a dict',
}

def doctorLogin(data):
  result = False
  message = ''
  doctor = {}
  if checkData(data):
    if checkFieldCorrect(data, ['doctorID', 'password']):
      queryCondition = {'doctorID': data['doctorID']}
      doctor = Doctors.find_one(queryCondition)
      if doctor is not None:
        if doctor['password'] == data['password']:
          result = True
          message = doctorMessage['success']
        else:
          message = doctorMessage['password']
          doctor = {}
      else:
        message = doctorMessage['doctorID']
        doctor = {}
    else:
      message = doctorMessage['information']
  else:
    message = doctorMessage['data']
  return {
    'uuid': doctor.get('uuid', ''),
    'clinicID': doctor.get('clinicID', ''),
    'result': result,
    'message': message,
  }

def doctorRegister(data):
  message = ''
  result = False
  doctor = {}
  requiredList = ['doctorID', 'password', 'clinicID', 'department']
  if checkData(data):
    if checkFieldCorrect(data, requiredList):
      queryCondition = {'doctorID': data['clinicID'] + data['doctorID']}
      queryConditionAboutStaff = {'staffID': data['clinicID'] + data['doctorID']}
      doctor = Doctors.find_one(queryCondition)
      staff = Staffs.find_one(queryConditionAboutStaff)
      if doctor is not None or staff is not None:
        message = doctorMessage['duplicate']
        doctor = {}
      else:
        doctor = {}
        queryClinic = {'clinicID': data['clinicID']}
        clinic = Clinics.find_one(queryClinic)
        if clinic is not None:
          departments = clinic['departments']
          if any([data['department'] == item['name'] for item in departments]):
            newDoctor = {
              'uuid': uuid.uuid1().hex,
              'doctorID': data['clinicID'] + data['doctorID'],
              'password': data['password'],
              'name': getField(data, 'name', ''),
              'gender': getField(data, 'gender', ''),
              'phone': getField(data, 'phone', ''),
              'email': getField(data, 'email', ''),
              'birthday': getField(data, 'birthday', ''),
              'active': True,
              'freeTime': [],
              'note': getField(data, 'note', ''),
              'photo': getField(data, 'photo', 'http://honganzaixian.vicp.cc:5555/media/pictures/2015021011035452055.png'),
              'level': 0,
              'power': 1,
              'clinicID': data['clinicID'],
              'department': data['department'],
              'mark': [],
              'bookingID': [],
              'dialogID': [],
              'messageBoardID': [],
              'evaluateID': [],
              'goodAt': [],
            }
            Doctors.insert(newDoctor)
            newStaff = {
              'uuid': newDoctor['uuid'],
              'staffID': newDoctor['doctorID'],
              'password': newDoctor['password'],
              'name': newDoctor['name'],
              'gender': newDoctor['gender'],
              'phone': newDoctor['phone'],
              'email': newDoctor['email'],
              'birthday': newDoctor['birthday'],
              'photo': newDoctor['photo'],
              'role': ['doctor'],
              'clinicID': newDoctor['clinicID'],
              'active': True,
            } 
            Staffs.insert(newStaff)
            doctor = newDoctor
            for item in departments:
              if item['name'] == data['department']:
                item['doctors'].append(doctor['uuid'])
            Clinics.update(queryClinic, {'$set': {'departments': departments}})
            result = True
            message = doctorMessage['success']
          else:
            message = doctorMessage['noDepartments']
        else:
          message = doctorMessage['clinicID']
    else:
      message = doctorMessage['information']
  else:
    message = doctorMessage['data']
  return {
    'uuid': doctor.get('uuid', ''),
    'result': result,
    'message': message,
  }

def doctorUpdate(data, requiredList):
  result = False
  message = ''
  if checkData(data):
    if checkFieldCorrect(data, requiredList):
      queryCondition = {'doctorID': data['doctorID']}
      doctor = Doctors.find_one(queryCondition)
      if doctor is not None:
        if 'department' in data:
          clinicID = doctor['clinicID']
          queryClinic = {'clinicID': clinicID}
          clinic = Clinics.find_one(queryClinic)
          departments = clinic['departments']
          for item in departments:
            if item['name'] == data['department']:
              item['doctors'].append(doctor['uuid'])
            if item['name'] == doctor['department']:
              item['doctors'].remove(doctor['uuid'])
          Clinics.update(queryClinic, {'$set': {'departments': departments}})
        Doctors.update(queryCondition, {'$set': data})
        result = True
        message = doctorMessage['success']
      else:
        message = doctorMessage['doctorID']
    else:
      message = doctorMessage['information']
  else:
    message = doctorMessage['data']
  return {
    'result': result,
    'message': message,
  }

def doctorUpdateForDoctor(data):
  requiredList = ['doctorID']
  return doctorUpdate(data, requiredList)

def doctorUpdateForManager(data):
  requiredList = ['name', 'gender', 'freeTime',
    'note', 'photo', 'phone', 'level',
    'doctorID', 'power']
  return doctorUpdate(data, requiredList)

def doctorUpdateForRoot(data):
  requiredList = ['name', 'gender', 'freeTime',
    'not', 'photo', 'phone', 'level',
    'doctorID', 'power']
  return doctorUpdate(data, requiredList)

def doctorInformation(data):
  message = ''
  result = False
  doctor = None
  requiredList = ['doctorID']
  if checkData(data):
    if checkFieldCorrect(data, requiredList):
      queryCondition = {'doctorID': data['doctorID']}
      doctor = Doctors.find_one(queryCondition)
      if doctor is not None:
        result = True
        message = doctorMessage['success']
        doctor.pop('_id')
      else:
        message = doctorMessage['doctorID']
    else:
      message = doctorMessage['information']
  else:
    message = doctorMessage['data']
  return {
    'result': result,
    'message': message,
    'doctor': doctor,
  }

def searchDoctorByUuid(data):
  message = ''
  result = False
  doctor = {}
  requiredList = ['uuid']
  if checkData(data):
    if checkFieldCorrect(data, requiredList):
      queryCondition = {'uuid': data['uuid']}
      doctor = Doctors.find_one(queryCondition)
      if doctor is not None:
        doctor.pop('_id')
        result = True
        message = doctorMessage['success']
      else:
        message = doctorMessage['uuid']
    else:
      message = doctorMessage['information']
  else:
    message = doctorMessage['data']
  return {
    'doctor': doctor,
    'result': result,
    'message': message,
  }

# for unittest
def doctorDelete():
  result = Doctors.remove({})
  return result

def searchDoctors(data, requiredList, regexList):
  result = False
  message = ''
  doctors = []
  if checkData(data):
    if checkFieldCorrect(data, requiredList):
      queryConditions = {}
      for key in requiredList:
        queryConditions[key] = data[key]
      # If key is in requiredList and regexList, it will replace by regex search
      for key in regexList:
        queryConditions[key] = {'$regex': data[key]}
      pageNo = int(data.get('pageNo', 1))
      pageCount = int(data.get('pageCount', 0))
      cursor = Doctors.find(queryConditions).skip((pageNo - 1) * pageCount).limit(pageCount)
      for item in cursor:
        item.pop('_id')
        doctors.append(item)
      result = True
      message = doctorMessage['success']
    else:
      message = doctorMessage['information']
  else:
    message = doctorMessage['data']
  return {
    'result': result,
    'message': message,
    'doctors': doctors,
  }

def searchDoctorByName(data):
  return searchDoctors(data, ['name'], ['name'])

def searchDoctorByClinic(data):
  return searchDoctors(data, ['clinidID'], [])

def searchDoctorByClinicAndName(data):
  return searchDoctors(data, ['clinicID', 'name'], ['name'])

def searchDoctorByClinicAndDepartment(data):
  return searchDoctors(data, ['clinicID', 'department'], [])
