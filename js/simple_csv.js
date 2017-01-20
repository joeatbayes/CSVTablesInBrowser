/* AJAX handler to read CSV Data files and 
 from URI and convert object which contains
 an array of rows where each row is an array
 of fields.   
 
 Also provides a helper to return each row
 as a object that contains one property for
 each field defined in the CSV.  This takes
 some extra work so cheaper to access via 
 field number. 
 
 by Joe Ellsworth 2013 (C) All Rights Reserved
*/

// require('js/browser_util.js');
// require('js/simple_ajax.js');


function convert_csv_field_name_to_js(fldName)
{
   return fldName.replaceAll(" ", "_").replaceAll("-","_")
                 .replaceAll(".","_").replaceAll("__", "_")
                 .trim();
}

function convert_csv_field_names_to_js(fldNameArr)
{
   var tout = [];
   for (var ndx in fldNameArr)
   {
     tout[ndx] = convert_csv_field_name_to_js(fldNameArr[ndx])
   }
   return tout;
}

function convert_csv_field_names_to_display_names(fldNameArr)
{
   var tout = [];
   for (var ndx in fldNameArr)
   {
     tout[ndx] = fldNameArr[ndx].replaceAll("_", " ")
                                .replaceAll("-"," ")
                                .replaceAll("."," ")
                                .replaceAll("  ", " ").trim();
   }
   return tout;
}
      
function format_decimal_2(pVal, rowNdx, colNdx, ptbl)
{
  var aVal = aVal// input data had the last zero
  if (isString(pVal))
  {
    var tout = "";
    if (aVal > " ")
    {
      tnum = parseFloat(aVal);   // removed from strike price so
      return tnum.toFixed(2);
    }
  }
  else
  {
    return tnum.toFixed(2);
  }
}


function format_num_comma_no_dec(aVal, rowNdx, colNdx, ptbl)
{
  var tval = aVal
  if (isString(tval))
  {
    tval = tval.trim();
    if (tval > " ")
    {
      tval = parseFloat(tval);   // removed from strike price so
      tval = tval.toFixed(0);
      tval = numberWithCommas(tval);
    }
  }
  else if (isNum(tval))
  {
    tval = tval.toFixed(0);
    tval = numberWithCommas(tval);
  }
  return tval;
}


function default_record_filter_function(rowNdx, parseRow, ptable)
{
  return true;
}



/*********************
**  tableGroup *
***********************/

default_group_pre = function (sb, aGroup)
{
  return true
}

default_group_post = function (sb, aGroup)
{
  return true;
}


// groups are managed in a hierarchy.  The highest level
// group is added first and then the lower level groups
// are added.  The system will not detect if you add them
// in the wrong order and will respond in a wierd fashion
// 
// The system will close all child groups
// from the most detailed back and then will re-open any
// groups needed based on what has been closed due to a change
// in data. 

function tableGroup(tbl, columnNames, callbackPre, callbackPost, grpNdx)
{
   this.tbl = tbl;
   this.cnames = columnNames;
   this.fldNums = [];
   this.grpNdx = grpNdx;
   this.dispNames = [];
   this.groupPreFun = callbackPre;
   this.groupPostFun = callbackPost;
   this.isOpen = false;
   this.rkey = "";
   this.rseg = [];
   this.rrow = [];
   this.rndx = -1;
   this.rowCnt = 0;
   if (isString(columnNames))
   {
     this.cnames = columnNames.split(",");
   }
}



// maps the input fieldnames to field numbers
// which should be faster to ieterate.  
tableGroup.prototype.parse_group_field_names = function ()
{
  var tbl = this.tbl;
  var cnames  = this.cnames;
  var fldNums = this.fldNums;
  if ((cnames.length > 0) && (fldNums.length <= 0))
  {
    for (var cndx in cnames) 
    {
      var cname = convert_csv_field_name_to_js(cnames[cndx])
      cnames[cndx] = cname;
      var fndx = this.tbl.getFldNdx(cname);
      if (fndx >= 0)
      {
        fldNums.push(fndx);
        this.dispNames.push(tbl.head[fndx]);
      }
    }
  }
}

tableGroup.prototype.compute_group_seg = function (rowNdx, drow)
{
  var tout = [];
  var fnums = this.fldNums;
  for (fndx in fnums)
  {
    fldNum = fnums[fndx];
    fldVal = drow[fldNum];
    tout.push(fldVal);
  }
  return tout;
}

tableGroup.prototype.compute_group_key = function (rowNdx, drow)
{
  var tmp = this.compute_group_seg(drow);
  return tmp.join("^");
}

tableGroup.prototype.skip_but_update_as_if_opened = function (rowNdx, drow)
{
  this.rowCnt += 1;
  this.parse_group_field_names();
  var rowSeg = this.compute_group_seg(rowNdx, drow);
  var rowKey = rowSeg.join("^");
  this.record_curr_group(rowNdx, rowSeg, rowKey, drow);
  this.isOpen = true;
}


// called for first record by the group_check_begin to
// set up the state and get the first time opens completed.
// this is needed because we normally compute some setup
// data for the next row when we close the prior group.
tableGroup.prototype.first_row = function (sb, rowNdx, drow)
{
  var tout = true;
  this.parse_group_field_names();
  rowSeg = this.compute_group_seg(rowNdx, drow);
  rowKey = rowSeg.join("^");  
  this.record_curr_group(rowNdx, rowSeg, rowKey, drow);
  tout = this.groupPreFun(sb, this, drow, rowKey, rowNdx);
  this.isOpen = true;
  return tout;
}

tableGroup.prototype.record_curr_group = function (rowNdx, rowSeg, rowKey, drow)
{
  this.rndx = rowNdx; // mark as closed
  this.rseg = rowSeg;
  this.rkey = rowKey;
  this.rrow = drow;
}



tableGroup.prototype.check_group_begin = function (sb, rowNdx, drow)
{
  this.rowCnt += 1;
  var tout = true;
  if (this.rowCnt == 1) 
  {
    tout = this.first_row(sb, rowNdx, drow);
  }
  else if (this.isOpen == false)
  {    
    if ((this.groupPreFun != undefined) && (this.groupPreFun != null))
    {
      tout = this.groupPreFun(sb, this);
    }
    this.isOpen = true;
  }
  return tout;
}


tableGroup.prototype.check_group_end = function (sb, rowNdx, drow)
{
  var tout = true;
  if (this.isOpen)
  {
    rowSeg = this.compute_group_seg(rowNdx, drow);
    rowKey = rowSeg.join("^");    
    if (rowKey != this.rkey)
    {
      if ((this.groupPostFun != undefined) && (this.groupPostFun != null))
      {
        tout = this.groupPostFun(sb, this);        
      }
      // save our setup data for the next row here
      // so we do not need to re-compute the key 
      this.record_curr_group(rowNdx, rowSeg, rowKey, drow);
      this.isOpen  = false;
    }
  }
  return tout;
}

tableGroup.prototype.last_group_seg = function (endOffset)
{
  var toffset = 1;
  if (endOffset != undefined) toffset = endOffset + 1;

  if (this.rseg.length < 1) return "";
  return this.rseg[this.rseg.length - toffset];
}


/* *******************************
* TableGroups
*********************************
* TableGroups is a collection of
* table groups that isolates the 
* functionality managing multiple
* grouping levels
**** */
/*
function TableGroupMgr()
{
  var nobj = {
    a: 7,
    get b() { return a * 3; },
    set b(x) { a = x / 3; }
  };
  return nobj;
}

var tt = new TableGroupMgr();
console.log("tt.b=" + tt.b);
tt.b = 9
console.log("tt.b=" + tt.b + "tt.a=" );
*/




/*********************
**  dtable - Primary class group csv_table 
***********************/
function dtable(tbl_class, tbl_id)
{
  this.tbl_class = "tblc";
  this.tbl_id    = "tblx1";
  if (tbl_class != undefined) this.tbl_class = tbl_class;
  if (tbl_id != undefined) this.tbl_id = tbl_idl
  this.tbl_body_class = "tbl_body";

  this.head = [];  
  this.origHead = [];
  this.override_head = [];
  this.headId = [];
  this.headNdx = {}; // provides lookup index from fldname to field number
  this.fldTypes = [];

  // render fun happens after format function and is for complex things
  // like adding new markup and links that then get injected into the 
  // rendered table.   It receives the rowNdx, colNdx, value, tableptr
  // to allow it to query back into the table for more data if needed. 
  this.renderFlg = [];  

  // format functions are for simple conversion like date re-writes
  // for this reason it only receives the simple data value and returns
  // a string. 
  this.formatFun = [];
  this.renderFun = [];
  this.headRenderFun = [];
  this.thclass = [];
  this.sortSpec = "normal";
  this.header_every_rows = 40;
  this.rows_since_header = 0;
  this.group_spec = [];

  // Part of the complexity of the table manager
  // is that it needs to allow access to fields
  // by field name including overrides but we 
  // do not know the field names that will actually 
  // be in the data until after it is loaded.  These
  // maps provide a place to save the overrides until
  // after the parse.  During the CSV header parse
  // we map the field names to indexed vectors to 
  // allow high speed access.   

  // override_head_map stores a index of headers to use
  // for display purposes that overrides the header 
  // received from the CSV.
  this.override_head_map = {};
  this.render_fun_map = {};
  this.format_fun_map = {};
  this.do_render_map = {};
  this.record_filter_fun = default_record_filter_function;
  this.group_req = [];
  // add in fields for which a virtual
  // callback is used.  [after label] = [label, formatFun];
  //  where format fun is called to supply the 
  //  field contents 
  this.add_in_fields = {};
  return this;
}

  dtable.prototype.make_safe_field_name = function (nameIn)
  {
    return nameIn.trim().toLowerCase().replace(" ", "_");
  }

  // once we parse the basic data we need to 
  // re-apply the overrides just in case the 
  // field ordering in the input data changed. 
  dtable.prototype.update_overrides = function (fldNdx, fldName, pmap, pvect)
  {
    var tval = pmap[fldName];
    if (tval != undefined)
    {
      pvect[fldNdx] = tval;
    }
  }


  dtable.prototype.update_headers = function (headStr)
  {
    var origHead = headStr.split(",");
    this.origHead = origHead;
    var cvtHead = convert_csv_field_names_to_display_names(this.origHead);  
    for (var ndx in cvtHead)
    {
      var fldName = cvtHead[ndx];
      var origFldName = origHead[ndx];
      var safeId = this.make_safe_field_name(origFldName)
      this.headId[ndx] = safeId;
      // modify working field name
      // if we have overriden
      this.update_overrides(ndx, safeId, this.override_head_map, this.override_head)
      this.update_overrides(ndx, safeId, this.do_render_map,     this.renderFlg)
      this.update_overrides(ndx, safeId, this.render_fun_map,    this.renderFun)
      this.update_overrides(ndx, safeId, this.format_fun_map,    this.renderFun)
      var toverName = this.override_head[ndx];
      if (toverName != undefined)
      {
        fldName = toverName;
      }    
      this.head[ndx] = fldName;
      this.headNdx[safeId] = ndx;
      //this.fldTypes[ndx] = "string";
      //this.renderFlg[ndx] = true;
      //this.renderFun[ndx] = null;
      //this.thclass[ndx] = null;
    }   
  }


  dtable.prototype.parse = function (dataStr)
  {
    var csvLines = dataStr.split("\n");
    var headLine = csvLines.shift().trim();
    this.update_headers(headLine);
    this.drows = [];
    var headFlds = this.head;
    var numFlds = headFlds.length;
    var drows = this.drows;
 
    for (var ndx in csvLines)
    {
      var tline = csvLines[ndx].trim();
      var fldArr = tline.split(",");
      if (fldArr.length >= numFlds)
      {
        drows.push(fldArr);
      }
    }
  }

  dtable.prototype.getLength = function ()
  {
    return this.drows.length;
  }

  dtable.prototype.getMaxNdx = function ()
  {
    return this.drows.length -1;
  }

  dtable.prototype.getFldNdx = function(fldName)
  {
    var fldName = this.make_safe_field_name(fldName)
    return this.headNdx[fldName];
  }

  dtable.prototype.getFld = function(rowNdx, fldName)
  {
    var fldName = this.make_safe_field_name(fldName)
    var drow = this.drows[rowNdx];
    var fldNum = this.headNdx[fldName];
    return drow[fldNum];
  }

  dtable.prototype.getRow = function(rowNdx)
  {
    return this.drows[rowNdx];
  }

  dtable.prototype.getRowObj = function(rowNdx)
  {
    var out =  new Object();
    var drow = this.drows[rowNdx];
    var headFlds = this.headId
    for (var ndx in headFlds)
    { 
      var headName =headFlds[ndx];
      out[headName] = drow[ndx];
    }
    return out;  
  }

  dtable.prototype.set_render_flag = function(fldName, tval)
  {
    var fldName = this.make_safe_field_name(fldName);
    this.do_render_map[fldName] = tval  
  }

  dtable.prototype.set_render_function = function(fldName, funPtr)
  {
    var fldName = this.make_safe_field_name(fldName);
    this.render_fun_map[fldName] = funPtr;
  }

  dtable.prototype.set_format_function = function (fldName, funPtr)
  {
    var fldName = this.make_safe_field_name(fldName);
    this.format_fun_map[fldName] = funPtr;
  }

  dtable.prototype.set_disp_head = function(fldName, textStr)
  {
    var fldName = this.make_safe_field_name(fldName);
    this.override_head_map[fldName] = textStr;
  }




  // apply any sort specifications configured
  // for this table. 
  dtable.prototype.apply_sort = function ()
  {
    if (this.sortSpec == "reverse")
    {
      this.drows.sort();
      this.drows.reverse();
    }
    else if ((this.sortSpec != "false") && (this.sortSpec != "none"))
    {
      this.drows.sort();
    }
  }

  dtable.prototype.add_field = function (label, formatFun, afterFieldLabel)
  {
    this.add_in_fields[afterFieldLabel] = { 'label': label, 'formatFun': formatFun }   
  }


  dtable.prototype.add_group = function (columnNames, callbackPre, callbackPost)
  {    
    var tgrp = new tableGroup(this, columnNames, callbackPre, callbackPost, this.group_req.length);
    this.group_req.push(tgrp);
  }

  dtable.prototype.skip_but_update_as_if_opened = function (begRowNdx, rowNdx, drow)
  {
    var greq = this.group_req;
    var maxNdx = greq.length - 1;
    for (var grpNdx = begRowNdx; grpNdx <= maxNdx; grpNdx++)
    {
      this.group_req[grpNdx].skip_but_update_as_if_opened(rowNdx, drow);
    }
  }

  dtable.prototype.check_apply_groups = function (sb, rowNdx, drow)
  {    
    var greq = this.group_req;
    if (greq.length > 0)
    {
      var maxNdx = greq.length - 1;
      // loop from most detailed to most general
      // and close any that have changed.
      for (var grpNdx = maxNdx; grpNdx >= 0; grpNdx--)
      {
        var tcontinue = this.group_req[grpNdx].check_group_end(sb, rowNdx, drow);
        if (tcontinue == false) break;
      }

      // loop from most general to most detailed
      // and open any that are needed. 
      for (var grpNdx = 0; grpNdx <= maxNdx; grpNdx++)
      {
        var tcontinue = this.group_req[grpNdx].check_group_begin(sb, rowNdx, drow);
        if (tcontinue == false)
        {
          this.skip_but_update_as_if_opened(grpNdx+1, rowNdx, drow)
          break;
        }
      }
    }
  }


  dtable.prototype.open_column_head_html = function (sb)
  {
    var dhead = this.head;
    var dheadid = this.headId;
    var drows = this.drows;
    var drendFlg = this.renderFlg;
    sb.push("<tr>")
    for (var fldndx in dhead)
    {
      if ((drendFlg[fldndx] == undefined) || (drendFlg[fldndx]))
      {
        var fldName = dheadid[fldndx];
        var headid = "h" + fldName;
        var headdisp = dhead[fldndx];
        sb.push("<th id='" + headid + "'>" + headdisp + "</th>\n");
        // add in column headers for virtual columns
        var tadd = this.add_in_fields[fldName];
        while (tadd != undefined)
        {
          fldName = tadd.label;
          headdisp = tadd.label;
          headid = "h" + fldName;
          sb.push("<th id='" + headid + "'>" + headdisp + "</th>\n");
          tadd = this.add_in_fields[fldName];
        }
      }
    }
    sb.push("</tr>");
    this.rows_since_header = 0;
  }

  dtable.prototype.open_table = function (sb)
  {
    var tout = sb.push("<table id='" + this.tbl_id + "' class='" + this.tbl_class + "'>");
    //sb.push("<table class='" + pclass + "'>");
    sb.push("<thead class='" + this.tbl_th_class + "'>");
    this.open_column_head_html(sb);
    sb.push("</thead>");
    sb.push("<tbody class='" + this.tbl_body_class + "'>");
  }


  dtable.prototype.close_table = function (sb)
  {
    //sb.push("</div>");
    sb.push("</tbody>");
    sb.push("</table>");
  }


  dtable.prototype.to_simple_html = function ()
  {
    var sb = new String_builder();
    this.sb = sb;
    var dhead = this.head;
    var flds = this.head;
    var drows = this.drows;
    var drendFlg = this.renderFlg;
    this.rows_since_header = 0;
    this.rowsDisp = 0;
    this.open_table(sb);
    //sb.push("<div class='sx2'>");
    for (var rowndx in drows)
    {
      var drow = drows[rowndx];
      var rowid = "row" + rowndx;

      // call our record filter function and skip processing this 
      // row if we get a false.   calls a default function 
      // which always returns true unless set by user.  
      if (this.record_filter_fun(rowndx, drow, this) == false)
      {
        continue;
      }
      this.rowsDisp += 1;
      this.rows_since_header += 1;
      this.check_apply_groups(sb, rowndx, drow)

      if (this.rows_since_header > this.header_every_rows)
      {
        this.open_column_head_html(sb);
        this.rows_since_header = 0;
      }

      sb.push("<tr id='" + rowid + "' onClick='rowclick(\"" + rowid + "\");'>");
      for (var fldndx in flds)
      {
        if ((drendFlg[fldndx] == undefined) || (drendFlg[fldndx]))
        {
          //var headName = flds[fldndx];
          var fval = drow[fldndx];
          if (this.formatFun[fldndx] != undefined)
          {
            fval = this.formatFun[fldndx](fval, rowNdx, fldNdx, this);
          }

          //var headName = flds[fldndx];        
          if (this.renderFun[fldndx] != undefined)
          {
            fval = this.renderFun[fldndx](fval, rowndx, fldndx, this);
          }
          sb.push("<td>" + fval + "</td>");

          // Process virtual add in fields. 
          var fldName = this.headId[fldndx];
          var tadd = this.add_in_fields[fldName];
          while (tadd != undefined)
          {
            var formatFun = tadd.formatFun;
            fldName = tadd.label
            sb.push("<td>" + formatFun(fldName, rowndx, fldndx, this));
            tadd = this.add_in_fields[fldName];
          }
        }
      }
      sb.push("</tr>\n");
    }
    this.close_table(sb);
    if (this.rowsDisp < 1)
    {
      sb.push("<H1>No Records which satisfy Filter Criteria Where Found</H1>");
      sb.push("Total records loaded = " + this.drows.length
         + " but they where filtered for display. ");
    }
    return sb.to_str();
  }

      
  function csv_onData(dataStr, httpObj, parms)
  {
    if ((dataStr == null) || (dataStr == undefined) || (dataStr.length < 1))
    {
      var msg = "Invalid data recieved for " + JSON.stringify(parms);
      
      if (dataStr !== null) {
          msg = msg + " dataStr=" + dataStr;
      }
      if ((httpObj !== null) && (response in httpObj)) {
          msg = msg + " response=" + httpObj.response();
      }
      
      set_div_contents(parms.dest_element_id, msg);
    }
    else
    {
      ttble = parms.dtable;
      ttble.parse(dataStr);
      ttble.apply_sort();
      var statMsg = document.getElementById("ajax_message");
      statMsg.innerHTML += msg;
      var msg = "received " + dataStr.length + " bytes "
              + " parsed " + ttble.drows.length + " rows ";
      statMsg.innerHTML = msg;
      statMsg.innerHTML += "<br/>";    
    
      var tableStr = ttble.to_simple_html();
      set_div_contents(parms.dest_element_id, tableStr);
    }
  }


  // TODO: Move to a opt_hist.html file
  function date_only_part_of_datetime(aVal)
  {
    return aVal.split(" ")[0];
  }      

  // TODO: Move to a opt_hist.html file
  function datetime_strip_EST(aVal)
  {
    return aVal.replace(" EST","").replace(" EDT", "");
  }      

  // TODO: Move to a opt_hist.html file
  function time_only_part_of_datetime(aVal)
  {
    var tmp = datetime_strip_EST(aVal);
    var tarr = tmp.split(" ");
    tmp = tarr[1].split(".")[0];
    return tmp
  }      

                     
  function csv_default_run_non_bock(puri, parms, destElementId)
  {
    if (parms == undefined) parms = {};

    if ((destElementId == undefined) || (destElementId == null) || (destElementId < " "))
    {
      parms.dest_element_id = "csv_table_div";
    }
    else
    {
      parms.dest_element_id = destElementId.trim();
    }
    var ttble = new dtable();
    parms.dtable = ttble;


    if (parms.sort != undefined)
    {
      ttble.sortSpec = parms.sort.toLowerCase();
    }
 
    simpleGet(puri, csv_onData, parms);

  }



// Runtime libary for browser to change row color
// based on user clicks.   Up until now this library
// could have been ran server side in node.js.

  function rowclick(eleId)
  {
    var tdiv = document.getElementById(eleId);
    if ((tdiv !== undefined) && (tdiv !== null))
    {
      if (tdiv.style.background == tdiv.parentNode.style.background)
      {
        tdiv.style.background = '#A8F5F7';
        tdiv.style.clickcnt = 1;
      }
      else if (tdiv.style.clickcnt == 1)
      {
        tdiv.style.background = '#A8F5A7';
        tdiv.style.clickcnt = 2;
      }
      else if (tdiv.style.clickcnt == 2)
      {
        tdiv.style.background = '#D8A5F7';
        tdiv.style.clickcnt = 3;
      }
      else if (tdiv.style.clickcnt == 3)
      {
        tdiv.style.background = '#E8E5E7';
        tdiv.style.clickcnt = 4;
      }
      else
      {
        tdiv.style.background = tdiv.parentNode.style.background;
        tdiv.style.clickcnt = 0;
      }
    }
  }

