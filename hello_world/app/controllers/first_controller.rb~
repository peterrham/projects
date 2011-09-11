require 'csv'

class FirstController < ApplicationController

def index
end

def is_number?(object)
  true if Float(object) rescue false
end

def process_file

  upload_string = params[:datafile]
  @parsed_file=CSV::Reader.parse(upload_string)

  n = 0

  lat = 0
  lon = 0

  @coords = Array.new

  @parsed_file.each do |row|
    n=n+1
    lat = row[0]
    lon = row[1]

    if is_number?(lat) and is_number?(lon)
      @coords << row
    end

  end
  #  raise "I am not sure what's up, learning how to process a data file"
#  raise lon.inspect

  @lat = lat
  @lon = lon


end

end
