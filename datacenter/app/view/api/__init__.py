# -*- coding: utf-8 -*-

# Description: view package for api

from flask import Blueprint, jsonify
from .. import libs, db

api = Blueprint('api', __name__)

@api.route('/version')
def api_version():
  return jsonify({'version':'0.0.0.1'})

@api.route('/bug')
def api_bug():
  p = 1/0
  return 'w'

from . import user, doctor, clinic, staff, ktree
