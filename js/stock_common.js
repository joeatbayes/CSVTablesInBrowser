// stock_common.js
// functions used by a wide variety of pages interacting with the 
// stock system. 

function parse_stock_date(aDateStr)
{
  var a = aDateStr.split(/[^0-9]/);  
  //for (i=0;i<a.length;i++) { alert(a[i]); }
  var d = new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);
  var estOffset = (d.getTimezoneOffset() - 300) * 60 * 1000;
  var tms = d.valueOf() - estOffset;
  d.setTime(tms);
  //var tDateStr = (aDateStr + " " + d.toDateString());
  //alert(aDateStr)
  return d
}

function NowAsEST()
{
  var d = new Date();
  var ESTOffset = (d.getTimezoneOffset() - 300) * 60 * 1000; // adjust from local time zone to EST 
  var tms = d.valueOf() - estOffset;
  d.setTime(tms);
  return d;
}

// produce URI for location of price data file in form of
// uri=/jtdata/symbols/VXX/options/2013-06-22/VXX.014.00.put.csv
function make_option_price_data_uri(symbol, expires, strikePrice, optType)
{
  strikePrice = strikePrice.trim(); // input data had the last zero
  tnum = parseFloat(strikePrice);   // removed from strike price so
  strikePrice = tnum.toFixed(2);    // this adds it back. 
  while (strikePrice.length < 6)
  {
    strikePrice = "0" + strikePrice;
  }

  var tout = "/jtdata/symbols/" + symbol + "/options/"
              + expires + "/" + symbol + "." + strikePrice
              + "." + optType + ".csv";

  return tout;
}

function make_option_price_table_link(symbol, expires, strikePrice, optType, dispLabel)
{
  var tlabel = dispLabel;
  if (tlabel == undefined) tlabel = strikePrice;

  var tout = "<a href='/opt_price.html"
              + "?sym=" + symbol
              + "&expires=" + expires
              + "&strike=" + strikePrice
              + "&otype=" + optType
              + "' "
              + "target='csvoptdet'>" + tlabel + "</a>";

  return tout;
}

