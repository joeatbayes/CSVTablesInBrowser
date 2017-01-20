
// Beginning point of a stock vector.  originally
// was only going to save the NDX but then realized
// that if we use Ajax to load more data to allow
// lager graph that we will need to know the DateTime
// stamp to find the new index of bar.   As such
// the bar should be computed cache value and will
// need a way to invalidate the bar pointer when new
// bars are added to the view.
function Stock_point(ndx, aBar)
{
  this.ndx = ndx;
  this.bar = aBar;
  return this;
}

function is_stock_vector_complete(tVector)
{
  if (tVector === undefined) return false
  if (tVector.beg === undefined) return false;
  if (tVector.end === undefined) return false;
  return true;
}

function compare_vector_by_date(v1, v2) 
{
  var v1s = v1.beg.bar.dateTime + v1.end.bar.dateTime
  var v2s = v2.beg.bar.dateTime + v2.end.bar.dateTime
  if (v1s > v2s) return 1;
  if (v2s > v1s) return -1;
  return 0;  
}

// Describes two points of stock where one is a beginning
// point and the other is the ending point.   Designed as a
// structure we can use to store a series of vectors where the
// user has clicked to describe the a interesting stock move.
function Stock_vector(beg_ndx, end_ndx, sView)
{
  var beg_bar = sView.get(beg_ndx);
  this.beg = new Stock_point(beg_ndx, beg_bar);
  if ((end_ndx !== undefined) && (end_ndx !== null))
  {
    var end_bar = sView.get(end_ndx);
    this.end = new Stock_point(end_ndx, end_bar);
    this.fixup_date();
  }
  else
    this.end = undefined;
  return this;
}

Stock_vector.prototype.fixup_date = function()
{
   if (this.beg.ndx > this.end.ndx)
   {     
     //alert('attempt fixup ' + this.beg.ndx + " -> " + this.end.ndx);
     var tmp = this.beg;
     this.beg = this.end;
     this.end = tmp;
   }
}

Stock_vector.prototype.num_trade_days = function(sView)
{
   return sView.count_days_in_view(this.beg.ndx, this.end.ndx);
}

Stock_vector.prototype.num_data_points = function()
{
   return Math.abs(this.beg.ndx - this.end.ndx);
}


Stock_vector.prototype.delta = function()
{
  //if (this.end.bar.high > this.beg.bar.low)
  //{ 
  //  // This vector is rising
  //  return this.end.bar.high - this.beg.bar.low;
  //}
  //else
  //{
  //  // this vector is dropping
  //  return this.end.bar.high - this.beg.bar.low;
  //}
  return this.end.bar.close - this.beg.bar.close;
}

Stock_vector.prototype.percent_change = function()
{
  return ((this.delta() / this.beg.bar.close)*100);
}


Stock_vector.prototype.mid_point_ndx = function()
{
  return Math.floor((this.beg.ndx + this.end.ndx) / 2);
}

Stock_vector.prototype.direction = function()
{
  if (this.beg.bar.close == this.end.close)
    return "NC";
  else if (this.beg.bar.close > this.end.close)
    return "DOWN";
  else
    return "UP";
}

Stock_vector.prototype.to_disp_struct = function()
{
  var out = {}
  var cdv = this;
  var delta = cdv.delta();
  var pchange = cdv.percent_change(); 
  var cal_days = calc_calendar_days_delta(cdv.beg.bar.dateTime, cdv.end.bar.dateTime);
  var move_dir = "UP";
  if (cdv.beg.bar.close > cdv.end.bar.close)
      move_dir = "DOWN"
  var num_bar = cdv.end.ndx - cdv.beg.ndx;
  var slope = ((pchange * 100) / num_bar);
  slope = Math.round(slope * 10) / 10;
            
  trec = {
      'delta' : delta, 
      'perc_change' : pchange,    
      'num_bar'     : num_bar,
      'slope'       : slope,
      'cal_days'    : cal_days,
      'move_dir'    : move_dir,
      'beg_close'   : cdv.beg.bar.close.toFixed(2),
      'end_close'   : cdv.end.bar.close.toFixed(2),     
      'cdv'         : cdv,
      'beg_date'    : stock_date_to_disp_date(cdv.beg.bar.dateTime),
      'end_date'    : stock_date_to_disp_date(cdv.end.bar.dateTime)
      }
    return (trec);
}



/* Calculate a basic cartesion similary score and structure 
 based on  the factors calendar_days,  num_bar, perc_change, slope.
*/
Stock_vector.prototype.calc_similary_struct = function(comparePoint, ndx)
{
  var d1 = this.to_disp_struct();
  var d2 = comparePoint.to_disp_struct();  
  var tout = {//'d2_ndx' : d2.cdv.beg.ndx,
              //'d1_ndx' : d1.cdv.beg.ndx,
              'ndx'      : ndx,
              'cal_days' : calc_sim_dist(d1.cal_days, d2.cal_days,0.01),
              'num_bar'  : calc_sim_dist(d1.num_bar, d2.num_bar, 1.0),
              'perc_change' : calc_sim_dist(d1.perc_change, d2.perc_change, 1.0),
              'slope' : calc_sim_dist(d1.slope, d2.slope,1.1)
              }
  var tsum = tout.cal_days + tout.num_bar + tout.perc_change + tout.slope;
  var tavg = (tsum / 4);
  tout['score'] = tavg;
  if (d1.move_dir == d2.move_dir)
   tout['skey'] = 9999 + tavg;
  else
   tout['skey'] = 1111 + tavg;
  return tout;  
  
}


Stock_vector.prototype.to_disp_str = function(sView,ndx)
{
  var cdv = this;
  var ds = this.to_disp_struct();
  ds.trade_days = cdv.num_trade_days(sView);
   
  //cdv.fixup_date();
  //var on_h = "this.scrollIntoView(true); MChart.vector_on_hover(" + ndx + ")";
  var on_h = "MChart.vector_on_hover(" + ndx + ")";
  var did = "vect_" + ndx;
  var txt = "<div class='vect_detail' id='" + did 
              + "' onMouseOver=\'" + on_h + "\'>" 
        + "$" + ds.beg_close + " to  $" + ds.end_close
        + " " + ds.move_dir +  " $" + Math.abs(ds.delta).toFixed(2) 
        + " = " + Math.abs(ds.perc_change.toFixed(2)) + "%"
        + " slope=" + ds.slope + " "
        + "<br/> " + ds.cal_days.toFixed(1) + " cal days"        
        + ", " + ds.trade_days + " trade days"
        + ", " + ds.num_bar + " bars" 
        + "<br/> " + ds.beg_date
        + " to " + ds.end_date + " "
        + "<span class='select' onClick='MChart.vector_remove(" 
          + ndx + ")'>Remove</span>"
        + "<span class='select' onClick='MChart.vector_show_similar(" 
          + ndx + ")'>similar</span>"
        
        +"</div>"
   return txt;
}


function stock_vector_compare(p1, p2)
{
  p1Max = max(p1.beg.dateTime, p1.end.DateTime);
  p2Max = max(p2.beg.dateTime, p2.end.DateTime);
  if (p1Max < p2Max) return -1;
  if (p1Max == p2Max) return 0;
  return 1;
}



//####################
//### BEGIN STOCK VECTORS
//####################
// Stock Vectors an array of vectors normally
// used to track the set of vectors defined
// for a given stock.   Also provides functionality
// to save the array to string and parse from
// string.
function Stock_vectors()
{
  this.rows = [];
  return this;
}


Stock_vectors.__defineGetter__("length", function()
{
  return this.rows.length;
});


Stock_vectors.prototype.push = function(pVar)
{
  this.rows.push(pVar);
}


Stock_vectors.prototype.sort_by_order = function()
{
  return this.rows.sort(stock_vector_compare);
}

Stock_vectors.prototype.remove = function(ndx)
{
  if (ndx <= this.rows.length)
    this.rows.splice(ndx,1);
}



Stock_vectors.prototype.to_json_disp_struct = function(sView)
{
  this.sort_by_date();
  var rows = this.rows;
  tout = [];
  for (var ndx in rows)
  {    
    var cdv = rows[ndx];
    tout.append(cdv.to_disp_struct());
  }
  return tout;
}



Stock_vectors.prototype.to_disp_str = function(sView)
{
  this.sort_by_date();
  var rows = this.rows;
  sb = new String_builder();
  for (var ndx in rows)
  {
    var cdv = rows[ndx];
    sb.push(cdv.to_disp_str(sView, ndx));
    sb.nl();
  }
  return sb.to_str();
}


Stock_vectors.prototype.to_save_str = function()
{
  this.sort_by_date();
  var rows = this.rows;
  var sb = new String_builder();
  for (var ndx in rows)
  {
    var cdv = rows[ndx];
    cdv.fixup_date();
    var tstr = cdv.beg.bar.dateTime + "," + cdv.end.bar.dateTime;
    sb.push(tstr).nl();
  }
  return sb.to_str();
}


// Parse a string which contains a series of begin and end
// timestamps delimited by \n and create a vector array
// containing the vectors which match the associated positions
// in the view.
Stock_vectors.prototype.from_save_str = function(sView, aStr)
{
  var rowsArr = aStr.split("\n");
  var numRow = rowsArr.length;
  for (var ndx=0; ndx<numRow; ndx++)
  {
    var rowStr = rowsArr[ndx];
    var tarr = rowStr.split(",");
    if (tarr.length == 2)
    {
      var begStr = tarr[0];
      var endStr = tarr[1];
      var begNdx = sView.find_date_time(begStr);
      var endNdx = sView.find_date_time(endStr);
      if ((begNdx !== undefined) && (endNdx !== undefined))
      {
        var tVect = new Stock_vector(begNdx, endNdx, sView);
        //tVect.fixup_date();
        this.push(tVect);
      }
    }
  }
  this.sort_by_date();
}


Stock_vectors.prototype.load_local = function(pSymbol)
{

}

Stock_vectors.prototype.save_local = function(pSymbol)
{

}


Stock_vectors.prototype.load_server = function(pSymbol)
{

}


Stock_vectors.prototype.save_server = function(pSymbol)
{

}


Stock_vectors.prototype.sort_by_date = function()
{
  this.rows.sort(compare_vector_by_date);
}

Stock_vectors.prototype.remove_last = function()
{
   if (this.rows.length > 0)
     this.rows.pop();
}



Stock_vectors.prototype.order_by_calendar = function()
{
}


Stock_vectors.prototype.find_lowest_close_by = function()
{
}

Stock_vectors.prototype.find_highest_close_by = function()
{
}


function scores_to_str(scores)
{
   //return JSON.stringify(scores);
   var sb = new String_builder();
   for(var ndx in scores)
   {
     sb.push(scores[ndx][1].ndx).push(" = ");
     sb.push(scores[ndx][0]);
     sb.nl();   
   }
   return sb.to_str();
}


Stock_vectors.prototype.rank_similarity = function(pndx)
{
  var cdv = this.rows[pndx];
  var tout = [];
  var rows = this.rows;
  var numRow = rows.length;
  for(var ndx=0; ndx < numRow; ndx++)
  {    
    if (ndx != pndx)
    {
      srec = cdv.calc_similary_struct(rows[ndx], ndx);
      //alert(JSON.stringify(srec));
      trec = [srec.skey, srec];
      tout.push(trec);
    }
  }
  tout.sort();
  tout.reverse();
  //alert("tout=" + JSON.stringify(tout));
  //alert("tout " + scores_to_str(tout));
  return tout;
}



