# -*- coding: utf-8 -*-
# Author: dengyh
# Email: dengyh071@gmail.com
# Date: 2015-02-04
# Description: The knowledge tree

import json, types

class DataTree:
  def __init__(self):
    self.__tree = None

  def __getattr__(self, key):
    return self.search(key)
  
  def load(self, fileName):
    try:
      fp = open(fileName, 'r')
      self.__tree = json.load(fp)
      fp.close()
    except:
      raise IOError('The file named %s is not exist in the given path or it\'s not json format.' % fileName)

  def save(self, fileName):
    try:
      fp = open(fileName, 'w')
      if self.__tree is None:
        raise TypeError('The tree hasn\'t been initialized')
      else:
        json.dump(self.__tree, fp, indent = 2)
      fp.close()
    except:
      raise IOError('Can\'t save the file')

  def findGroup(self, root, identifier):
    groups = root
    if groups is None:
      raise NameError('The tree has not been initialized by data, please use load function')
    if identifier != '':
      for word in identifier.split('.'):
        if word == '':
          raise NameError('The identifier of this search operation is wrong')
        groups = groups[word]
    return groups

  def search(self, identifier, allResponse = True):
    groups = self.findGroup(self.__tree, identifier)
    result = {}
    if type(groups) == type({}) and not allResponse:
      for key, body in groups.iteritems():
        if type(body) == type({}):
          result[key] = {}
        else:
          result[key] = body
    else:
      return groups
    return result

  def searchGroupAttr(self, identifier, attr):
    groups = self.findGroup(self.__tree, identifier)
    return groups[attr]

if __name__ == '__main__':
  dataTree = DataTree()
  dataTree.load('emr2hr.json')
  print dataTree.search('EMR03.00.02.118')
