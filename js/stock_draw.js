/* Stock_draw main controller for the Charting page.
  Handles most of the logic for interacting between
  the main HTML DIV structure of the page and
  the underlying logic.

  Heavy dependency on jgraph.js which actually draws the graph.
  stock_view.js which controls how many days are shown in the view
  and stock_math which does the underlying indicator math.
 */
// require('js/browser_util.js');
// require('js/simple_ajax.js');
// require('js/stock_math.js');
// require('js/stock_view.js');
// require('js/jgraph.js');

function Stock_draw(aURI) //-- CLASS --
{
  var se = this;
  this.summary = {};
  this.hist = []; // history of stocks loaded in this session used so we do not add the same
                  // stock to the document history more than once.
  this.symbols = [];
  this.symbol  = "CAT";
  var tArr =  aURI.split("#");
  if (tArr.length > 1)
    this.symbol = tArr[1];
  this.stock_view = undefined;
  this.stock_graph = undefined;
  this.drawCanvas = undefined;
  this.stat_div = new Status_div("ajax_message");
  this.loading = true;
  this.stock_code_typed = "";

  function check_if_hash_changed()
  {
    se.check_if_hash_changed();
  }
  setInterval(check_if_hash_changed, 400)
  return this;

} // - end Class Constructor


Stock_draw.prototype.set_mouse_over_chart = function(bflag)
{
  if (this.stock_graph !== undefined)
  {
    this.stock_graph.mouse_is_over = bflag;
  }
}

Stock_draw.prototype.check_if_hash_changed =  function()
{
  if (this.loading == true) return;
  var tarr = location.href.split("#");
  if (tarr.length > 1)
  {
    var hash_part = tarr[1];
    if (hash_part != this.symbol)
      this.load_symbol(hash_part);
  }
}


// Convienence methods for logging
Stock_draw.prototype.log =  function(msg)
{
  this.stat_div.log(msg)
}

Stock_draw.prototype.log_clear =  function(msg)
{
  this.stat_div.clear()
}

Stock_draw.prototype.br =  function(msg)
{
  this.stat_div.br()
}


Stock_draw.prototype.set_view_days =  function(numDays)
{
  //alert("setZoomDays=" + numDays);
  this.stock_graph.set_view_days(numDays);
}


Stock_draw.prototype.draw_start_non_block =  function()
{
  //simpleGet("AA.2011.M10.csv", test_data_arrived);

}


Stock_draw.prototype.set_scale_current =  function()
{
  //alert("set_scale_current");
  this.stock_graph.calc_vert_scale(this.stock_view);
  this.stock_graph.draw_all();
}


Stock_draw.prototype.set_scale_freeze =  function()
{
  //alert("set_scale_freeze");
  this.stock_graph.auto_zoom = false;
}



Stock_draw.prototype.set_scale_auto =  function()
{
  this.stock_graph.auto_zoom = true;
  //alert("set_scale_auto");
}
// End Class Methods



// Main Entry point for when a new symbol has been
// requested.  Triggers the ajax for loading and
// rendering of the approapriate parts once the
// data returns.
Stock_draw.prototype.load_symbol =  function(symbol)
{
  if (symbol == this.symbol)
    return;

  this.clear_symbol_typed();

  this.loading = true;
  if (symbol === undefined)
    symbol = this.symbol;
  this.log_clear();
  this.load_symbol_quotes(symbol);
  this.load_symbol_summary(symbol);
}

// This is the main entry point for loading the initial
// set of symbols.
Stock_draw.prototype.update_history =  function(pSymbol, stateObj, pTitle, pUri)
{
   "use strict";
    var se = this;
    for (var hndx in se.hist)
    {
      if (se.hist[hndx] == pSymbol)
      {
        location.href = pUri;
        return true;  // already in history
      }
    }
    // Didn't find in my local history so will
    // add it.
    se.hist.push(pSymbol);
    if (history.pushState !== undefined)
        history.pushState(stateObj, pTitle, pUri);
    else
      location.href = pUri;
}

// This is the main entry point for loading the initial
// set of symbols.
Stock_draw.prototype.load_symbol_quotes =  function(symbol)
{
  var se = this;
  se.symbol = symbol;  
  //var stock_bars_uri = "/symbols/" + symbol + "/2012.M10.csv";
  var stock_bars_uri = "/symbols/" + symbol + "/2013.M10.csv";
  document.title = "Interactive " + symbol;
  var dest_href = location.href.split("#")[0] + "#" + symbol;
  //location.href =  dest_href;
  var stateObj = {'symbol' : symbol, 'bar_uri' : stock_bars_uri};
  se.update_history(symbol, stateObj, document.title, dest_href);

  // define this method inside of inner context
  // to preserve access to the this during callback

  function main_stock_data_arrived(dataStr, hReq)
  {
    if (dataStr === null)
    {
      se.loading = false;
      set_div_contents("symbol_summary", "FAILED");
      set_div_contents("symbol_performance", "FAILED");
      set_div_contents("view_summary", "FAILED");
      se.drawCanvas.getContext('2d').clear();
      se.log("Error on Load " + hReq.status + " " + hReq.statusText)
      return;
    }

    set_div_contents("active_symbol_info", symbol);
    se.log("quotes received " + dataStr.length + " bytes ");
    var tout2 = parse_csv_as_array_of_struct(dataStr);
    var drawCanvas = document.getElementById("graphBig");
    se.drawCanvas = drawCanvas;
    se.log("parsed " + tout2.rows.length + " rows ");
    se.stock_view = new StockView(symbol, tout2);
    se.stock_graph = new Stock_graph_canvas(drawCanvas, se.stock_view);
    se.stock_graph.mouse_posit_stock_div = document.getElementById("mouse_posit_stock_div");
    se.stock_graph.view_summary_div = document.getElementById("view_summary");
    se.stock_graph.draw();
    se.stock_graph.render_symbol_performance("symbol_performance");
    se.loading = false;
    se.stock_graph.on_stock_loaded();
  }
  simpleGet(stock_bars_uri, main_stock_data_arrived);
}

Stock_draw.prototype.vectors_clear =  function()
{
  this.stock_graph.vectors_clear_local_storage();
}

Stock_draw.prototype.vectors_remove_last =  function()
{
  this.stock_graph.vectors_remove_last();
}

Stock_draw.prototype.vector_on_hover = function(ndx)
{
  this.stock_graph.vector_hover(ndx);
}


Stock_draw.prototype.vector_remove = function(ndx)
{
  this.stock_graph.vector_remove(ndx);
}


Stock_draw.prototype.vector_show_similar = function(ndx)
{
  this.stock_graph.vector_show_similar(ndx);
}


// Returns the list of all symbols currently shown in the
// directory list.   This is used to render the list of
// symbols that can be loaded by clicking.
Stock_draw.prototype.load_symbol_list =  function()
{
  var se = this;
  var turi = "/symbols";
  // define this method inside of inner context
  // to preserve access to the this during callback
  function data_arrived(dataStr, hReq)
  {
    if (dataStr === null)
    {
      se.loading = false;
      set_div_contents("stock_list", "FAILED LOADING SYMBOL LIST");
      se.log("Error on Load " + hReq.status + " " + hReq.statusText + " on URI:" + turi);
      return;
    }
    se.log("load symbols received " + dataStr.length + " bytes ");
    var trows = dataStr.split("\n");
    se.symbols = trows;
    se.render_symbol_list(trows);
  }
  simpleGet(turi, data_arrived);
}

Stock_draw.prototype.stock_code_change =  function(new_value)
{
   //alert("stock_code_change evt=" + evt.toString());
  this.stock_code_typed = new_value.toUpperCase().trim();
  this.render_symbol_list(this.symbols,  this.stock_code_typed);
}

// receives key press events from the input field which
// then needs to attempt to load the stock if the user
// hits enter or tab while in the field.
Stock_draw.prototype.stock_code_key_down = function(ifield, evt)
{
   if ((evt.keyCode ==13) || (evt.keyCode == 9))
   {
     evt.returnValue=false;
     if (this.symbols.indexOf(this.stock_code_typed) != -1)
     {
       ifield.value = "";
       this.load_symbol(this.stock_code_typed);
       this.render_symbol_list(this.symbols);
     }
     else
     {
       alert("can not load stock " + this.stock_code_typed + " because not available on server");
     }
     return false;
   }
   evt.returnValue=true;
   return true;
}

Stock_draw.prototype.clear_symbol_typed =  function()
{
  // Clear and re-render the symbol list filter from typ0ed input
  if ((this.stock_code_typed.length > 0) && (this.symbols.length > 1))
  {
    this.stock_code_typed = "";
    var tfld = document.getElementById("stock_input_field");
    if (tfld !== undefined)
    {
      tfld.value = "";
    }
    this.render_symbol_list(this.symbols);
  }
}

// Render the list of stock symbols which can be
// clicked to load that symbol into the graph view.
Stock_draw.prototype.render_symbol_list =  function(trows, filter)
{
  var se = this;
  var ts = "";
  var sb = new String_builder();
  var sbp = new String_builder();
  for (ndx in trows)
  {
    var symbolName = trows[ndx].toUpperCase().trim();
    if ((filter !== undefined) && (symbolName.indexOf(filter) == -1))
      continue;   // does not match the filter string.
    var tat = {
      'class' : 'sselect',
      'onClick' : 'MChart.load_symbol(\'' + symbolName + '\')'};
    if (filter == symbolName)
      sbp.make_element("span", tat, symbolName);
    else
      sb.make_element("span", tat, symbolName);
  }
  sbp.push(sb.to_str());  // add trailing list to end of leading
  sbp.to_div("stock_list");
}



Stock_draw.prototype.load_symbol_summary =  function(symbol)
{
  var se = this;
  se.summary = {};
  se.symbol = symbol;
  se.clear_summary_view();

  var turi = "/symbols/" + symbol + "/" + symbol + ".ini.txt";
  // define this method inside of inner context
  // to preserve access to the this during callback
  function data_arrived(dataStr, hReq)
  {
      if (dataStr === null)
      {
          se.loading = false;
          set_div_contents("symbol_profile", "FAILED LOADING SYMBOL PROFILE");
          set_div_contents("symbol_desc", "");
          se.log("Error on Load " + hReq.status + " " + hReq.statusText + " on URI:" + turi);
          return;
      }
      else
      {
          se.log("load symbol summary " + dataStr.length + " bytes ");       
          se.summary = parseAssocArray(dataStr);          
          se.draw_summary_view(se.summary);
      }
  }
  simpleGet(turi, data_arrived);
}



Stock_draw.prototype.draw_summary_view =  function(psum)
{
  var se = this;
  if (psum.description !== undefined)
  {
      set_div_contents("symbol_desc", psum.description);
      document.title = "JTRADE  " + se.symbol + "   " + psum.description;
  }

  var nchange = parseFloat(psum.change);
  var day_high = parseFloat(psum.high);
  var day_low = parseFloat(psum.low);
  var day_range = day_high - day_low;
  var day_pchange = (day_range / day_low) * 100;

  var chg_dir = "up";
  var chg_class = "symbol_change_pos";
  if (nchange < 0)
  {
     chg_dir = "down";
     chg_class = "symbol_change_neg";
  }

  var sb = new String_builder();
  sb.push("<h3>" + this.symbol + " - " +  psum.description + "</h3>");
  sb.start_element("span", {'class' : chg_class});

  sb.push("last  " + psum.last);
  sb.push(" " + chg_dir + " ");
  sb.push("$" + psum.change);
  sb.push(" = " + psum.change_percent);
  sb.finish_element("span").br();

  sb.push(" open: " + psum.open);
  //sb.push(" close: " + psum.close).br();
  sb.br();
  sb.push(" high: " + psum.high);
  sb.push(" low: " + psum.low)
  sb.br();
  sb.push(" day_range: $" + day_range.toFixed(2) + " = " + day_pchange.toFixed(1) + "%").br();
  sb.push(" volume: " + psum.volume).br();
  sb.br();
  sb.push("<h4>year</h4>");
  sb.push("high: " + psum.year_high + " low: " + psum.year_low).br();
  sb.push("<small>");
  sb.push(se.symbol + " on ");
  var tat = {
    'href' : "http://finance.yahoo.com/q/pr?s=" + se.symbol,
    'target' : "yahoo" + "_" + se.symbol };
  var eTxt = " Yahoo";
  sb.make_element("A", tat, eTxt).push(" ");

  tat = {
    'href' : "http://www.thestreet.com/quote/" + se.symbol + "/details/analyst-ratings.html",
    'target' : "street" + "_" + se.symbol };
  eTxt =  "The Street";
  sb.make_element("A", tat, eTxt).push(" ");

  tat = {
    'href' : "http://www.marketwatch.com/investing/stock/" + se.symbol,
    'target' : "mw" + "_" + se.symbol };
  eTxt =  "Market Watch";
  sb.make_element("A", tat, eTxt).br();
  sb.push("</small>");




  //var l30 = se.stock_view.get_range_last_days(30)




  sb.to_div("symbol_profile");
}


Stock_draw.prototype.clear_summary_view =  function(symbol)
{
  document.title = "JTRADE  " + symbol;
  set_div_contents("symbol_desc", "LOADING");
  set_div_contents("symbol_summary", "");
  set_div_contents("symbol_performance", "LOADING");
  set_div_contents("symbol_profile", "LOADING");
  set_div_contents("view_summary", "LOADING");
  set_div_contents("vectors_info", "");
}
