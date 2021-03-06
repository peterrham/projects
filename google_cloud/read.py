# XXX purpose of this test program is to lookup a key without a
# transaction if it is possible to do that with datastore for
# simplicity, performance and undestanding

import logging
import sys
import time
import httplib2

# will log to console explicit detail of the request and response
httplib2.debuglevel = 2


import googledatastore as datastore

datastore.set_options(host='https://www.googleapis.com', dataset='glowing-thunder-842')

def measureTime(a):
    start = time.time()
#    print start
    a()
    elapsed = time.time()
#    print elapsed
    elapsed = elapsed - start
    print "Time spent in (function name) is: ", elapsed
 #   print ("%.5f" % elapsed)
#    print time.time()

def main():
  measureit()

def measureit():
  measureTime(measureN)

def empty():
    pass

def measureN():
#  ntimes = 100
  ntimes = 1
  for x in range(0, ntimes):
    # XXX can I do this recursively?
    measureTime(tryit)
#    measureTime(empty)

def tryit():
  try:

    # Create a RPC request to begin a new transaction.
    # XXX req = datastore.BeginTransactionRequest()
    # Execute the RPC synchronously.
#XXX    resp = datastore.begin_transaction(req)
    # Get the transaction handle from the response.

    # Create a RPC request to get entities by key.
    req = datastore.LookupRequest()
    # Create a new entity key.
    key = datastore.Key()
    # Set the entity key with only one `path_element`: no parent.
    path = key.path_element.add()
    path.kind = 'kindlooptest'
    path.name = 'ebadbec'
#XXX    path.name = 'bogus'

    # Add one key to the lookup request.
    req.key.extend([key])
    # Set the transaction, so we get a consistent snapshot of the
    # entity at the time the transaction started.

    # Execute the RPC and get the response.
    resp = datastore.lookup(req)
    # Create a RPC request to commit the transaction.

    # Set the transaction to commit.

    if resp.found:
#      print "found"
        pass
    else:
      print "missing"

  except datastore.RPCError as e:
    # RPCError is raised if any error happened during a RPC.
    # It includes the `method` called and the `reason` of the
    # failure as well as the original `HTTPResponse` object.
    logging.error('Error while doing datastore operation')
    logging.error('RPCError: %(method)s %(reason)s',
                  {'method': e.method,
                   'reason': e.reason})
    logging.error('HTTPError: %(status)s %(reason)s',
                  {'status': e.response.status,
                   'reason': e.response.reason})
    return

if __name__ == '__main__':
  main()
