require "mysql"
my = Mysql::new("localhost", "root", "peterham", "database_test", 8243)

n = 10

t1 = Time.now

n.times do | i |
res = my.query("select 1")
res.each do |row|
#  puts row
  col1 = row[0]
  col2 = row[1]
end
end
# processing...
t2 = Time.now

delta = t2 - t1

total_ms = delta * 1000

puts total_ms

avg_ms = total_ms / n

puts avg_ms
