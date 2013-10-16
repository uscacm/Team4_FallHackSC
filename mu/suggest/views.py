import re
import random
import logging
import simplejson
from datetime import datetime
from operator import itemgetter
from django.http import HttpResponse
from django.core.cache import get_cache
from django.template import RequestContext
from django.shortcuts import render_to_response

logg = logging.getLogger("travelLogger")
logg_stats = logging.getLogger("travelLoggerSTATS")

def home(request):
    """
    Landing method
    """
    logg.info("Land")
    return render_to_response('home/home.html',{}, RequestContext(request, { }) )

def autosuggest(request):
    """
    Auto suggest landing method
    """
    logg.info("Search")
    try:
        if (request.GET.has_key('search')):
            searchWord = request.GET['search'].lower()
            logg.info("Search_Inside")
            logg_stats.info("Keyword\t%s" % (searchWord))
            airList = []
            airList, group_dict = searchincludespace(searchWord)
            airList = sorted(airList, key=lambda k: k['cotime'], reverse=True) 
            group_dict= sorted(group_dict.items(), key=itemgetter(1), reverse=True)
            result = [ group_dict[:4], airList, searchWord ]
            return HttpResponse(simplejson.dumps(result))
        else:
            return HttpResponse('{"result":"failed","desc":"No Matches Found"}')
    except Exception,e:
        return HttpResponse('{"result":"failed","desc":"No Matches Found"}')

def searchincludespace(words):
    """
    Search in case of multiple words
    """
    uid = str(random.randint(1,100))
    r = get_cache('autosuggest')
    set_list = ["task:%s"%word for word in words.split(' ')]
    res = r._client.zinterstore("res"+uid, set_list)
    hashes_list = r._client.zrange(name="res"+uid, start=0, end=-1)
    r._client.delete("res"+uid)
    return answer(hashes_list, words)

def answer(hashes_list, words):
    """
    All the sentences corresponding
    to the hashes dreived
    """
    suggList = []
    group_dict = {}
    r = get_cache('autosuggest')
    for hashes in hashes_list[:1000]:
        di = {}
        result = r._client.hget("task", hashes)
        data = r._client.hgetall(hashes)

        for word in words.split(' '):
            result = re.sub(r'(?i)%s'%word, '<span>'+word+'</span>', result)
        di['msg'] = result
        di['nameid'] = data['nameid']
        di['name'] = data['name']
        di['pid'] = hashes
        ctime = data['ctime']
        ctime = datetime.strptime(ctime.split(' ')[0], '%Y-%m-%d')
        di['cotime'] = int("%d%02d%02d" % ( ctime.year, ctime.month, ctime.day))
        di['ctime'] = str(ctime.day) + ' ' + ctime.strftime("%B") + ' ' + str(ctime.year)
        gp = data['group']
        gid = data['gid']
        di['group'] = gp
        key = gp+'_'+gid
        if group_dict.has_key(key): 
            group_dict[key]+=1
        else:
            group_dict[key] = 1;
        suggList.append(di)
    return suggList, group_dict
