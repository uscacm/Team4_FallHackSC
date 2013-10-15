from suggest.models import Dump, Temp
from django.core.cache import get_cache

class AutoSuggestFiller():
    def __init__(self):
        self.r = get_cache('autosuggest')

    def setup(self): 
        """
        Set up the data store
        """
        #sentences = [ "Take out the trash", "Talk to the school bus driver" ]
        #for dmp in Dump.objects.all():
        for dmp in Temp.objects.all():
            index = int(dmp.pid.split('_')[1])
            #sentence = "%s : %s : %s : %s" % (attr.name, attr.suburb, attr.city, attr.state)
            sentence = dmp.msg
            name = dmp.name
            nameid = dmp.nameid
            ctime = dmp.ctime
            group = dmp.gp
            gid = dmp.gid
            name_temp = name.replace(' ',' @')
            sentence_temp = sentence.lower()
            #print 'Adding %s' % sentence
            self.addSentence(sentence,index)
            self.addMeta(index, name, nameid, ctime, group, gid);
            self.addWordPrefix(sentence_temp, index)
            self.addWordPrefix('@'+name_temp.lower(), index)

    def addSentence(self, sentence, hashes):
        """
        Add the complete sentence in the hashes
        """
        self.r._client.hset('task',hashes, sentence)

    def addMeta(self, hashes, name, nameid, ctime, group, gid):
        """
        Add the complete sentence in the hashes
        """
        self.r._client.hset(hashes, 'name', name)
        self.r._client.hset(hashes, 'nameid', nameid)
        self.r._client.hset(hashes, 'ctime', ctime)
        self.r._client.hset(hashes, 'group', group)
        self.r._client.hset(hashes, 'gid', gid)

    def addWordPrefix(self, sentence, hashes):
        """
        Adding the prefixes in the sorted set
        """
        for word in sentence.split(' '):
            for index,letter in enumerate(word.strip()):
                # Deletermin the prefix
                prefix = word[:index+1]
                # Add the prefix to the set along with the sentence hashes
                #print 'Adding task:%s' % prefix
                self.r._client.zadd('task:%s'%prefix, hashes, 0)

a = AutoSuggestFiller()
a.setup()
