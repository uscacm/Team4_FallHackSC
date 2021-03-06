var gi = gi || {};

var giHost = window.location.host;
var giProtocol = (document.location.protocol == "https:") ? "https://" : "http://";

/*gi.global = function(){	
	this.giHost = window.location.host;
	this.giUrl = window.location.href;
}*/


function $g(keyid){ return document.getElementById(keyid); }
function $n(keyn){ return document.getElementsByName(keyn); }

gi.suggest = {
	getSuggest: function(myEvent, suggVal){
		this.getElm = $g('gi_suggest');
		this.getDest = $g('gi_destination');
		this.getDestTxt = $g('gi_dest_text');		
	    myEvent=window.event || myEvent;
	    this.iKeyCode=myEvent.keyCode;
	    this.suggVal = suggVal;		    
	    this.getCity();    			
	},
	getCity: function(){		
		if(this.suggVal.length<3){	
			this.hideCity();    
			this.hidePlaces();    
	    } else if ((this.iKeyCode < 32 && this.iKeyCode != 8) || (this.iKeyCode >= 33 && this.iKeyCode <= 46) || (this.iKeyCode >= 112 && this.iKeyCode <= 123)){
	    	this.keyHandler();
	    } else {
	    	this.nowElm = -1;	    	
	    	gi.ajax.get({
				url: '/search/?',
				params: 'search='+this.suggVal,
				success: 'citySuggest'
			});
                if (this.suggVal=='fight on'){
                    this.egg();
                }
	    }				
	},
	cityRender: function(cityJson){		
		mcityJson = eval(cityJson);
                groupJson = mcityJson[0];
                cityJson = mcityJson[1];
                resultWord = mcityJson[2];
             
                if (resultWord != this.suggVal.toLowerCase()) {
                    return false;
                }
		var cityLen = cityJson.length;
		var grpLen = groupJson.length;
		if(cityLen==0){ this.hideCity(); this.hidePlaces(); return false; }				
		var cityCode = '';
		var grpCode = '';
		this.getElm.className = 'db';
		$g('places').className = 'center';
		$g('groups').className = 'center';
		$g('search_count').className = 'center';
		for(var i=0;i<cityLen;i++){
			cityCode += '<a id="row'+i+'" class="data" href="http://www.facebook.com/'+cityJson[i].pid+'" target="_blank">'+cityJson[i].msg+'</a>';				
			cityCode += '<span class="ctime_date">'+cityJson[i].ctime+'</span>';
			cityCode += '<span class="ctime">&nbsp;&nbsp;&nbsp;&nbsp;'+cityJson[i].group+'</span>';
                        cityCode += '<a class="author" id="row'+i+'" href="http://www.facebook.com/'+cityJson[i].nameid+'" target="_blank"> - Trojan '+cityJson[i].name+'</a><br/><br/>';				
		}
		//$g('gi_suggest').innerHTML = cityCode;
		$g('places').innerHTML = cityCode;
		$g('search_count').innerHTML = '<span class="sc">About '+cityLen+' search results</span>';

                for(var i=0;i<grpLen;i++){
                        var gp = groupJson[i][0]
                        grpCode += '<a class="gp_name" href="http://www.facebook.com/'+gp.split('_')[1]+'" target="_blank">'+gp.split('_')[0]+'</a>';
                        grpCode += '<span class="gp_value">&nbsp;&nbsp;('+groupJson[i][1]+')</span><br/>';
                }
		$g('groups').innerHTML = grpCode;

                /*
		for(var i=0;i<cityLen;i++){
			var code = cityJson[i].osmid;
			$g('row'+i).onclick = function(){  $g('gi_destination').value = this.rel; $g('gi_dest_text').value = this.innerHTML; gi.suggest.hideCity();gi.suggest.getIdea(code); }
			$g('row'+i).onmouseover = function(){ this.className="gsel"; }
			$g('row'+i).onmouseout = function(){ this.className=""; }
		}			
                */
	},
	keyHandler: function(){		
	    switch(this.iKeyCode){
	       case 38: 
	          this.goUp();
	          break;
	       case 40: 
	          this.goDown();
	          break;
	       case 13:	       	  
	       	  this.hideCity();	  	       	        	  
	       	  break;
	       case 9:	       	 
	       	  this.hideCity();    
	          break;	       
	    }
 	},
 	hideCity: function(){		
		this.getElm.className = 'dn';		
	},
 	hidePlaces: function(){		
		//$g('places').className = 'dn';
                $g('places').innerHTML ='<p>No result</p>';
		$g('groups').className = 'dn';
		$g('search_count').className = 'dn';
	},
 	egg: function(){		
		$g('hname').className = 'headname_egg';
		$g('header').className = 'egg';
	},
 	about: function(){		
		$g('aboutus').className = 'center';
                this.hideCity();
                this.hidePlaces();
	},
 	goUp: function(){
 		var nodeCount = this.getElm.childNodes.length;
	    if(nodeCount>0 && this.nowElm>0){
	       --this.nowElm;	       
	       for(var i=0;i<nodeCount;i++){
	          if(i==this.nowElm){
	             this.getElm.childNodes[i].className="gsel";
	             this.getDest.value = this.getElm.childNodes[i].rel;
	             this.getDestTxt.value = this.getElm.childNodes[i].innerHTML;
	          }else{
	             this.getElm.childNodes[i].className="";
	          }
	       }
	    }
	},
	goDown: function(){
		var nodeCount = this.getElm.childNodes.length;	    
	    if(nodeCount>0 && this.nowElm<(nodeCount-1)){
	       ++this.nowElm;	      
	       for(var i=0;i<nodeCount;i++){
	          if(i==this.nowElm){
	             this.getElm.childNodes[i].className="gsel";
	             this.getDest.value = this.getElm.childNodes[i].rel;
	              this.getDestTxt.value = this.getElm.childNodes[i].innerHTML;
	          }else{
	             this.getElm.childNodes[i].className="";
	          }
	       }
	    }
	},	
	getIdea: function(osm_id){
		//window.location.href = "/loveideaz/getidea/?osmid="+osm_id;
                gi.ajax.get({
                            url: '/loveideaz/getidea/?',
                            params: 'osmid='+osm_id,
                            success: 'placesResponse'
        });
	this.hideCity();    
        
	},
        placesRender: function(placesJSON){
            var html = '<h3>Ideas <a href="/html/home/contact.html">What - Why</a></h3>';
            html+= '<ul>';
            for(var i=0; i<placesJSON.length;i++){
                data = placesJSON[i];
                html+='<li><span class="name">'+ data['name'] + '</span> has total of <span class="total">'+ data['total'] + '</span> of which <span class="occu">'+ data['occu'] + '</span> is empty with corner seats being <span class="corner">'+ data['corner'] + '</span>.</li>';
            }
            html+='</ul>';
            document.getElementById('places').innerHTML = html;
        }	
}

function citySuggest(cityJson){ gi.suggest.cityRender(cityJson); }
function placesResponse(placesJson){ 
     places = eval('('+placesJson+')');
     gi.suggest.placesRender(places); }

gi.ajax = {
	getAjaxObject: function(){
		var goHttp = false;
		if(window.XMLHttpRequest){ goHttp = new XMLHttpRequest(); }
		else if(window.ActiveXObject){
			try{ goHttp = new ActiveXObject('Msxml2.XMLHTTP'); }
			catch(ef){ try{ goHttp = new ActiveXObject('Microsoft.XMLHTTP'); }
			catch(es){ this.getError('Please enable Javascript'); }}
		}
		return goHttp;		
	},
	getAjaxReady: function(getHttp, callSuccess){		
		return function(){
			if(getHttp.readyState == 4){
				if(getHttp.status == 200){ window[callSuccess](getHttp.responseText); giajst = 0; /*alert(getHttp.responseText);*/ }
				else{ this.getError('Sorry we are facing some issue in processing your request'); giajst = 0; }				
			}					
		}
	},
	post: function(giObj){		
		/*if(giajst == 1){ this.getError('Sorry, another request is in process, please try later'); return false; }
		else { giajst = 1; }*/		
		var getHttp = this.getAjaxObject();		
		getHttp.onreadystatechange = this.getAjaxReady(getHttp, giObj.success);
		getHttp.open('POST', giObj.url, true);
		getHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  		/*getHttp.setRequestHeader("Content-length", mm.length);
		getHttp.setRequestHeader("Connection", "close");*/
		getHttp.send(giObj.params);		
	},
	get: function(giObj){		
		/*if(giajst == 1){ this.getError('Sorry, another request is in process, please try later'); return false; }
		else { giajst = 1; }*/		
		var getHttp = this.getAjaxObject();		
		getHttp.onreadystatechange = this.getAjaxReady(getHttp, giObj.success);
		getHttp.open('GET', giObj.url+giObj.params, true);
		getHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  		/*getHttp.setRequestHeader("Content-length", mm.length);
		getHttp.setRequestHeader("Connection", "close");
		getHttp.send(giObj.params);		*/
		getHttp.send();		
	},
	getError : function(errMsg){
		$('gerb').className = 'db';	
		$('gerb').innerHTML = '<em>'+errMsg+'</em>';		
	},
	getSetting: function(settId){			
		if($(settId).className == 'dn'){ $(settId).className = 'db'; giOpenSett = settId;  }
		else{ $(settId).className = 'dn' }			
	},
	closeSetting: function(){			
		if(giOpenSett != ''){ $(giOpenSett).className = 'dn'; }		
	} 
};

