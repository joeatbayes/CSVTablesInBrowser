/*** BEGIN stock_math.js ****/
var MAX_FLOAT = Number.MAX_VALUE; //9999999999999;
var MIN_FLOAT = Number.MIN_VALUE;
var MAX_INT   = Math.floor(MAX_FLOAT);
var MIN_INT   = Math.floor(MIN_FLOAT);
var default_stock_calc_label = "close";
var SecPerMin  = 60;
var SecPer5Min = 300;
var SecPer10Min = 600;
var SecPer30Min = 1800;
var SecPerHour = 3600;
var SecPerDay = 86400;
var SecPerWeek = 604800;
var MSPerMin =  SecPerMin * 1000;
var MSPerHour = SecPerHour * 1000;
var MSPerDay  = SecPerDay * 1000;
var EST_UMT_offset =  9 * MSPerHour;
var PST_UMT_offset =  8 * MSPerHour;

var periods = {
   'M1' : {'label' : '1 Minute', min: 1},
   'M10': {'label' : '10 minutes', min: 10},
   'M30': {'label' : '30 minutes', min: 30},
   'H1' : {'label' : '1 hour', min: 60},
   'D1' : {'label' : '1 Day', min: 1536},
   'W1' : {'label' : '1 week', min: 10752}
  };

function Int(aNum)
{
  return Math.floor(aNum);
}

function isUndef(varIn)
{
  if (typeof(varIn)==='undefined')
    return true;
  else
    return false;
}

function isSet(varIn)
{
  if (varIn === null)
    return false;
  if (varIn == undefined)
    return false
  if (typeof(varIn)==='undefined')
    return false;
  return true;
}


function max(v1, v2)
{
  if (v1 >= v2) return v1
  return v2;
}

function min(v1, v2)
{
  if (v1 <= v2) return v1
  return v2;
}

function avg(v1, v2)
{
  return (v1 + v2) / 2.0;
}


Date.prototype.to_EST = function()
{
  var td = new Date();
  td.setTime(this.getTime() - EST_UMT_offset);
  return td;
};

Date.prototype.add_days = function(numDays)
{
   this.setTime(this.getTime() + (numDays * MSPerDay));
   return this;
};

Date.prototype.add_hours = function(numHours)
{
  this.setTime(this.getTime() + (numHours * MSPerHour));
  return this;
};

Date.prototype.add_minutes = function(numMin)
{
  this.setTime(this.getTime() + (numMin * MSPerMin));
  return this;
};

Date.prototype.date_days_ago = function(numDays)
{
  return new Date().setDate(this.getDate() - numDays);
  return this;
};

function ISO_str_to_stock_str(strIn)
{
  return strIn.replace("T", " ").replace("Z", "");
}

// Adjust the date so what comes out of the ISOTime
// is correctly adjusted for the local time zone
// delta and convert into a form compatible
// with stock format.   TODO:  Assuming the
// data passed in is in local time format
// adjust it so what comes out is in EST.
Date.prototype.to_stock_str = function()
{
  var dd = new Date();
  dd.setTime(this.getTime());
  dd.add_minutes(0 - dd.getTimezoneOffset());
  return ISO_str_to_stock_str(dd.toISOString());
};



function stock_date_to_disp_date(sDate)
{
  return sDate.substr(5,11);
}


// Number of calendar days in view.
calc_calendar_days_delta = function(begDateISO, endDateISO)
{
  var fdate = new Date(begDateISO);
  var edate = new Date(endDateISO);
  var msdif = edate.getTime() - fdate.getTime();
  return (msdif / MSPerDay) + 1.0;
}

function date_to_str(date)
{
  return "" + tDate.getFullYear() + "-" + tDate.getMonth() + "-" + tDate.getDay()
    + " " + tDate.getHours() + "." + tDate.getMinutes() + "." + tDate.getSeconds();
}

function calc_sim_dist(v1, v2, weight)
{
  var tNum = v1 / v2
  if (tNum > 1)
    tNum = 1.0 / tNum;
  return tNum * weight;
}



//<summary>
//  Returns the highest date String which will compare
///  as lower than the first bar of a day which started
///  number of days ago.
//</summary>
function DateStrDaysAgo(numDays)
{
  var tDate = new Date().add_days(0 - numDays);
  return ISO_str_to_stock_str(tDate.toISOString());
}




function setDefault(varIn, defaultVal)
{
  if ((typeof(varIn)==='undefined') || (isNaN(varIn)))
    return defaultVal;
  else
    return varIn;  
}

function stockMaxVal(data, label)
{
  var tmax = MIN_FLOAT;
  var rows = data.rows;
  for (var ndx in rows)
  {
    tval = rows[ndx][label];
  if (tval > tmax) 
  {
    tmax = tval;
  }
  }
  return tval;
}


/* Scan stock array and find maximum value 
 returns array with maxValue first followed
 by maxPos */
  function stockFindMax(data, begNdx, endNdx, label)
  {
    var valFound = MIN_FLOAT;
    var rows = data.rows;
    var ndxFound = -1;
    begNdx = setDefault(Math.floor(begNdx), 0);
    endNdx = setDefault(Math.floor(endNdx), rows.length - 1);
    label  = setDefault(label, default_stock_calc_label);
    if (endNdx >= rows.length)
      endNdx = rows.length - 1;

    for (var ndx = begNdx; ndx <= endNdx; ndx++)
    {
       tval = rows[ndx][label];
       if (tval > valFound)
       {
         valFound = tval;
         ndxFound = ndx;
       }
    }
    return {'val' : valFound, 'ndx' : ndxFound};
  }


function stockMinVal(data, label)
{
  var tmin = MAX_FLOAT;
  var rows = data.rows;
  for (var ndx in rows)
  {
    tval = rows[ndx][label];
    if (tval < tmin)
    {
      tmin = tval;
    }
  }
  return tmin;
}

/* Scan stock array and find minimum value 
 returns array with maxValue first followed
 by maxPos */
function stockFindMin(data, begNdx, endNdx, label)
{
  var valFound = MAX_FLOAT;
  var rows = data.rows;
  var ndxFound = -1;
  begNdx = setDefault(Math.floor(begNdx), 0);
  endNdx = setDefault(Math.floor(endNdx), rows.length - 1);
  label  = setDefault(label, default_stock_calc_label);
  if (endNdx >= rows.length)
    endNdx = rows.length - 1; 
    
  for (var ndx = begNdx; ndx <= endNdx; ndx++)
  {
    tval = rows[ndx][label];
    if (tval < valFound)
    {
      valFound = tval;
      ndxFound = ndx;
    }
  }
  return {'val' : valFound, 'ndx' : ndxFound};
}

// Calculate an avarage for the stock array 
// begining at begNdx and ending and the endNDX value
// for the label specified.  Returns single number
function stockAverage(data, begNdx, endNdx, label)
{  
  var rows = data.rows;
  begNdx = setDefault(Math.floor(begNdx), 0);
  endNdx = setDefault(Math.floor(endNdx), rows.length - 1);
  label  = setDefault(label, default_stock_calc_label);
  if (endNdx >= rows.length)
    endNdx = rows.length - 1; 
  if (begNdx < 0) 
    begNdx = 0;  
  var badCnt =0;
  var cnt = (endNdx - begNdx) + 1.0;  
  var total = 0;
  for (var ndx = begNdx; ndx <= endNdx; ndx++)
  {
    var trow = rows[ndx];
    if (trow === undefined)
    {
      badCnt += 1;
    }
    else
    {
      total += trow[label];
    }
  }
  var avg = total / (cnt - badCnt);
  return avg;  
}

function indSMA(data, Ndx, numPer, label)
{
   return stockAverage(data, ndx - numPeriod, ndx, label);

}


function indArrSMA(data,begNdx, endNdx, numPer, label)
{

}

