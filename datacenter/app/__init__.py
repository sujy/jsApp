# -*- coding: utf-8 -*-
# Author: lams
# Email: lams2135@gmail.com
# Date: 2015-01-27
# Description: application entrance

from flask import *
import json
import os
import view, libs, db

libs.ktree.path = "./app/resources/kpackage"

def create_app():
  # initial
  app = Flask(__name__)
  app.secret_key = os.urandom(24)

  # initial libs
  libs.ktree.path = './app/resources/kpackage'
  libs.ktree.loadpkg('emr')

  # register blueprints
  app.register_blueprint(view.api.api, url_prefix='/api')

  # test access page
  @app.route('/')
  def index():
    return render_template('test.html')

  # return object to launch
  return app
