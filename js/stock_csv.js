function parse_stock_date(aDate)
{
  var s = '2011-06-21T14:27:28.593Z';
  var a = s.split(/[^0-9]/);
  //for (i=0;i<a.length;i++) { alert(a[i]); }
  var d=new Date (a[0],a[1]-1,a[2],a[3],a[4],a[5] );
  alert(s+ " "+d);
}

// Note:  Switched over to formal object so we can add
//  methods at the prototype level.  Not sure what impact
// on performance will be.
function Stock_bar(dateTime, day, open, close, high, low, volume)
{
  this.dateTime = dateTime;
  this.day = day;
  this.open = open;
  this.close = close;
  this.high = high;
  this.low  = low;
  this.volume = volume;
  var dateArr = dateTime.split(" ");
  this.date  =  dateArr[0];
  this.time  =  dateArr[1];
  return this;
}


function Stock_data()
{
   this.symbol = "";
   this.rows = [];  // Array of instances of Stock_Bar
   this.head = [];
}

Stock_data.prototype.lastNdx = function()
{
  this.rows.length - 1;
}

Stock_data.prototype.isEmpty = function()
{
    return (this.rows.length == 0);
}

Stock_data.prototype.lastRow = function()
{
    return this.rows[this.rows.length - 1];
}


      
function parse_csv_as_array_of_struct(dataStr)
{
        var trows = dataStr.split("\n");
        out = new Stock_data();
        var rows = out.rows;
        var headLine = trows.shift();
        var headFlds = headLine.split(",");
        var numFlds  = headFlds.length;
        out.head = headFlds;
        for (ndx in trows)
        {
           var trow = trows[ndx];
         //var trow = trim(trows[ndx]);
         //if (trow.length == 0) continue
         var tarr = trow.split(",");
         if (tarr.length == numFlds)
         {
           // Only save when the number
           // of fields is the same as number
           // expected.  Otherwise expect error
           // or comment line.
           var tBar = new Stock_bar(
              tarr[0], // dateTime,
              tarr[1], // day,
              parseFloat(tarr[2]), // open
              parseFloat(tarr[3]), //close
              parseFloat(tarr[4]), //high
              parseFloat(tarr[5]), //low
              parseInt(tarr[6])  //volume
              );
           rows.push(tBar);

           // Switched over to formal object instance
           // with constructor so we can add helper
           // methods at the row level.  TODO:  check
           // performance difference for the two approaches.
           //var dateArr = tarr[0].split(" ");
           //var t = {'dateTime' : tarr[0],
           //  'date' : dateArr[0],
           //  'time' : dateArr[1],
           //  'day' : tarr[1],
           //'open' : parseFloat(tarr[2]),
           //'close' : parseFloat(tarr[3]),
           //'high' : parseFloat(tarr[4]),
           //'low' : parseFloat(tarr[5]),
           //'volume' : parseInt(tarr[6])};
          // Note:  Want to avoid check for NAN
          // if possible due to overhead of compare
          // which could be considerable when parsing
          // large number of rows.  
          //   rows.push(t);
         }
        }    
              //alert(" parsed " + out.length + " rows");        
        return out;
}
      
function parse_csv_as_array_of_row(dataStr)
{
        var trows = dataStr.split("\n");
        var out = []
        for (ndx in trows)
        {
           var trow = trows[ndx];
         var tarr = trow.split(",");
         var t = [tarr[0], tarr[1],
            parseFloat(tarr[2]),
          parseFloat(tarr[3]),
          parseFloat(tarr[4]),
          parseFloat(tarr[5]),
          parseInt(tarr[6])];
         out.push(t);
        }    
              //alert(" parsed " + out.length + " rows");        
        return out;
}
      
function test_data_arrived(dataStr)
{
        var statMsg  = document.getElementById("ajax_message");
        var msg = "received " + dataStr.length + " bytes ";
        //alert(msg);
        //var tout = parse_csv_as_array_of_row(dataStr);

        statMsg.innerHTML += msg;
        var tout2 = parse_csv_as_array_of_struct(dataStr);
        var drawCanvas = document.getElementById("graphBig");
        var msg = "parsed " + tout2.rows.length + " rows ";
        statMsg.innerHTML = msg;
        var sv = new StockView(tout2)
        var tgraph = new Stock_graph_canvas(drawCanvas);
        tgraph.draw(sv);
        statMsg.innerHTML +=  "<br/>";
}
            
function run_test_non_bock()
{
  //simpleGet("AA.2011.M10.csv", test_data_arrived);
  simpleGet("AA.2012.M10.csv", test_data_arrived);

}
      
function run_test_blocking()
{
  var tstr = simpleGetBlock("test.txt", test_data_arrived);
  sgraph_draw(test_data);
}

