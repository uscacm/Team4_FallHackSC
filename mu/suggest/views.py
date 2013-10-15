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
#logg_stats = logging.getLogger("travelLoggerSTATS")

def home(request):
    """
    Landing method
    """
    #logg.info("Land")
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
            #logg_stats.info("Keyword\t%s" % (searchWord))
            airList = []
            airList, group_dict = searchincludespace(searchWord)
            group_dict= sorted(group_dict.items(), key=itemgetter(1), reverse=True)
            result = [ group_dict[:4], airList ]
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
    return answer(reversed(hashes_list))

def answer(hashes_list):
    """
    All the sentences corresponding
    to the hashes dreived
    """
    suggList = []
    group_dict = {}
    r = get_cache('autosuggest')
    count = 0
    for hashes in hashes_list:
        di = {}
        result = r._client.hget("task", hashes)
        data = r._client.hgetall(hashes)

        di['msg'] = result
        di['nameid'] = data['nameid']
        di['name'] = data['name']
        di['pid'] = hashes
        ctime = data['ctime']
        ctime = datetime.strptime(ctime.split(' ')[0], '%Y-%m-%d')
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
        count+=1
        if count > 1000:
            break
    return suggList, group_dict
