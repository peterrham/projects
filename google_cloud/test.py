import googledatastore as datastore
datastore.set_options(dataset='glowing-thunder-842')
req = datastore.BeginTransactionRequest()
datastore.begin_transaction(req)
