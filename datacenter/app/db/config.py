# -*- coding: utf-8 -*-

# Description: The configuration of the database

import pymongo

DATABASE_NAME = 'data_center'

client = pymongo.MongoClient('localhost', 27017)

database = client[DATABASE_NAME]

Doctors = database['doctors']
Users = database['users']
Clinics = database['clinics']
Staffs = database['staffs']
Statistics = database['statistics']
EMRs = database['emr']
Bills = database['bills']

Users.ensure_index('uuid')
Users.ensure_index('userID')
Doctors.ensure_index('doctorID')
Clinics.ensure_index('clinicID')
Staffs.ensure_index('staffID')
Statistics.ensure_index('type')
EMRs.ensure_index('emrID')
