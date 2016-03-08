import dataTree
import json
import os

path = '.'
package = {}

class KTPackage:
  def __init__(self):
    self.tree_list = {}
    self.sheet_list = {}

  def add_tree(self, tname, dt):
    pass

  def rm_tree(self, tname):
    pass

  def add_sheet(self, sname, ds):
    pass

  def rm_sheet(self, sname):
    pass

  def load_dir(self, pdir):
    self.directory = pdir
    fpp = open(pdir + '/package.json', 'r')
    self.info = json.load(fpp)
    if 'tree' in self.info:
      for tn, tf in self.info['tree'].iteritems():
        if tn not in self.tree_list:
          tdt = dataTree.DataTree()
          tdt.load(pdir + '/' + tf)
          self.tree_list[tn] = tdt
        else:
          raise ValueError('Repeated tree name')
    if 'sheet' in self.info:
      for sn, sf in self.info['sheet'].iteritems():
        if sn not in self.sheet_list:
          tfp  = open(pdir + '/' + sf, 'r')
          self.sheet_list[sn] = json.load(tfp)
          tfp.close()
        else:
          raise ValueError('Repeated sheet name')

  def save_dir(self, pdir):
    try:
      fp = open(pdir + '/package.json', 'w')
      json.dump(fp, self.info, indent = 2)
      fp.close()
      if 'tree' in self.info:
        for tn, tf in self.info['tree'].iteritems():
          self.tree_list[tn].save(pdir + '/' + tf)
      if 'sheet' in self.info:
        for sn, sf in self.info['sheet'].iteritems():
          self.sheet_list[sn].save(pdir + '/' + sf)
    except:
      raise IOError('Error occurs while saving the package %s to %s' % (self.info['name'], pdir))


def loadpkg(pdir):
  try:
    global package
    pdir = path + '/' + pdir
    nktp = KTPackage()
    nktp.load_dir(pdir)
    package[nktp.info['name']] = nktp
    return True
  except:
    print "Error occurs while loading the package in %s" % pdir
    return False

def savepkg(name, pdir=None):
  try:
    if name in package:
      if pdir == None:
        pdir = package[name].directory
      pdir = path + '/' + pdir
      # TODO: mkdir
      package[name].save_dir(pdir)
    else:
      raise ValueError('No this package loaded')
    return True
  except:
    return False
