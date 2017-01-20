// Copyright (c) 2014 <Joseph Ellsworth, Bayes Analytic> - See use terms in License.txt

var exports = {} // to allow the node style exports.

function numberWithCommas(n)
{
  var parts = n.toString().split(".");
  return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
}

function comma_formated(aVal, numDec)
{  
  var tnum = aVal;
  if (isString(tnum)) tnum = parseFloat(tnum.trim());
  tnum = tnum.toFixed(numDec);
  tnum = numberWithCommas(tnum);
  return tnum;
}


function spacePad(aStr, plen) {
  var tout = "        " + aStr;
  while (tout.length < plen) {
    tout = "                " + tout;
  }
  return tout.substr(tout.length - plen);
}

/* Return Current time in float which contains
 seconds and fractional seconds */
function curr_time() {
  var tdate = new Date();
  return tdate.getTime();
}

function elap(oldtime) {
  return (new Date().getTime()) - oldtime;
}

function isObject(aVar) {
  return (aVar instanceof Object);
}
function isArray(aVar)
{
  return (aVar instanceof Array);
}

function isString(aVar)
{
  return (typeof aVar === 'string')
}

function isFloat(aVar)
{
  return ((typeof aVar === 'float') || (typeof aVar === 'number'))
}

function isInt(aVar)
{
  return ((typeof aVar === 'int') || (typeof aVar === 'number'))
}

function isNum(aVar)
{
  return ((typeof aVar === 'number') || (isFloat(aVar)) || (isInt(aVar)))
}

if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str) {
    return this.indexOf(str) == 0;
  }
}


function RandRange(pmin, pmax) {
  var range = pmax - pmin;
  var randNum = Math.random();
  var portRange = randNum * range;
  return pmin + portRange;
}



function showDiv(divId)
{
  var tdiv = document.getElementById(divId);
  if ((tdiv !== undefined) && (tdiv !== null))
  {
    tdiv.style.display = "block";
  }
  return tdiv
}

function toDiv(divId, message)
{
  var tdiv = document.getElementById(divId);
  if ((tdiv == undefined) || (tdiv == null))
  {
    tdiv = document.createElement("div");
    tdiv.id = divId;
    document.body.appendChild(tdiv);
  }
  tdiv.innerHTML = message;
}
set_div_contents = toDiv;
to_div = toDiv;


function appendDiv(divId, message)
{
  var tdiv = document.getElementById(divId);
  if ((tdiv !== undefined) && (tdiv !== null))
  {
    tdiv.innerHTML += message;
  }
}
set_div_contents = toDiv;

function divp(divId, astr)
{
  var tdiv = document.getElementById(divId);
  if ((tdiv !== undefined)  && (tdiv !== null))
  {
    tdiv.innerHTML += astr;
  }
}


function getFormValue(divId) {
  var tdiv = document.getElementById(divId);
  if ((tdiv !== undefined) && (tdiv !== null)) {
    return tdiv.value;
  }
  return undefined;
}



function Status_div(divId)
{
  this.divId = divId;
  this.sdiv = undefined;

  this.check_div = function()
  {
    if (this.sdiv === undefined)
      this.sdiv = document.getElementById(divId);
    return this;
  }

  this.log = function(msg)
  {
    this.check_div();
    if (this.sdiv !== undefined)
      this.sdiv.innerHTML += msg;
    return this;
  }

  this.clear = function()
  {
    this.check_div();
    if (this.sdiv !== undefined)
      this.sdiv.innerHTML = "";
    return this;
  }

  this.br = function()
  {
    this.check_div();
    if (this.sdiv !== undefined)
      this.sdiv.innerHTML += "<br/>";
    return this;
  }
  return this;
}

var sQuote = '\'';
var sQuoteEscaped = '\\\'';

var dQuote = '\"';
var dQuoteEscaped = '\\\"';


String.prototype.replaceAll = function(token1, token2)
{
  var tarr = this.split(token1);
  return tarr.join(token2);
}


function RenderTag(tagName, attr, autoClose) {
  var sb = [];
  sb.push("<" + tagName);
  for (var vkey in attr) {
    var vval = attr[vkey];
    sb.push(" " + vkey + "=\"" + vval + "\"");
  }
  if (autoClose == true) {
    sb.push("/>");
  }
  else {
    sb.push(">");
  };
  return sb.join("");
}

/*  Parse HTTP Query String and return a dictonary 
 containing the parameter names as keys and the 
 values as strings */
function parseQueryStr(qstr) {
  var segs = qstr.split('&');
  var q = {}
  for (var i = 0; i < segs.length; i++) {
    var pair = segs[i].split('=');
    q[pair[0]] = decodeURIComponent(pair[1]);

  }
  return q;
}
exports.parseQueryStr = parseQueryStr;


/* Produce a properly URI escaped query URI where the query 
paramters are supplied with the tag names as keys in a dictionary
and values are the encodeURI verison of those values.  All values
must be strings before calling this function.   */
function makeURIWithQueryString(uriPrefix, parms) {
  b = []
  for (akey in parms) {
    b.push(akey + "=" + encodeURI(parms[akey]));
  }
  return uriPrefix + "?" + b.join("&");
}



function String_builder() {
  this.sb = [];
  this.sb.b = this.sb.push;
  return this;
}


/* ************
*** String_Builder 
************** */
String_builder.prototype.to_str = function()
{
  return this.sb.join("")
}

String_builder.prototype.toString = function ()
{
  return this.sb.join("")
}

String_builder.prototype.clear = function()
{
  this.sb = [];
}

String_builder.prototype.b = function (pStr)
{
  this.sb.push(pStr);
  return this;
}

String_builder.prototype.add = String_builder.prototype.b;
String_builder.prototype.push = String_builder.prototype.b;


String_builder.prototype.insert = function (pStr) {
  this.sb.unshift(pStr);
  return this;
}


String_builder.prototype.br = function ()
{
  this.push("<br/>");
  return this;
}

String_builder.prototype.hr = function ()
{
  this.push("<hr/>");
  return this;
}

String_builder.prototype.nl = function ()
{
  this.push("\n");
  return this;
}


// Produce a HTML element with a bunch of
// attributes.    Properly escapes the attribute
// values.
String_builder.prototype.start_element =function(elementName, attribs)
{
   var sb = this.sb;
   sb.push("<" + elementName)
   for (var tName in attribs)
   {
     var tVal = attribs[tName].toString().replaceAll(dQuote,dQuoteEscaped);
     sb.push(" " + tName + "=" + dQuote + tVal + dQuote);
   }
   sb.push(">");
   return this;
}

String_builder.prototype.start = String_builder.prototype.start_element;


String_builder.prototype.finish_element = function (elementName)
{
  this.sb.push("</" + elementName + ">");
  return this;
}
String_builder.prototype.finish = String_builder.prototype.finish_element;

String_builder.prototype.EndElement = function (elementName) {
  this.sb.push("</" + elementName + ">");
  return this;
}

String_builder.prototype.make_element = function (elementName, attribs, bodyStr)
{
  this.start_element(elementName, attribs);
  this.push(bodyStr);
  this.finish_element(elementName);
  return this;
}

String_builder.prototype.make = String_builder.prototype.make_element;


String_builder.prototype.toDiv = function (div_or_name) {
  toDiv(div_or_name, this.to_str());
}


String_builder.prototype.to_div = function (div_or_name)
{
  toDiv(div_or_name, this.to_str());  
}



String_builder.prototype.td =  function(pStr)
{
  this.push("<td>").push(pStr).push("</td>");
}



String_builder.prototype.Render = function(tagName, attr, autoClose) {  
  this.push(RenderTag(tagName, attr, autoClose));
}



/* Adds a labeled input fields based ona the supplied field specification.  Creates a series
   of field id and classes to make each individual element addressable via css selectors and
   to access by unique document id.  

   Currently only supports simple text style input fields not radio group
   { fldName: "first_name", type: 'text', size: 30, 'class' : 'inputFieldClass, 'size' : myFieldSize, 'type' : 'myfieldtype'  },
     where 
       class = the class to set create the field with.
       size =  the size to create the field with 
       type =  the type parameter used in the input file.

    TODO: Extend to support radio_button, Scroll, Checkbox.*/
String_builder.prototype.addInputField = function addInputField(fieldSpec) {  
  var fldName = fieldSpec.fldName;
  var fldNameForId = fldName;
  if (fieldSpec.idPrefix !== undefined) {
    fldNameForId = fieldSpec.idPrefix + "_" + fldNameForId;
  }
  var chgact = fieldSpec.onchange + "('" + fldName + "');"
  var frmName = "frm_" + fldNameForId;
  var labelClass = "frm_label"
  var errorClass = "frm_err";
  var errorId = "frm_msg_" + fldNameForId;
  var dspName = "frm_msg_" + fldNameForId;
  var label = fldName.toUpperCase().replaceAll("_", " ");
  if (fieldSpec.label !== undefined) {
    label = fieldSpec.label;
  }
  var grpId = "frm_grp_" + fldNameForId;
  var grp_class = 'form_grp form_grp_' + fldNameForId;

  var inpFldAttr = {
    size: fieldSpec.size,
    'id': frmName,
    'onkeyup': chgact,
    'onchange': chgact,
    'type': fieldSpec.type
  }
  if (fieldSpec.class !== undefined) {
    inpFldAttr.class = fieldSpec.class;
  }

  var errInpAttr = { 'class': errorClass, 'id': errorId };

  this.start("div", { 'class': grp_class, 'id': grpId });

  this.start("div", { 'class': 'form_label' });
  if (fieldSpec.leadingIcon) {
    this.make("span", fieldSpec.leadingIcon);
  }
  this.add(label);
  this.finish("div") // label

  this.start("input", inpFldAttr);
  this.make("span", errInpAttr, "");
  this.finish("input");
  this.finish("div");
}

/* Add a group of fields to a page by generating markup for each field.
 it is created as with a outer div named in the call and modified with 
 placed onto the page inside the specified targed div. See .addInput for
 characterization of fieldSpecs.   Note since the caller controls the 
 container divId all css specifiers should be relative to that divid. */
String_builder.prototype.addInputFields = function addInputFields(containerDivId, onChangeMethod, fieldSpecs, idPrefix) {
  if (containerDivId) {
    this.start("div", { 'id': containerDivId });
  }
  for (fldndx in fieldSpecs) {
    var tfld = fieldSpecs[fldndx];
    if (idPrefix !== undefined) {
      tfld.idPrefix = idPrefix;
    }
    tfld.class = "form_fld"
    tfld.onchange = onChangeMethod
    this.addInputField(tfld);
  }
 

}


/* **************
* DEFERRED DIV PLACEMENT 
* ***************
This section provides delayed placement of content
into DIVS that may not have been created yet.   This is
used by code where multiple AJAX requests are made and we 
need to render content into DIVS that may be created as 
part of a different AJAX return.   An example of this is
when we want to display all the strike prices for a given 
option in a div containing other data about that expiry but
we defer rendering the original expires DIV until the 
the data set returns */
var pending_div_placement = {};
function place_by_id_on_timer_expire(args) {
    // for each pending placement see if the 
    // target div exists and then replace that
    // div's inner html content. 
    clearInterval(place_timer_id)
    toDel = [];
    for (var ndx in args) {
        var tdiv = document.getElementById(ndx);
        if ((tdiv !== undefined) && (tdiv !== null)) {
            tdiv.innerHTML = args[ndx];
            toDel.push(ndx);
        }
    }

    // remove the keys we have already
    // placed so we do not do the work again
    for (var ndx in toDel) {
        tkey = toDel[ndx];
        delete args[tkey];
    }
    // If we are still waiting for divs to show
    // up then schedule for another try.
    if (args.length > 0) {
        setTimeout(place_by_id_on_timer_expire, 100, args);
    }
}

function schedule_div_placement(id, pstr) {
    pending_div_placement[id] = pstr;
    place_timer_id = setTimeout(place_by_id_on_timer_expire, 50, pending_div_placement);
}


/************
* Utility and Parsing Routines 
* commonly used by a wide variety
* of pages so included here. 
*************/

// parse simple file containing a
// list of strings on separate lines
// similar to symbol list files 
// used in the symbol-list directory
function parseSimpleList(dataStr) {
    var tout = [];
    var tarr = dataStr.split("\n");
    for (var rowndx in tarr) {
        var rowstr = tarr[rowndx].trim();
        rowstr = rowstr.split("#")[0].trim();
        if (rowstr.length > 0) {
            tout.push(rowstr);
        }
    }
    return tout;
}

function parseQueryString(queryString) {
    var parms = {};
    var queries = queryString.replace("?", "&").split("#")[0].split("&");
    for (var i in queries) {
        var temp = queries[i].split('=');
        parms[temp[0]] = temp[1];
    }
    return parms;
};

function parseURLHash(purl) {
    var pa = purl.split("#", 2);
    if (pa.length > 1)
        return pa[1];
    else
        return null;
}


function parseAssocArray(dataStr)
{
    var trows = dataStr.split("\n");
    var ts = "";
    var tobj = {};
    for (ndx in trows)
    {
        var trow = trows[ndx].split("#")[0].trim();
        if (trow.length > 1)
        {
            var tarr = trow.split("=", 2);
            if (tarr.length == 2)
            {
                var tkey = tarr[0].toLowerCase().trim().replaceAll(" ", "_").replaceAll("-", "_");
                tobj[tkey] = tarr[1].trim();
            }
        }
    }
    return tobj;
}


var barDateRE = /^\d\d\d\d-\d\d-\d\d$/;
function isValidBarDatePattern(aDateStr) {
    var res = aDateStr.match(barDateRE);
    //console.log("datein=" + aDateStr + " result=" + res);
    if (res == null) {
        return false;
    }
    return true;
}

function parseDate(aDateStr) {
    if (isValidDatePattern(aDateStr) = false) {
        return null;
    }
    return new Date(aDateStr);
}

// Many of our input dates come as bar dates 
// ccyy-mm-dd hh:mm:ss but do not include the
// time zone offset so the javascript parser
// assumes UMT. By adding the EST to those 
// dates we get the proper time zone adjustment.
function parseDateAdjustedToEST(aDateStr) {
    if (aDateStr.indexOf(" EST") == -1) {
        aDateStr = aDateStr + " EST"
    };
    return parseDate(aDateStr);
}

