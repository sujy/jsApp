# -*- coding: utf-8 -*-

# Description: Provide function for user's operations

from config import Users
from func import checkFieldCorrect, getField, checkData

import uuid

userMessage = {
  'success': 'Operation success',
  'password': 'The password is not correct',
  'userID': 'The ID of user had not been signed up in the system',
  'notExist': 'The user is not exist',
  'duplicate': 'The ID of user had been used for another user',
  'information': 'The information for this operation is not enough',
  'data': 'The data is not a dict',
}

def userRegister(data):
  message = ''
  result = False
  user = {}
  requiredList = ['userID', 'password']
  if checkData(data):
    if checkFieldCorrect(data, requiredList):
      queryCondition = {'userID': data['userID']}
      user = Users.find_one(queryCondition)
      if user is not None:
        message = userMessage['duplicate']
      else:
        newUser = {
          'uuid': uuid.uuid1().hex,
          'userID': data['userID'],
          'password': data['password'],
          'photo': 'http://192.168.1.219:9000/image/morenlogo.png',
          'name': data.get('name', ''),
          'nickname': data.get('nickname', ''),
          'identification': data.get('identification', ''),
          'gender': data.get('gender', ''),
          'telephone': data.get('telep hone', ''),
          'mobilePhone': data.get('mobilePhone', ''),
          'mail': data.get('mail', ''),
          'nation': data.get('nation', ''),
          'marriage': data.get('marriage', False),
          'bornDate': data.get('bornDate', ''),
          'bloodType': data.get('bloodType', ''),
          'allergy': data.get('allergy', ''),
          'height': data.get('height', 0),
          'weight': data.get('weight', 0),
          'occupation': data.get('occupation', ''),
          'workPlace': data.get('workPlace', ''),
          'familyHistory': data.get('familyHistory', ''),
          'allergyHistory': data.get('allergyHistory', ''),
          'personalHistory': data.get('personalHistory', ''),
          'isSmoking': data.get('isSmoking', False),
          'isDrinking': data.get('isDrinking', False),
          'bloodPressure': data.get('bloodPressure', 0),
          'bloodSuger': data.get('bloodSuger', 0),
          'family': data.get('family', []),
          'bookingID': data.get('bookingID', []),
          'dialogID': data.get('dialogID', []),
          'messageBoardID': data.get('messageBoardID', []),
          'evaluateID': data.get('evaluateID', []),
        }
        Users.insert(newUser)
        user = newUser
        result = True
        message = userMessage['success']
    else:
      message = userMessage['information']
  else:
    message = userMessage['data']
  return {
    'uuid': user.get('uuid', ''),
    'result': result,
    'message': message,
  }

def userLogin(data):
  result = False
  message = ''
  user = {}
  requiredList = ['userID', 'password']
  if checkData(data):
    if checkFieldCorrect(data, requiredList):
      queryCondition = {'userID': data['userID']}
      user = Users.find_one(queryCondition)
      if user is not None:
        if user['password'] == data['password']:
          result = True
          message = userMessage['success']
        else:
          message = userMessage['password']
          user = {}
      else:
        message = userMessage['userID']
        user = {}
    else:
      message = userMessage['information']
  else:
    message = userMessage['data']
  return {
    'uuid': user.get('uuid', ''),
    'result': result,
    'message': message,
  }

def queryUser(data, requiredList):
  result = False
  user = {}
  message = ''
  if checkData(data):
    if checkFieldCorrect(data, requiredList):
      queryCondition = {}
      for key in requiredList:
        queryCondition[key] = data[key]
      user = Users.find_one(queryCondition)
      if user is not None:
        result = True
        message = userMessage['success']
        user.pop('_id')
      else:
        message = userMessage['notExist']
    else:
      message = userMessage['information']
  else:
    message = userMessage['data']
  return {
    'result': result,
    'message': message,
    'user': user,
  }

def queryUsers(data, requiredList):
  result = False
  users = []
  message = ''
  if checkData(data):
    if checkFieldCorrect(data, requiredList):
      queryCondition = {}
      for key in requiredList:
        queryCondition[key] = {'$regex': data[key]}
      cursor = Users.find(queryCondition)
      for item in cursor:
        item.pop('_id')
        users.append(item)
      result = True
      message = userMessage['success']
    else:
      message = userMessage['information']
  else:
    message = userMessage['data']
  return {
    'users': users,
    'message': message,
    'result': result,
  }


def userInfomation(data):
  return queryUser(data, ['userID'])

def queryUserByPhone(data):
  return queryUser(data, ['mobilePhone'])

def queryUserByIdentification(data):
  return queryUser(data, ['identification'])

def queryUsersByName(data):
  return queryUsers(data, ['name'])

def userUpdate(data):
  result = False
  message = ''
  requiredList = ['userID']
  if checkData(data):
    if checkFieldCorrect(data, requiredList):
      queryCondition = {'userID': data['userID']}
      user = Users.find_one(queryCondition)
      if user is not None:
        result = True
        Users.update(queryCondition, {'$set': data})
        message = userMessage['success']
      else:
        message = userMessage['userID']
    else:
      message = userMessage['information']
  else:
    message = userMessage['data']
  return {
    'result': result,
    'message': message,
  }

# for unittest
def userDelete():
  result = Users.remove({})
  return result
