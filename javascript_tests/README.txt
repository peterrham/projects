
./README.txt

The above named file is this file. This file explains the contents of
this directory for future use, after I forget what these files were
intended for. I have chosen to use the file extension ".txt" for "text
file" instead of the more unix-y "README" with no file extension. I
have chosen this file extension so that viewing the file on windows or
macos will be more obvious. Hopefully, those exploring this directory
will know to go to this file first.

Some brief comments on the files in this directory.

These files are mostly experimental html and javascript files which
help me learn html or javascript or solve problems by debugging with
small examples which I can hopefully come back to in the future to
refresh my memory or debug a new problem.

./hello_world.html 

The above file is not even really html. There's no html markup in the
file, but it demonstrates that a web browser can digest and display
simple text. This file is useful for debugging whether a web server or
browser is workint *at all*! Or for showing a beginning html author
(like myself), that you can get started right away without being too
intimidated by correct html syntax with "funny characters".


./test.txt

I actually have no idea what this file is for. This file simply
contains some kind of unique identifier:

6a193867-aefe-11e2-a661-ff378497d577

I should probably delete this file, but I'm putting it under version
control, just in case ....

./hello_world.rhtml

A trivial ruby embedded ruby (erb) file to show how to write a quick
Ruby webserver for a small project. I think that this works outside of
Ruby on Rails, but do not remember for sure.

It is a bit confusing that this file has the same name, but different
extension than ./hello_word.html. I will fix that when I learn git a
bit better and know how to rename files safely.

./embedded_ruby_loads_javascript_file.rhtml

./local_ruby_webrick_web_server.rb

This is a super important example as well as useful in running other
examples. This file is a fully functioning web server. This web server
allows both static and dynamic web content. Somehow, this web server
has a default configuration which runs the embedded ruby (erb)
templating engine on .rhtml files which is super visible to writing
simple, dynamic, web content. For small projects, tests, and learning
examples, this is so much simpler than creating a Ruby on Rails
project! Are there even simpler ways of doing this? "Sinatra" is also
very simple, but I think that the Sinatra Ruby "gem" is not installed
as part of the standard Ruby installation. So far, I'm leery of using
gems, since they complicate installation and I do not know how to use
gem's well yet and do not fully understand them! In this case, Java
.jar files seem superior, more convenient, and more controled, meaning
... likely to work reliably.

http://www.packtpub.com/article/building-tiny-web-applications-in-ruby-using-sinatra

Also, here's a pretty cool single line webserver in Ruby that uses
WEBrick.

'ruby -rwebrick -e 'WEBrick::HTTPServer.new(:Port=>8000,:DocumentRoot=>".").start'

That might be useful as a clickable application if ruby is
installed. I should try that sometime.

We can even embed here documents into a simple dynamic web server in
order to get a little better html content without create a second
source code file, which makes examples great.

http://stackoverflow.com/questions/4053542/what-is-the-purpose-or-here-documents-in-ruby

More complex web pages should use ERB, especially ones looping over
lists of content, still potentially we here documents.

See: 
http://www.ictforu.com/index.php/Ruby/erb-ruby.html

./latlon.txt

A .csv (comma seperated values encoded as ascii) file (should I not
change the file extension to .csv?). This has latitude longitude
pairs, or geocodes. This is the most basic input file to my route
evaluation and map display programs. This file currently has 0,0
(useful? Some where near Africa) and some Seattle locations, probably
near my home in Mercer Island.

./javascript_set_window_location.html

This html with javascript sets the html window to the root document of
the current web server. This one is interesting in that if you hit the
"back" button, you still get redirected to the root document and never
actually see this document itself.

./div_fixed_height_left_right.html

This html experiments with divs, eventually, to achieve a google maps
canvas that uses up the entire window and resizes when the window
resizes. 

This experiment only gets part of the way there. It's able to set the
height, left, and right of div elements, but not quite able to utilize
the 100% width and 100%. Should I be explicit about using html5?

./html_fragements.html

A buffer of text that include html fragments that are moving in and
out of files and may be useful in the future.

./html_table_full_height_and_width.html

This table takes up the full width and much of the full height of the
html window. I'm not exactly sure why it works, but it shows that a
table can help with this, although javascript seems to be the most
simple way.

./htm5_canvas_example.html

This is an html5 example of using a canvas and java script.  This test
also logs to the javascript console. I should have named this "html5"
instead of "htm5". That was a typographical error. I will fix that
once I learn how to rename a file in GIT.

./html_full_window_div.html

This file is an example of how to set the size of a div element to be
the size of the entire window, without javascript. This seems pretty
useful.

./html_table_consume_height.html

An example where a table row can consume all the remaining vertical
space in a window.

./html5_canvas_full_window.html

Using an html5 canvas to consume the full window width. It mostly
works, but not quite, not sure why.


./jquery_hello_world.html

Trivial of loading the standard jquery javascript library from the
current directory, but no actual javascript executed yet.

./javascript_event_example.html

This is an example of javascript setting html to a timestamp.

./html_div_experiment.html

This test html file is part of a long saga to get a google map
"canvas" to fill the entire window. It is probably futile and will
instead require javascript instead of pure html, but this was an
attempt.

This example is complex and does not achieve the goal, but who know's,
maybe it will be a useful reference.

Here follows, a list of not so useful files, possibly should be deleted:

./from_optimap_trimmed.txt

This is a sequence of stops from optimap. A free google maps based
sequencer. Probably can delete this one. Let's see.

Notes: testing placing my username and password in my .git/config file
for the local repository.

Scrap (to be deleted later)

url = https://peterrham:peterham1@github.com/peterrham/projects.git
