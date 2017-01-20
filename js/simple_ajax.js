// Copyright (c) 2014 <Joseph Ellsworth, Bayes Analytic> - See use terms in License.txt
// Add proper error handeling for other
// return status types.

// call the uri with simple get,  collect the results and 
// make a callback when done.  If req_headers is defined
// then it will be ieterated with call to xmlhttp.setRequestHeader for
// each value. 
function simpleGet(uri, callback, passObj)
{
  var xmlHttp=new XMLHttpRequest();
  function stateChanged()
  {
	  if (xmlHttp.readyState == 4)
	  {
      if (xmlHttp.status == 200)
	     callback(xmlHttp.responseText, xmlHttp, passObj);
      else
        callback(null, xmlHttp, passObj)
        //alert('Unhandled AJAX ERROR uri=' + uri + "\nresponseCode=" + xmlHttp.status + " =  " + xmlHttp.statusText);
    }
   }
   xmlHttp.onreadystatechange = stateChanged                      
   xmlHttp.open("GET", uri, true);
   if (passObj.req_headers) {
     for (headKey in passObj.req_headers) {
       xmlHttp.setRequestHeader(headKey, passObj.req_headers[headKey]);
     }
   }
   xmlHttp.send();
}

// make post sending post string to the requested URI
// if passObj.req_headers exists then will ieterate over
// it as a dictionary of keys as header names and values
// and use the xmlhttp.setRequestHeder to send the header
function simplePost(uri, postString, callback, passObj) {
  var xmlHttp = new XMLHttpRequest();
  function stateChanged() {
    if (xmlHttp.readyState == 4) {
      if (xmlHttp.status == 200)
        callback(xmlHttp.responseText, xmlHttp, passObj);
      else
        callback(null, xmlHttp, passObj)
      //alert('Unhandled AJAX ERROR uri=' + uri + "\nresponseCode=" + xmlHttp.status + " =  " + xmlHttp.statusText);
    }
  }
  xmlHttp.onreadystatechange = stateChanged
  xmlHttp.open("POST", uri, true);
  if (passObj.req_headers) {
    for (headKey in passObj.req_headers) {
      xmlHttp.setRequestHeader(headKey, passObj.req_headers[headKey]);
    }
  }
  xmlHttp.send(postString);
}



function simpleGetBlock(uri, errCallback)
{
   var tHttp=new XMLHttpRequest();               
   tHttp.open("GET",uri,false);
   tHttp.send();
   return {'txt' : tHttp.responseText, 'req' : xmlHttp};
}


/* wraps the basic async call for JSON data with basic error checking
 with the JSON parse 
   the method should be in parms.req_method. Currently supports GET and POST
      defaults to GET
   the uri shoudl be in parms.req_uri
   the postbody if present should be in parms.req_post_body
   the outbound headers if present should be in parms.req_headers
 */
function makeJSONCall(parms, callback) {

  function onHTTPData(dataStr, httpObj, parms) {
    if ((dataStr === null) || (dataStr === undefined) || (dataStr.length < 1)) {
      var msg = "ERROR onHTTPUserData Invalid data recieved for " + JSON.stringify(parms);
      if (httpObj) {
        msg += " httpObj=" + httpObj.toString();
      }
      console.log("errors", msg);
      callback(msg, null, parms);
    }
    else {
      try {
        var resObj = JSON.parse(dataStr);
      }
      catch (ex) {
        var msg = "onHTTPData() ERROR parsing " + dataStr + "\nmsg=" + ex.message + "\n" + ex.toString();
        if (httpObj) {
          msg += " httpObj=" + httpObj.toString();
        }
        console.log(msg + " parms=" + JSON.stringify(parms));
        callback(msg, null, parms);
      }
      callback(null, resObj, parms);
    }
  }
  var turi = parms.req_uri;
  if (parms.req_method == "GET") {
    simpleGet(turi, onHTTPData, parms);
  }
  else {
    var postBody = parms.req_post_body;
    simplePost(turi, postBody, onHTTPData, parms);
  }
}

