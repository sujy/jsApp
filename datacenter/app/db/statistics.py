# -*- coding: utf-8 -*-

# Description: Provide function for statistics's function

from config import Statistics

def getStatisticsTable(type):
  table = Statistics.find_one({'type': type})
  if table is None:
    table = Statistics.insert({'type': type})
  return table

def getStatisticsData(type, field):
  statistics = getStatisticsTable(type)
  try:
    value = statistics[field]
  except:
    value = 0
  return value

def setStatisticsData(type, field, value):
  statistics = getStatisticsTable(type)
  statistics[field] = value
  Statistics.update({'type': type}, {'$set': statistics})
  return
