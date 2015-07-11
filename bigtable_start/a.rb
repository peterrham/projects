include Java
import org.apache.hadoop.hbase.HBaseConfiguration
import org.apache.hadoop.hbase.HColumnDescriptor
import org.apache.hadoop.hbase.HConstants
import org.apache.hadoop.hbase.HTableDescriptor
import org.apache.hadoop.hbase.client.HBaseAdmin
import org.apache.hadoop.hbase.client.HTable
import org.apache.hadoop.hbase.client.Connection
import org.apache.hadoop.hbase.client.ConnectionFactory
import org.apache.hadoop.hbase.client.Put
import org.apache.hadoop.hbase.client.Get
import org.apache.hadoop.hbase.util.Bytes

# import org.apache.hadoop.hbase.io.BatchUpdate
import org.apache.hadoop.io.Text
# conf = HBaseConfiguration.new
conf = HBaseConfiguration.create
tablename = "test_prime"
tablename_text = Text.new(tablename)
desc = HTableDescriptor.new(tablename)
desc.addFamily(HColumnDescriptor.new("content"))
desc.addFamily(HColumnDescriptor.new("anchor"))
connection = ConnectionFactory.createConnection(conf);

admin = connection.getAdmin

create_new_table = true
create_new_table = false

if create_new_table
  admin.createTable(desc)
  tables = admin.listTables
  table = HTable.new(conf, tablename_text)
end

# admin = HBaseAdmin.new(conf)
#Admin admin = new Admin(conf);



if false 

if false && admin.tableExists(tablename_text)
  admin.disableTable(tablename_text)
  admin.deleteTable(tablename_text) 
end


row = Text.new("row_x")
b = BatchUpdate.new(row)
b.put(Text.new("content:"), "some content")
table.commit(b)
data = table.get(row, Text.new("content:"))
data_str = java.lang.String(data, "UTF8")
print "The fetched row contains the value '#{data_str}'"
admin.deleteTable(desc.getName)

end

puts "abc"

10.times do

#  get 'test', 'row1'
  puts 'abc'
  
end

# table = connection.getTable(tablename_text)
table = connection.getTable(tablename)

puts table

row = Text.new("row_x")

puts row

put = org.apache.hadoop.hbase.client.Put.new row.bytes

puts put

#put.addImmutable('a'.bytes, 'b'.bytes, 'c'.bytes)
put.setId('a')

puts put

# put.addImmutable

# put.addImmutable

# put.addImmutable('a'.bytes, 'b'.bytes, 'c'.bytes)
# put.addColumn 'a'.bytes, 'b'.bytes, 'c'.bytes
bytes = Bytes.new()
# put.setAttribute("stuff", 'stuff'.bytes.to_a)

# put.addColumn bytes, bytes, bytes

#Bytes.new('a'), Text.new('b'), Text.new('c')


# put.addColumn 'a'.to_java_bytes, 'b'.bytes.to_a, 1, 'c'.bytes.to_a
# put.addColumn 'a','b', 1, 'c'
# put.foobar
# put.has 'a'.bytes,'b'.bytes, 1
put.has 'a'.to_java_bytes,'b'.to_java_bytes, 1

puts put


put.addColumn 'content'.to_java_bytes,'b'.to_java_bytes, 1, 'c'.to_java_bytes

# puts put

puts "before"

table.put(put)

puts "after"

get = org.apache.hadoop.hbase.client.Get.new row.bytes

puts get


start = Time.now

gotten = table.get get

the_end = Time.now

time = the_end - start

puts time

puts gotten

scan 'test_prime'





