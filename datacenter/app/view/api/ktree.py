# -*- coding: utf-8 -*-
# Description: ktree of view package for api

from flask import *
from functools import wraps
import json
from . import api, libs

def assert_pkgname():
  def decorator(fn):
    @wraps(fn)
    def wrapped_function(package_name, *args, **kwargs):
      if package_name not in libs.ktree.package:
        abort(404)
      return fn(package_name,*args, **kwargs)
    return wrapped_function
  return decorator

@api.route('/ktree/<package_name>', methods=['GET'])
@assert_pkgname()
def pkgInfo(package_name):
  try:
    info = {
      'name': libs.ktree.package[package_name].info['name'],
      'tree': [x for x in libs.ktree.package[package_name].info['tree']],
      'sheet': [x for x in libs.ktree.package[package_name].info['sheet']]
    }
    return jsonify(info)
  except:
    raise ValueError('Broken package')

@api.route('/ktree/<package_name>/t/<tree_name>', methods=['GET'])
@assert_pkgname()
def pkgTree(package_name, tree_name):
  if tree_name not in libs.ktree.package[package_name].tree_list:
    abort(404)
  res = libs.ktree.package[package_name].tree_list[tree_name].search('')
  return jsonify(res)

@api.route('/ktree/<package_name>/t/<tree_name>/<tree_route>', methods=['GET'])
@assert_pkgname()
def pkgTreeRoute(package_name, tree_name, tree_route):
  if tree_name not in libs.ktree.package[package_name].tree_list:
    abort(404)
  res = libs.ktree.package[package_name].tree_list[tree_name].search(tree_route)
  return jsonify(res)

@api.route('/ktree/<package_name>/s/<sheet_name>', methods=['GET'])
@assert_pkgname()
def pkgSheet(package_name, sheet_name):
  if sheet_name not in libs.ktree.package[package_name].sheet_list:
    abort(404)
  res = {
    'length': len(libs.ktree.package[package_name].sheet_list[sheet_name])
  }
  return jsonify(res)

@api.route('/ktree/<package_name>/s/<sheet_name>/<skey>', methods=['GET'])
@assert_pkgname()
def pkgSheetKey(package_name, sheet_name, skey):
  if sheet_name not in libs.ktree.package[package_name].sheet_list:
    abort(404)
  sheet = libs.ktree.package[package_name].sheet_list[sheet_name]
  if skey not in sheet:
    abort(404)
  res = {
    skey: sheet[skey]
  }
  return jsonify(res)
