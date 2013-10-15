from django.core.cache import get_cache

r = get_cache('autosuggest')
dlist = r._client.keys('res*')
for key in dlist:
    r._client.delete(key)

