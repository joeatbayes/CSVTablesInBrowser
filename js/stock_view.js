
/* StockView is used to describe a currently activated
 view on the underlying stock to render.   This view
 is used to apply all the other functions such as
 min, max, avg, etc.  Providing a virtual subset
 of the stock.   NOTE:  Be careful not to mix
 graph specific data here but rather create a new
 class graphView which main contain a stock view*/

function StockView(psymbol, data,  begNdx, endNdx, label)
{
  this.symbol = psymbol;
  this.data = data;
  // only here for documentation rest in setView
  this.begNdx  = -1;
  this.endNdx  = -1;
  this.label = -1;  
  this._number_of_trade_days_in_view = undefined;
  this._view_summary = undefined;
  this.setView(begNdx, endNdx, label);
  this.main_field_label = default_stock_calc_label;
  return this;
}


var svp = StockView.prototype;

StockView.prototype.get = function(ndx)
{
  if ((ndx === undefined) || (ndx === null))
    return undefined;
  if ((ndx < 0) || (ndx >= this.data.rows.length))
    return undefined;
  else
    return this.data.rows[ndx];
}

StockView.prototype.getVal = function(ndx)
{
  if ((ndx < 0) || (ndx >= this.data.rows.length))
    return undefined;
  else
    return this.data.rows[ndx][this.main_field_label];
}


/* load more data from extra files into this view
* this requires making a ajax call to fetch the 
* required data and then once it is recieved 
* parsing it and then loading into the rows array
*/
StockView.prototype.LoadMoreData = function(years_ago)
{
  if ((ndx < 0) || (ndx >= this.data.rows.length))
    return undefined;
  else
    return this.data.rows[ndx][this.main_field_label];
}





// Set stock view window.  default begNdx = 0, default endNdx = lastArrayElement,
// default label = defaultStockCalcLabel = "close"
// if begNdx is below 0 then set to 0.
// if endNdx is above last element set to last element.
// used to setup of the initial view by all scroll and zoom functions.
StockView.prototype.setView = function(begNdx, endNdx, label)
{
  this._number_of_trade_days_in_view = undefined;
  this._view_summary = undefined;

  this.begNdx = setDefault(Int(begNdx), 0);
  this.endNdx = setDefault(Int(endNdx), this.data.rows.length - 1);

  // swap points if begin is greater than end
  var tt= min(this.begNdx, this.endNdx);
  this.endNdx = max(this.begNdx, this.endNdx);
  this.begNdx = tt;

  // if no label is supplied used my existing label if one
  // has been specified.  Otherwise use the default.
  if (isUndef(label))
    if (this.label == -1)
      label = default_stock_calc_label;
    else
      label = this.label
  this.label  = label;



  if (this.endNdx >= this.data.rows.length)
    this.endNdx = this.data.rows.length - 1;
  if (this.begNdx < 0)
    this.begNdx = 0;

}


/* Shrink the window by 1/2 */
StockView.prototype.zoomIn = function()
{
  var tDist = this.view_length/ 1.25;
  if (tDist < StockGraphMinPointsInView)
    tDist = 18
  //var currNdx = (this.begNdx + this.endNdx)/2;
  var currNdx = this.endNdx;
  this.setView(currNdx - tDist, currNdx, this.label)
}

/* grow the window by 1/2 */
StockView.prototype.zoomOut = function()
{
  var tDist = this.view_length* 1.15;
  //var currNdx = (this.begNdx + this.endNdx)/2;
  //this.setView(currNdx - tDist, currNdx + tDist, this.label)
  var tBeg = (this.endNdx - tDist);
  var tEnd = this.endNdx;
  if ((tBeg < 0) && (tEnd < this.data.rows.length - 1))
  {
    // if all the way zoomed out to begin of data
    // then start enlarging view towards the
    // end of data.
    tBeg = 0;
    tEnd = tEnd += this.view_length/ 6;
  }
  this.setView(tBeg, tEnd, this.label)
}



/* grow the window by 1/2 */
StockView.prototype.scrollLeft = function()
{
  var tDist = this.view_length/ 15;
  if ((this.begNdx - tDist) < 0)
    tDist = this.begNdx;
  this.setView(this.begNdx - tDist, this.endNdx - tDist, this.label);
}


/* grow the window by 1/2 */
StockView.prototype.scrollRight = function()
{
  var tDist = this.view_length/ 15;
  if (this.endNdx < this.data.rows.length)
  {
    if ((this.endNdx + tDist) >= this.data.rows.length)
    {
      this.scrollToEnd();
    }
    else
    {
      this.setView(this.begNdx + tDist, this.endNdx + tDist, this.label);
    }
  }
}


/* grow the window by 1/2 */
StockView.prototype.scrollToEnd = function()
{
  if (this.endNdx < this.data.rows.length)
  {
    var newBeg = (this.data.rows.length - this.view_length);
    this.setView(newBeg, this.data.rows.length, this.label)
  }
}



/* When sample set is not large enough to fill screen
 returns the number of horizontal pixels or drawing
 units to use per data sample
 */
StockView.prototype.pixelsPerPoint = function(drawWidth)
{
  var sf = this.calc_items_per_pixel(drawWidth);
  if (sf > 0)
    return  1;
  else
    return  (drawWidth / this.view_length);
}


// Return the length of the currently active set.
svp.__defineGetter__("view_length", function()
{
  return(this.endNdx - this.begNdx) + 1;
});


// Return the length of the currently active set.
svp.__defineGetter__("dataLength", function()
{
  return this.data.rows.length;
});


// Return the length of the currently active set.
svp.__defineGetter__("lastNdx", function()
{
  return this.endNdx;
});

// Return the length of the currently active set.
svp.__defineGetter__("firstRow", function()
{
  return this.data.rows[begNdx];
});


// Reset the view to encompass the entire set
StockView.prototype.reset = function()
{
  this.begNdx = 0;
  this.endNdx = this.data.lastNdx
}

// Return true if the supplied index is in the specified
// view range.   Otherwise return false.
StockView.prototype.inViewRange = function(ndx)
{
  return ((ndx >= this.begNdx) && (ndx <= this.endNdx))
}


StockView.prototype.average = function(ndx)
{
  return stockAverage(this.data,this.begNdx, this.endNdx, default_stock_calc_label);
}




StockView.prototype.find_min_max = function(begNdx, endNdx, label)
{
  var tBegNdx = setDefault(Int(begNdx), this.begNdx);
  var tEndNdx = setDefault(Int(endNdx), this.endNdx);
  if (isUndef(label))
    if (this.label == -1)
      label = default_stock_calc_label;
    else
      label = this.label

  // swap points if beg is after end.
  var tt= min(tBegNdx, tEndNdx);
  tEndNdx = max(tBegNdx, tEndNdx);
  tBegNdx = tt;

  var tMin = stockFindMin(this.data, tBegNdx, tEndNdx, "low");
  var tMax = stockFindMax(this.data, tBegNdx, tEndNdx, "high");
  var tAvg = stockAverage(this.data, tBegNdx, tEndNdx, label);
  return {'min' : tMin, 'max' : tMax, 'avg' : tAvg};
    //return stockAverage(this.data,this.begNdx, this.endNdx, default_stock_calc_label);
}

// Return true if supplied index is inside
// of bounds of the total data set currently
// held in this view.
StockView.prototype.in_data_range = function(ndx)
{
   if (ndx < 0) return false;
   if (ndx >= this.data.rows.length) return false;
   return true;
}

// Return true if the supplied index is inside
// of the bounds of the currently defined
// view.
StockView.prototype.in_view_range = function(ndx)
{
  if (ndx < this.begNdx) return false;
  if (ndx > this.endNdx) return false;
  return true;
}

svp.__defineGetter__("number_of_trade_days_in_view", function()
{
  if (this._number_of_trade_days_in_view === undefined)
    this._number_of_trade_days_in_view = this._calc_num_trade_days_in_view();
  return this._number_of_trade_days_in_view;
});

// Count the number of unique days in the active
// view.  and return that number.   Normally you
// would use the getter number_of_days_in_view which
// caches the output from this function
StockView.prototype._calc_num_trade_days_in_view = function()
{
  var currDay = "";
  var numDays = 0;
  var lastNdx = this.endNdx;
  var begNdx = this.begNdx;
  var rows = this.data.rows;
  for (var ndx=begNdx;  ndx<=lastNdx; ndx++)
  {
    if (rows[ndx].date != currDay)
    {
      numDays += 1;
      currDay = rows[ndx].date;
    }
  }
  return numDays;
}



// Return the index of the first element which
// has a dateTime str which exactly matches
// the datetime specified.
// TODO ADJUST THIS TO Use a Binary Search to
// save time.
StockView.prototype.find_date_time = function(pDateTimeStr)
{
  var rows = this.data.rows;
  var numRow = rows.length;
  for (var ndx=0; ndx < numRow; ndx++)
  {
    var trow = rows[ndx];
    if (trow.dateTime == pDateTimeStr)
    {
      return ndx;
    }
  }
}

// Return the First Index of the first record occurring
// after the date passed in.
// TODO ADJUST THIS TO PROPERLY HANDLE TIME OFFSET FROM ISO TIME
StockView.prototype.find_first_after = function(aDate)
{
  var ds = aDate.to_stock_str();
  var dl = this.data.rows.length -1;
  for (var ndx=dl; ndx>=0; ndx--)
  {
    if (this.data.rows[ndx].date < ds)
      return ndx + 1;
  }
  return 0;
}


StockView.prototype.minutes_ago_first_index = function(numMin)
{
  var dd = new Date();
  dd.add_minutes(0 - Math.abs(numMin));
  dd.setSeconds(0,0);
  return this.find_first_after(dd);
}

StockView.prototype.days_ago_first_index = function(numDays)
{
  var numMin = numDays * 24 * 60;
  return this.minutes_ago_first_index(numMin);
}


// Return a structure containing the min, max, avg for the last
// number of days.   Sets the view to include the
// last number of days by default.  Use the stock day change
// for up to 10 days then revert to calendar computation
StockView.prototype.days_ago_stat = function(numDays)
{
  var dNdx = 0;
  if (numDays <= 1)
  {
    // Use just today for for the 1 day
	dNdx = this.find_days_ago_first_ndx(1);
	//alert("numDays=" + numDays + " dNdx=" + dNdx + " len=" +  this.data.rows.length);
  }  
  else if (numDays <= 6)
  {
    // When dealing with less than 6 days then 
	// use trading days to count the number of 
	// of days. 
    dNdx = this.find_days_ago_first_ndx(numDays);
  }
  else
  {
    // Otherwise calculate the how far back to go
	// based on the number of bars per day. 
    dNdx = this.days_ago_first_index(numDays);
  }
  if (dNdx === undefined)
    return undefined;
  return this.find_min_max(dNdx, this.data.rows.length - 1);
}

// Number of calendar days in view.
StockView.prototype.calendar_days_in_view = function()
{
  return this.calendar_days_in_range(this.begNdx, this.endNdx);
}

StockView.prototype.calendar_days_in_data = function()
{
  return this.calendar_days_in_range(0, this.data.rows.length-1);
}



// Number of calendar days in view.
StockView.prototype.calendar_days_in_range = function(begNdx, endNdx)
{
  begNdx = setDefault(Int(begNdx), this.begNdx);
  endNdx = setDefault(Int(endNdx), this.endNdx);
  if (endNdx >= this.data.rows.length)
    endNdx = this.data.rows.length - 1;
  if (begNdx < 0)
    begNdx = 0;

  var fdates = this.data.rows[begNdx].date;
  var edates = this.data.rows[endNdx].date;
  return calc_calendar_days_delta(fdates, edates)
}

// Count the number of days in the active view
// by scanning the bar set and checking for
// the number of times the date string changes
StockView.prototype.count_days_in_view = function(begNdx, endNdx)
{
  begNdx = setDefault(Int(begNdx), this.begNdx);
  endNdx = setDefault(Int(endNdx), this.endNdx);
  if (endNdx >= this.data.rows.length)
    endNdx = this.data.rows.length - 1;
  if (begNdx < 0)
    begNdx = 0;
    
  var curr_date = "";
  var day_cnt = 0;
  var rows = this.data.rows;
  var bNdx = begNdx;
  var eNdx = endNdx;
  for (var ndx=eNdx; ndx >=bNdx; ndx--)
  {
    if (rows[ndx].date != curr_date)
    {
      curr_date = rows[ndx].date;
      day_cnt += 1;
    }
  }
  return day_cnt;
}


svp.__defineGetter__("last_view_date_str", function()
{
  return this.data.rows[this.lastNdx].date;
});

svp.__defineGetter__("last_data_date_str", function()
{
  return this.data.rows[this.data.rows.length - 1].date;
});

// Scan backwards through the stock data and find the
// index of the data once the date has changed at least
// numDay times.   This is contrast to calculating a
// date string and scanning for it.  This is needed for
// the shorter number of days 1..5 to allow for weekends.
StockView.prototype.find_days_ago_first_ndx = function(numDay)
{
  var curr_date = "";
  var day_cnt = 0;
  var nbar = this.data.rows.length - 1;
  var rows = this.data.rows;
  for (var ndx=nbar; ndx >=0; ndx--)
  {
     if (rows[ndx].date != curr_date)
     {
        curr_date = rows[ndx].date;
        day_cnt += 1;
        if (day_cnt > numDay)
          return ndx + 1;
     }
  }
  return 0;
}

// Alternate approach for finding the last number of days
// of data based on counting day changes in the bars which
// we need to to for shorter views when we may be in a weekend.
StockView.prototype.set_view_to_last_day = function(numDay)
{
  var firstNdx = this.find_days_ago_first_ndx(numDay);
  this.setView(firstNdx, this.data.rows.length-1);
  return this.find_min_max();
}


// Return a structure containing the min, max, avg for the last
// number of days.   Sets the view to include the
// last number of days by default.
StockView.prototype.set_view_to_minutes_ago = function(numMin)
{
  var dNdx = this.minutes_ago_first_index(numMin);
  if (dNdx === undefined)
    return undefined;
  this.setView(dNdx, this.data.rows.length - 1);
  this._number_of_trade_days_in_view = undefined;
  return this.find_min_max(this.begNdx, this.endNdx);
}


// Return a structure containing the min, max, avg for the last
// number of days.   Sets the view to include the
// last number of days by default.
StockView.prototype.set_view_to_days_ago = function(numDays)
{
  if (numDays <= 15)
    return this.set_view_to_last_day(numDays); // use alternate view of counting days in the data

  var numMin = numDays * 24 * 60;
  var tRes = this.set_view_to_minutes_ago(numMin);

  if (tRes === undefined) // could be a weekend
    return this.set_view_to_last_day();

  if (tRes === undefined)
    return undefined;

  //this._number_of_trade_days_in_view = numDays;
  return tRes;
}


StockView.prototype.calc_hist_stats = function()
{
    var num_day_in = [1,5,10,30,60,90,180,365];
    var ndil = num_day_in.length -1;
    var tout = [];
    var availCalDays = this.calendar_days_in_data();
    for (var ndx=0; ndx <= ndil; ndx++)
    {
      var num_day = num_day_in[ndx];
      if (num_day > availCalDays)
        continue;
      var stats = this.days_ago_stat(num_day);
      if (stats !== undefined)
      {
        stats.label = "" + num_day + " day";
        stats.range = stats.max.val - stats.min.val;
        stats.pchange = stats.range / stats.min.val;
        tout.push(stats);
      }
    }

    stats = this.find_min_max(0, this.data.rows.length - 1);
    stats.label = "YTD";
    tout.push(stats);
    return tout;
}

StockView.prototype._calc_view_summary = function()
{
  var stats = this.find_min_max()
  var range = stats.max.val - stats.min.val;
  var pDelta = (range / stats.min.val) * 100;
  var tSum = {'num_days' : this.number_of_trade_days_in_view,
    'calendar_days' : this.calendar_days_in_view(),
    'stats' : stats,
    'trade_range' : range,
    'percent_delta' : pDelta};
  return tSum;
}

// Return the existing view_summary if available, otherwise
// compute a new view summary and save it for latter use.
// The private _view_summary is cleared whenever the set_view
// method is called.  Need this to reduce time spent in
// computation overhead for repaint activities where the
// actual data being painted had not changed.
svp.__defineGetter__("view_summary", function()
{
  if (this._view_summary === undefined)
  {
    this._view_summary = this._calc_view_summary();
  }
  return this._view_summary;
});


/* Returns the number of points to skip per pixel or draw unit
 to provide 1 sample unit per drawing unit.
 */
StockView.prototype.calc_items_per_pixel = function(drawWidth)
{
  return this.view_length / drawWidth;
}

StockView.prototype.pixels_per_item = function(drawWidth)
{
  return drawWidth / this.view_length;
}



// Calculate the associated index in current view of the
// element most closely matching the mouse X position in
// in the view.
StockView.prototype.calc_ndx_from_pixel = function(xPixel, chartPixelLeft, chartPixelRight)
{
  var se = this;
  var chart_x =  xPixel -  chartPixelLeft;
  var chart_width = chartPixelRight - chartPixelLeft;
  var items_per_pixel = se.calc_items_per_pixel(chart_width);
  var ndx = Math.floor(chart_x * items_per_pixel) + se.begNdx;
  if (ndx < se.begNdx) ndx = se.begNdx;
  if (ndx > se.endNdx) ndx = se.endNdx;
  return ndx;
}

StockView.prototype.add_data =  function(pData)
{

}


// This is the main entry point for loading the initial
// set of symbols.
StockView.prototype.load_symbol_quotes =  function(pyear, pperiod, callback)
{
  var se = this;
  var stock_bars_uri = "/symbols/" + se.symbol 
    + "/" + pyear + "." + pperiod + ".csv";

  console.log("load uri=" + stock_bars_uri);
  
  res = { 'err' : null,  
          'symbol' : se.symbol,
          'period' : pperiod,
          'year'   : pyear,
          'data'   : null,
          'hReq'   : null,
          'uri'    : stock_bars_uri};
          
  function main_stock_data_arrived(dataStr, hReq)
  {
    if (dataStr === null)
    {
      res.err = "FAILED";
      res.hReq = hReq;
      callback(res);      
      return;
    }
    else
    {
      var tout2 = parse_csv_as_array_of_struct(dataStr);
      res.data = tout2;
      se.add_data(tout2);
      callback(res);
    }
  }
  simpleGet(stock_bars_uri, main_stock_data_arrived);
}


//* END CLASS StockView *
