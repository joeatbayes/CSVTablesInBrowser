// (C) Joseph Ellsworth 2008.  License for use granted under MIT license.  http://opensource.org/licenses/MIT
// require str_buf.js
 function curr_time()
 {
    var tdate = new Date();
    return tdate.getTime();
 }


/****************
*** C L A S S ***
*****************
Single Timer class normally used by
eltimer */
function Stimer(name_in, start_time) 
{
  this.aname = name_in;
  this.astart = start_time ;
  this.afirst = start_time;
  this.astop = 0;
  this.aelap = 0;

  
  function stop(tstop)
  {
 	 if (tstop == undefined)
	 { 
	   tstop = curr_time();
	 }
	 
   /* our timer is running */
	 if (this.astart > 0)
	 {
	   this.astop = tstop;
	   this.aelap = this.aelap + (this.astop - this.astart);	   
	 }
	 this.astart = -1;
  }
  
  
  
  /* starts labeld timer */
  function start(stime)
  {
    if (stime == undefined)
   {
      this.astart = curr_time();
	 }
	 else
	 {
	    this.astart = stime;
	  }
  }
      
  function as_json_obj(stime) {
    return { 
      'name' : this.aname,
      'first': this.afirst - stime,
      'stop': this.astop - stime,
      'elap': this.aelap
    };
  }
  
  // - - - - - - - -
  // Assign instance methods
  // - - - - - - - -
  this.stop = stop;
  this.start = start;
  this.as_json_obj = as_json_obj;
  
} // end class


 
/****************
*** C L A S S ***
*****************
*  ac_timer is a hash containing unique entery for
*  each label.  A label can be started and stopped
*  multiple times.   Inclues utility to dump as
*  hash for easy reporting to server.
*  p1 = sid = sessionId
*  p2 = rid = requestID
*  p3 = appName = unique name for the app
*  p4 = pstart = time to use as timer start. 
*  p5 = reportURI = URI to post timing back to client.
*/
// * * * * * * * * * * * * * *
function Eltimer(sid, rid, appName, pstart, reportURI) 
// * * * * * * * * * * * * * *
{
   this.timers = {}
   this.myrid = rid;
   this.mysid = sid;
   this.myquery="..";
   this.myuri = "..";
   this.reportURI = reportURI;
   this.complete = false;
   if ((appName !== undefined) && (appName !== ""))
     this.app = { "name": appName };
   else { this.app = {} };

   this.maxWaitBeforeReport = 15000;

   if (pstart == undefined) 
   {
     pstart = curr_time();
   }
   this.astart = pstart;
   this.first  = pstart;
   
   if (this.aid == undefined)   
   {
     this.aid = 0;
   }
   
   function set_query(aquery)
   {
     this.my_query = aquery;
   }
   
   function set_uri(auri)
   {
     this.my_uri = auri;
   }
   
   
   // retrieve a timer at label if it does not
   // exist then make a new one. 
   function get(aname, ptime)
   {
     var tti = this.timers[aname];
     if (tti == undefined)
     {
       if (ptime == undefined)
       {
         ptime = curr_time();
       }
       
       tti =  new Stimer(aname, ptime);
       this.timers[aname] = tti;
     }              
	   return tti
   }
   
   
  /* starts labeld timer */
  function start(alabel, tstart)
  {
      this.get(alabel,tstart).start(tstart);
  }
    
  function stop(tname, tstop)
  {
     this.get(tname).stop(tstop);
  }

  function stop_all()
  {
     for (var akey in this.timers)
     {
       this.timers[akey].stop();
     }
  }

  function to_json_obj()
  {
    if (this.myquery == "..") {
      this.parse_uri();
    }
    if (this.myquery !== "..") {
      if ((this.myquery.rid !== undefined) && (this.myrid === "")) { this.myrid = this.myquery.rid; delete this.myquery.rid;}
      if ((this.myquery.sid !== undefined) && (this.mysid === "")) { this.mysid = this.myquery.sid; delete this.myquery.sid;}
      if ((this.myquery.app !== undefined) && (this.app.name === undefined)) { this.app.name = this.myquery.app; delete this.myquery.app; }
    }
    var tout = {
      'rid': this.myrid,
      'sid': this.mysid,
      'query': this.myquery,
      'uri': this.myuri,
      'app' : this.app,
      'timers': {}
    };
    var ttimers = tout["timers"];    
    for (var akey in this.timers)
    {     
      var jtobj = this.timers[akey].as_json_obj(this.astart);
      var tname = jtobj.name;
      delete jtobj.name;
      ttimers[tname] = jtobj;
    }  	
    return tout;
  }

  function to_str()
  {
    var tobj = this.to_json_obj();
    var tstr = JSON.stringify(this.to_json_obj());
    return tstr;
  }

  /* inserts our serialized representation 
  * into a div structure by ID name
  */  
  function to_div(div_name)
  {
    var tb = new Strbuf();    
    tb.b(this.to_str());    
    tb.to_div(div_name);  
  }  	
    
  function log(cons, astr)
  {
     if (astr != undefined)
     {
         cons.log(astr)
     }
     var astr = this.to_str();
     cons.log(astr);	 
  }

 /* parse the current document URI and query parms into 
 the instance variables this.myuri and this.myquery.  If the
 values for myuri and myquery are already set then it will
 skip setting them from the URI line.  This allows the page
 to send custom information */
  function parse_uri()
  {
    if (this.myuri == "..") {
      var tt = window.location.href;
      var tarr = tt.split("?", 2);
      this.myuri = tarr[0];
      if ((tarr.length > 1) && (this.myquery == "..")) {
        var myquery = {};
        this.myquery = myquery;
        var tarr = tarr[1].split("&");
        for (var ndx in tarr) {
          var qp = tarr[ndx];
          if (qp.length > 0) {
            var qpa = qp.split("=");
            if (qpa.length == 1) {
              myquery[qp] = "";
            }
            else {
              var pname = qpa.shift();
              myquery[pname] = qpa.join("=");
            }
          }
        }
      }
    }
  }
 
 
  /* sends my accumulated timers
  * back to the server in the form
  * of a post to a URI.
  *  SID = session ID - session is shared for all requests a user makes during given session
  *  RID = request ID - Request is unique for each page requested but shared across all AJAX requests for a given page.
  */
  function report(auri)
  {
    //this.parse_uri();
    var astr = this.to_str();
    var ahttp = new XMLHttpRequest();
    ahttp.open("POST", auri, true)
    ahttp.setRequestHeader("rid", this.myrid);
    ahttp.setRequestHeader("sid", this.mysid);
    ahttp.setRequestHeader("query", this.myquery);
    ahttp.setRequestHeader("uri", this.myuri);    
    ahttp.setRequestHeader("content-type", "text/json");
    //ahttp.setRequestHeader("content-length", astr.length);
    ahttp.send(astr);
    
    // don't care if we get a response so no callback.	    
  }

  // Attempt to report timers once per second until GPageComplete is true or report
  // anyway if more than 10 seconds elapses. 
  function setup_auto_try_report(maxWaitBeforeReport) {
    if (maxWaitBeforeReport !== undefined) {
      this.maxWaitBeforeReport = maxWaitBeforeReport;
    }
    var me = this; // copy this to me as local variable because this will not be set in callback.
    function report_timers() {
      me.stop_all();  
      if (me.complete || (curr_time() - me.start > 15000)) {
        me.to_div("timers");
        me.log(window.console, "page complete");
        if (me.reportURI !== undefined) {
          me.report(me.reportURI); // fire and forget report to server
        }
      }
      else {
        // setup retry if couldn't report this time.
        window.setTimeout(report_timers, 1000);
      }
    }
    // setup first try.
    window.setTimeout(report_timers, 1000); 
  }


  //Set up method pointers
  this.get = get;
  this.start = start;
  this.stop = stop;
  this.stop_all = stop_all
  this.to_str = to_str;  
  this.to_json_obj = to_json_obj;
  this.to_div = to_div;
  this.report = report; 
  this.parse_uri = parse_uri;
  this.setup_auto_try_report = setup_auto_try_report;
  this.log = log;
  



} // end class


