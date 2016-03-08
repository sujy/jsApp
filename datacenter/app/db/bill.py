# -*- coding: utf-8 -*-

# Description: Provide function for finance's operations

from config import Bills, Clinics
from func import checkFieldCorrect, getField, checkData

import time
import uuid

billMessage = {
  'success': 'OK',
  'data': 'The data is not a dict',
  'clinicID': 'The clinicID is not exist',  
  'information': 'The information for this operation is not enough',
}

def insertBillOrder(data):
  result = False
  message = ''
  requiredList = ['clinicID', 'price', 'table', 'number']
  if checkData(data):
    if checkFieldCorrect(data, requiredList):
      queryCondition = {'clinicID': data['clinicID']}
      clinic = Clinics.find_one(queryCondition)
      if clinic is not None:
        newBill = {
          'billID': uuid.uuid1().hex,
          'time': int(time.time()),
          'clinicID': data['clinicID'],
          'price': data['price'],
          'table': data['table'],
          'number': data['number'],
        }
        Bills.insert(newBill)
        message = billMessage['success']
        result = True
      else:
        message = billMessage['clinicID']
    else:
      message = billMessage['information']
  else:
    message = billMessage['data']
  return {
    'result': result,
    'message': message,
  }

def queryBillsByCondition(data):
  result = False
  message = ''
  bills = []
  if checkData(data):
    startTime = int(getField(data, 'startTime', 0))
    endTime = int(getField(data, 'endTime', int(time.time())))
    queryCondition = {
      'time': {'$gte': startTime, '$lte': endTime}
    }
    pageNo = int(data.get('pageNo', 1))
    pageCount = int(data.get('pageCount', 0))
    if data['clinicID'] is not None:
      queryCondition['clinicID'] = data['clinicID']
    cursor = Bills.find(queryCondition).sort('time').skip((pageNo - 1) * pageCount).limit(pageCount)
    for item in cursor:
      item.pop('_id')
      bills.append(item)
    result = True
    message = billMessage['success']
  else:
    message = billMessage['data']
  return {
    'result': result,
    'message': message,
    'bills': bills,
  }
