# -*- coding: utf-8 -*-
# Author: dengyh
# Email: dengyh071@gmail.com
# Date: 2015-02-04
# Description: Translate the old form structure to the new one

import json, codecs, os

class Translate:
  def __init__(self):
    pass

  def buildNewDataTree(self, oldFile, newFile):
    def dfs(tree):
      elements = []
      nowTree = {}
      for key, value in tree.iteritems():
        if key.startswith('HR'):
          elements.append(key)
        elif hasattr(value, '__iter__'):
          nowTree[key] = dfs(value)
        else:
          nowTree[key] = value
      nowTree['elements'] = elements
      return nowTree

    fp = open(oldFile, 'r')
    oldTree = json.load(fp)
    fp.close()

    newTree = dfs(oldTree)

    fp = codecs.open(newFile, 'w', 'utf-8')
    json.dump(newTree, fp, indent = 2, ensure_ascii = False)
    fp.close()

  def addElement(self, tree, identifier, value):
    now = tree
    lastTree = None
    lastWord = None
    for word in identifier.split('.'):
      if word == '':
        raise NameError('The identifier %s of this add operation is wrong' % identifier)
      if word not in now:
        now[word] = {}
      lastTree = now
      lastWord = word
      now = now[word]
    try:
      now.update(value)
    except:
      lastTree[lastWord] = value
    return tree

  def buildTree(self, newTree, oldTree, select):
    for key, value in oldTree.iteritems():
      if select(key):
        self.addElement(newTree, key, value)
      elif hasattr(value, '__iter__'):
        self.buildTree(newTree, value, select)

  def buildDataElementTree(self, oldFile, newFile):
    fp = open(oldFile, 'r')
    oldTree = json.load(fp)
    fp.close()

    newTree = {}
    self.buildTree(newTree, oldTree, lambda x : x.startswith('HR'))

    fp = codecs.open(newFile, 'w', 'utf-8')
    json.dump(newTree, fp, indent = 2, ensure_ascii = False)
    fp.close()

  def buildTreeForEmrAndHr(self, diretory, newEmr, newHr):
    emr2hr = {}
    hr2emr = {}
    for fileName in os.listdir(diretory):
      inFile = open(os.path.join(diretory, fileName), 'r')
      lastLine = ''
      for line in inFile.readlines():
        if line != '\n':
          if lastLine.startswith('EMR') and line.startswith('HR'):
            lastLine = lastLine.replace('\n', '')
            line = line.replace('\n', '')
            emr2hr[lastLine] = line
            if line not in hr2emr:
              hr2emr[line] = []
            hr2emr[line].append(lastLine)
          lastLine = line
      inFile.close()

    newEmrTree, newHrTree = {}, {}
    self.buildTree(newEmrTree, emr2hr, lambda x: x.startswith('EMR'))
    self.buildTree(newHrTree, hr2emr, lambda x: x.startswith('HR'))

    outFile = codecs.open(newEmr, 'w', 'utf-8')
    json.dump(newEmrTree, outFile, indent = 2, ensure_ascii = False)
    outFile.close()

    outFile = codecs.open(newHr, 'w', 'utf-8')
    json.dump(newHrTree, outFile, indent = 2, ensure_ascii = False)
    outFile.close()

if __name__ == '__main__':
  translate = Translate()
  translate.buildDataElementTree('data.json', 'elements.json')
  translate.buildTreeForEmrAndHr('../../resources/txts', 'emr2hr.json', 'hr2emr.json')
