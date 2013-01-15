# a next step will be to iterate over all the kinds of dragons and
# include the resulting dragon in the list then for each pair figure
# out the percentage and then how long you have to wait to get a
# particular dragon for example: how long to wait to get a panlong if
# you try to breed fog and lava then we can answer that for each pair
# and then determine the pair that is likely to breed a panlong (or
# potentially something better) the fastest lava and fog: ....  mud
# and blazing: ...

require 'logger'

@@log = Logger.new('log.txt')

@@log.debug "Log file created"

@debug = true

require 'rubygems'

@@log.debug "Hello, world!"

@@my_file = File.new("./output.csv", "w")
@@txt_file = File.new("./output.txt", "w")
require 'nokogiri'
require 'open-uri'

@@incubation_period_hash = Hash.new

@@web_site = 'http://dragonvale.cyphun.com'
@@dragons_page = @@web_site + "/" + "dragon"
@@base_url = @@dragons_page + "/" + "view"
@@prefix_name = @@base_url

def dragon_name_to_dragon_page dragon_name
  @@base_url + "/" + dragon_name
end

def dragon_page_to_dragon_name dragon_page
  target_dragon_name = dragon_page[@@prefix_name.length,dragon_page.length]
end

# idea here is to get the list of dragons ... I'm able to get the links
def get_dragons

  url = @@dragons_page

  doc = Nokogiri::HTML(open(url))

  # print the links

  link_list = Array.new

  # in another table cell is the incubation period which I can collect in td[something 3 or 4] and parse out the time which is mostly hours, but is hours and minutes in some cases
  # that will be useful later
  # hash of dragon names to incubation time in hours
  doc.xpath("//html//body//div//div//table//tbody//tr//td[1]//a").each do |el|
    @@log.debug  'in the row' if false
    @@log.debug el if false
    @@log.debug el.path if false
    @@log.debug    el.inner_text if false

    href = el.get_attribute("href")
    if href then
      link_list << href
      @@log.debug  href  
    end
    @@log.debug  el.path if false
  end

  @@log.debug  link_list
  p link_list

  @@log.debug  link_list.length

  return link_list
end

# this is the main work horse function which goes to a "target" dragon page and
# collects the information: target, left, right, times, pct
# for now, let's print them out ....

class QtyPctRec
  attr_accessor :qty, :pct

  def initialize(qty, pct)
    @qty = qty
    @pct = pct
  end
end 

class DragonHash
  def initialize
    @hash = Hash.new
  end

  def add d1, d2, qty, pct, result_dragon_name

    @@log.debug d1, d2, qty, pct if false

    if (d1 <=> d2) > 0
      @@log.debug "swapping" if false
      ds1 = d1
      ds2 = d2
    else
      @@log.debug "not swapping" if false
      ds1 = d2
      ds2 = d1
    end

    if @hash.has_key?(ds1) 
      if @hash[ds1].has_key?(ds2)
        # this is the interesting one
        rec = @hash[ds1][ds2]

        new_average = (rec.qty * rec.pct + qty * pct) / (rec.qty + qty)
        rec.qty += qty
        rec.pct = new_average
      else
        @hash[ds1][ds2] = QtyPctRec.new(qty, pct)
      end
    else
      @hash[ds1] = {}
      @hash[ds1][ds2] = QtyPctRec.new(qty, pct)
    end
  end

  def print_it url

    # XXX dragon_name should be passed it ...
    target_dragon_name = dragon_page_to_dragon_name url

    actually_print = true

    @@log.debug "start printing the hash" if false

    arr = Array.new
    
    @hash.each_pair do |k,v|

      v.each_pair do |k1, v1|
        @@log.debug  sprintf "%20s, %20s, %4d, %6.2f", k, k1, v1.qty, v1.pct if false

        arr << [k, k1, v1.qty, v1.pct]

      end
    end

    @@log.debug "end printing the hash" if false

    arr.sort! { |a,b| b[3] <=> a[3] }

    arr.each do |el|
      
      s = sprintf "%20s, %20s, %20s, %4d, %6.0f%%, %3d hours", target_dragon_name, el[0],el[1], el[2], el[3], @@incubation_period_hash[target_dragon_name]

      @@log.debug s

      @@txt_file.puts s

      csv_line = sprintf "%s,%s,%s,%d,%f", target_dragon_name, el[0],el[1], el[2], el[3]

      @@my_file.puts csv_line
    end
  end

end

def Hash.new_multidimensional
  Hash.new { |hash, key| hash[key] = Hash.new_multidimensional }
end

def parse_incubation_period str

  @@log.debug  str

  regex = /([0-9]+) hours/
  m = regex.match str
  
  @@log.debug  m
  @@log.debug  m[0]
  @@log.debug  m[1]

  hours_match_str = m[1]
  hours = hours_match_str.to_i
  @@log.debug  hours
  hours
end

def get_dragon_name str
  regex = /(\w+) /
  m = regex.match str
  drag1_match_str = m[1]
  drag1_match_str
end

def process_dragon url

  # XXX dragon_name should be passed it ...

  dragon_name = dragon_page_to_dragon_name url

  doc = Nokogiri::HTML(open(url))

  @@log.debug  doc if false

  # see if I can find the incubation period ....

  doc.css('h3.r a.l').each do |link|
    @@log.debug link.content
  end

  @@log.debug doc.xpath("//tbody//tr//td") if @debug

# try to find the incubation period, XXX need to learn how to use xpath better

  @@log.debug "start check"
  doc.xpath("/html/body/div[1]/div[3]/div[2]/span").each do |el|

    @@log.debug "path:" + el.path
    
    incubation_period_str = el.inner_text.delete("\n")

    @@log.debug "incubation_period:" + incubation_period_str

    incubation_period_hours = parse_incubation_period incubation_period_str

    @@log.debug "incubation_period_hours:" + incubation_period_hours.to_s

    @@incubation_period_hash[dragon_name] = incubation_period_hours

  end

  @@log.debug "end check"

  if @debug

    doc.xpath("//tbody//tr//td").each do |el|
      @@log.debug el
      @@log.debug el.path
    end

  end

  h = Hash.new_multidimensional

  dh = DragonHash.new

  doc.xpath("//tbody//tr").each do |el|
    @@log.debug el if @debug
    @@log.debug el.path if @debug
    @@log.debug el.xpath("//td[0]") if @debug

    pct_str = el.xpath(".//td[1]").inner_text
    @@log.debug pct_str if @debug
    regex = /([0-9]+\.[0-9]+)%/
    m = regex.match pct_str

    @@log.debug m if @debug
    @@log.debug m[0] if @debug
    @@log.debug m[1] if @debug
    
    pct_res_str = m[1]
    pct = pct_res_str.to_f
    @@log.debug pct

    qty_pre_match_str = el.xpath(".//td[2]").inner_text

    @@log.debug  qty_pre_match_str if @debug

    regex = /([0-9]+)/
    m = regex.match qty_pre_match_str
    qty_match_str = m[1]
    qty = qty_match_str.to_i
    @@log.debug qty

    drag1 = get_dragon_name el.xpath(".//td[3]").inner_text
    @@log.debug drag1

    drag2 = get_dragon_name el.xpath(".//td[4]").inner_text
    @@log.debug drag2

    h[drag1][drag2] = qty

    @@log.debug h if false

    # XXX, not really sure if dragon_name should be passed in here
    dh.add drag1, drag2, qty, pct, dragon_name

    @@log.debug dh if false

    if @debug  
      el.children().each do |child|
        @@log.debug child.path
        @@log.debug child.inner_text
      end

    end

  end

  dh.print_it url

end

def get_stats

  dragons_list = get_dragons

  base_url = @@base_url

  # iterate over each of them

  dragons_list.each do | link |
    dragon_page = web_site + link

    # I need to find a better way to integrate logging with debugging messages
    @@log.debug  "link = #{link}"

    process_dragon dragon_page

  end
end

def process_single_dragon target_dragon_name

  url = dragon_name_to_dragon_page target_dragon_name

  process_dragon url

end

def main

  target_dragon_name = "clover"
  target_dragon_name = "sandstorm"
  target_dragon_name = "frostfire"
  target_dragon_name = "panlong"
  target_dragon_name = "moon"
  target_dragon_name = "frostfire"
  target_dragon_name = "blue-fire"
  target_dragon_name = "bloom"

  # XXX, better way execute this optionally and conveniently while debugging
  if true
    process_single_dragon target_dragon_name
    exit;
  end 

  get_stats

  # the basic next step is:
  # Phase 1:
  # input: a target dragon
  # output a list of dragon pairs with the expected time to get that dragon
  # advanced / phase 2: chances of getting a set of dragons, although right now, I just want
  # a single dragon, a moon
  # sorted in ascending order by dragon pair
  # Phase 2: since I'm actually ok with a dragon pair: sun or moon, the refinement upon this will be how long to get either one
  # Phase 3: interestingly, I mind getting dragons with air elements that I did not intend less, because I can keep growing them to level 10 for not, that might 
  # be a very tertiary concern

  # for the first phase
  # for the target dragon
  # iterate over all the possible pairs
  # for each pair collect the percentage of results for each possible result and then multiply by the incubation of the result
  # do not count the desired target result (or results)
  
  # target dragon to pairs, the pairs, to back to results
  # we already have a hash for a target that we can collect
  # we also need to create a hash for results which is similar
  # targets have a list of pairs
  # pairs have a list of results
  # each dragon has an incubation period
  # result are just 4-tuples, target, left, right, percent
  
end

main

=begin
=end
