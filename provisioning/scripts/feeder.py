#!/usr/bin/python
import random
import time

try:
    import http.client as http_client
except ImportError:
    import httplib as http_client
http_client.HTTPConnection.debuglevel = 0

import requests

def write_line(payload, datebase):
    result = requests.post("http://localhost:8086/write?db=%s" % datebase,
                  data=payload
    )
    print "here to"
    print result.status_code


while True:
    write_line('cpu_load_short,host=server01,region=us-west value=%s %s000000000' % (
      random.randint(100,1010),int(time.mktime(time.localtime()))),
      'sample_database'
    )
    time.sleep(3)