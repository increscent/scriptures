from bs4 import BeautifulSoup
import json
import collections
import os

#
def import_xhtml(file):
	contents = open('epub/' + file, 'r').read()
	return contents

#
def export_json(file, content):
	end = file.rfind('/')
	if not end == -1:
		directory = file[:end]
		if not os.path.exists(directory):
			os.makedirs(directory)
	open(file, 'w').write(json.dumps(content))

# parse list in file
def parse_ul(html, ul_id = False):
	result = []
	i = 0
	ul_list = html.ul
	if ul_id:
		ul_list = html.find('ul', {'id': ul_id})
	for child in ul_list.findChildren('li'):
		item = {}
		item['link'] = child.a['href']
		item['name'] = child.a.text
		result.append(item)
		i += 1
	return result

# get abbreviation from link
def get_abbr(link):
	start = 0
	if (link.rfind('000_') != -1):
		start = link.rfind('000_') + 4;
	end = link.rfind('.')
	return link[start:end]

#
def parse_work(abbr, index_list):
	index[abbr]['books'] = collections.OrderedDict()
	for item in index_list:
		book = {}
		book_abbr = get_abbr(item['link'])
		book_name = item['name']
		book_chapters = 0
		book_index_list = []
		# items to skip
		if item['link'].find('toc') != -1:
			continue
		elif item['link'].find('dc_chron-order') != -1:
			continue
		elif item['link'].find('bofm_explanation') != -1:
			continue
		elif item['link'].find('bofm-title') != -1:
			continue
		# items with multiple individual chapters that need to be consolidated
		elif item['name'].find('Section') != -1:
			book_abbr = 'section'
			book_name = 'Sections'
			book_chapters = 138
			chapter = {}
			chapter['link'] = item['link']
			book_index_list.append(chapter)
		elif item['name'].find('Book Of Moses') != -1:
			book_abbr = 'moses'
			book_name = 'Moses'
			book_chapters = 8
			chapter = {}
			chapter['link'] = item['link']
			book_index_list.append(chapter)
		elif item['name'].find('Book Of Abraham') != -1:
			book_abbr = 'abr'
			book_name = 'Abraham'
			book_chapters = 5
			chapter = {}
			chapter['link'] = item['link']
			book_index_list.append(chapter)
		# items that link directly
		elif item['link'].find('Text') != -1:
			book_chapters = 1
			chapter = {}
			chapter['link'] = item['link']
			book_index_list.append(chapter)
		# normal items
		else:
			book_name = book_name.replace('The ', '')
			book_name = book_name.replace('Book Of ', '')
			book_index = BeautifulSoup(import_xhtml(item['link']))
			book_index_list = parse_ul(book_index)
			book_chapters = len(book_index_list)
		
		if item['name'].find('Matthew An Extract') != -1:
			book_name = 'Joseph Smith - Matthew'
		
		save_book(abbr, book_abbr, book_index_list)
		
		book['abbr'] = book_abbr
		book['name'] = book_name
		book['chapters'] = book_chapters
		index[abbr]['books'][book_abbr] = book

# save all the chapters in a book to separate files and to one big file
def save_book(work_abbr, book_abbr, book_index_list):
	i = 0
	for item in book_index_list:
		chapter_contents = BeautifulSoup(import_xhtml(item['link']))
		chapter = parse_chapter(chapter_contents)
		
		i += 1
		# check for dc section
		if chapter_contents.h2 and chapter_contents.h2.text.find('SECTION') != -1:
			i = int(chapter_contents.h2.text.replace('SECTION ', ''))
		# check for moses or abraham chapter
		if chapter_contents.h1 and (chapter_contents.h1.text.find('BOOK OF MOSES') != -1 or chapter_contents.h1.text.find('THE BOOK OF ABRAHAM') != -1):
			i = int(chapter_contents.h2.text.replace('CHAPTER ', ''))
		export_json(work_abbr + '/' + book_abbr + '/' + book_abbr + str(i), chapter)

#
def parse_chapter(chapter_contents):
	chapter = {}
	chapter['book_name'] = chapter_contents.h1.text
	if chapter_contents.h2 and chapter_contents.h2.text.find('SECTION') != -1:
		chapter['book_name'] = 'Section'
	# extended summary
	if chapter_contents.h2 and chapter_contents.h2.findNext('h2'):
		chapter['extended_summary'] = chapter_contents.h2.findNext('h2').text
	# summary
	if chapter_contents.h3:
		chapter['summary'] = chapter_contents.h3.text
	# more summary
	if chapter_contents.h4:
		chapter['more_summary'] = chapter_contents.h4.text
	# no verse numbers
	try:
		chapter_contents.p.span.text
	except:
		chapter['no_verse_numbers'] = True
	#
	chapter['verses'] = []
	# first verse
	verse = parse_verse(chapter_contents.p)
	chapter['verses'].append(verse);
	# all verses
	for element in chapter_contents.p.findNextSiblings():
		verse = parse_verse(element)
		if not verse:
			continue
		chapter['verses'].append(verse)
	
	return chapter

#
def parse_verse(element):
	try:
		verse = element.text
		# remove verse numbers
		if element.span:
			verse = verse.replace(element.span.text, '', 1)
	except:
		return False
	return verse

#
def consolidate_chapters():
	for work_abbr in index:
		for book_abbr in index[work_abbr]['books']:
			all_chapters = collections.OrderedDict()
			all_chapters['abbr'] = book_abbr
			directory = work_abbr + '/' + book_abbr
			for file in os.listdir(directory):
				if file == book_abbr:
					continue
				chapter_file = open(directory + '/' + file, 'r').read()
				chapter_json = json.loads(chapter_file)
				# chapter number
				chapter_number = file.replace(book_abbr, '')
				all_chapters[chapter_number] = chapter_json
			# all chapters file
			export_json(directory + '/' + book_abbr, all_chapters)
	
# index
index = collections.OrderedDict()

# open general table of contents and parse it
#contents = BeautifulSoup(import_xhtml('contents.xhtml'))
#
#for child in contents.ul.findChildren('li'):
#	link = child.a['href']
#	abbr = link[0:link.find('.')]
#	name = child.a.text
#	index[abbr] = {}
#	index[abbr]['name'] = name

# bible (kjv)
bible_index = BeautifulSoup(import_xhtml('bible.xhtml'))
# old testament
abbr = 'ot_kjv'
index[abbr] = {}
index[abbr]['abbr'] = abbr
index[abbr]['name'] = 'Old Testament (KJV)'
ot_index_list = parse_ul(bible_index, 'oldTest')
parse_work(abbr, ot_index_list)
# new testament
abbr = 'nt_kjv'
index[abbr] = {}
index[abbr]['abbr'] = abbr
index[abbr]['name'] = 'New Testament (KJV)'
nt_index_list = parse_ul(bible_index, 'newTest')
parse_work(abbr, nt_index_list)

# book of mormon
bofm_index = BeautifulSoup(import_xhtml('bofm.xhtml'))

abbr = 'bofm'
index[abbr] = {}
index[abbr]['abbr'] = abbr
index[abbr]['name'] = 'Book of Mormon'
bofm_index_list = parse_ul(bofm_index)
parse_work(abbr, bofm_index_list)

# doctrine & covenants
dc_index = BeautifulSoup(import_xhtml('dc-testament.xhtml'))

abbr = 'dc'
index[abbr] = {}
index[abbr]['abbr'] = abbr
index[abbr]['name'] = 'Doctrine & Covenants'
dc_index_list = parse_ul(dc_index)
parse_work(abbr, dc_index_list)

# pearl of great price
pgp_index = BeautifulSoup(import_xhtml('pgp.xhtml'))

abbr = 'pgp'
index[abbr] = {}
index[abbr]['abbr'] = abbr
index[abbr]['name'] = 'Pearl of Great Price'
pgp_index_list = parse_ul(pgp_index)
parse_work(abbr, pgp_index_list)

# consolidate chapters in books using index
consolidate_chapters()
# write index
export_json('index.json', index)