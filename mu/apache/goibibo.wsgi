import os, sys
sys.path.append('/home/ubuntu/work/Team4_FallHackSC')
sys.path.append('/home/ubuntu/work/Team4_FallHackSC/mu')
sys.path.append('/home/ubuntu/work/Team4_FallHackSC/mu/lib')
os.environ['DJANGO_SETTINGS_MODULE'] = 'mu.settings'
os.environ['PYTHON_EGG_CACHE'] = '/home/ubuntu/work/Team4_FallHackSC/mu/.python-eggs'

import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()
