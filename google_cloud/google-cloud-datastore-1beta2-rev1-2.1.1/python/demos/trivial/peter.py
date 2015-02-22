# purpose of this is to insert items in a loop and then query them in
# a loop for performance testing


import logging
import sys

import googledatastore as datastore

def main():

  datastore.set_options(dataset='glowing-thunder-842')
  try:
    # Create a RPC request to begin a new transaction.
    req = datastore.BeginTransactionRequest()
    # Execute the RPC synchronously.
    resp = datastore.begin_transaction(req)
    # Get the transaction handle from the response.
    tx = resp.transaction
    # Create a RPC request to get entities by key.
    req = datastore.LookupRequest()
    # Create a new entity key.
    key = datastore.Key()
    # Set the entity key with only one `path_element`: no parent.
    path = key.path_element.add()
    path.kind = 'kindtest'
    path.name = 'aaaa'
    # Add one key to the lookup request.
    req.key.extend([key])
    # Set the transaction, so we get a consistent snapshot of the
    # entity at the time the transaction started.
    req.read_options.transaction = tx
    # Execute the RPC and get the response.
    resp = datastore.lookup(req)
    # Create a RPC request to commit the transaction.
    req = datastore.CommitRequest()
    # Set the transaction to commit.
    req.transaction = tx
    if resp.found:
      # Get the entity from the response if found.
      entity = resp.found[0].entity
    else:
      # If no entity was found, insert a new one in the commit request mutation.
      entity = req.mutation.insert.add()
      # Copy the entity key.
      entity.key.CopyFrom(key)
      # Add two entity properties:
      # - a utf-8 string: `question`
      prop = entity.property.add()
      prop.name = 'prop1test'
      prop.value.string_value = 'value1test'
      # - a 64bit integer: `answer`
      prop = entity.property.add()
      prop.name = 'prop2test'
      prop.value.integer_value = 77
    # Execute the Commit RPC synchronously and ignore the response:
    # Apply the insert mutation if the entity was not found and close
    # the transaction.
    datastore.commit(req)
    # Get question property value.
    question = entity.property[0].value.string_value
    # Get answer property value.
    answer = entity.property[1].value.integer_value
    # Print the question and read one line from stdin.
    print answer

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
