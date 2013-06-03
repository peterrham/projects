require 'webrick'

root = File.expand_path 'c:\\workspace'

WEBrick::HTTPUtils::DefaultMimeTypes['html'] = 'text/html'
WEBrick::HTTPUtils::DefaultMimeTypes['rhtml'] = 'text/html'
WEBrick::HTTPUtils::DefaultMimeTypes['js'] = 'application/javascript'

server = WEBrick::HTTPServer.new :Port => 8000, :DocumentRoot => root

trap 'INT' do server.shutdown end

server.mount_proc '/dyn/' do |req, res|
   res.body = 'Hello, world!'
end


server.start
