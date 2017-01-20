/*
  require('js/stock_math.js');
  require('js/browser_util.js');
  require('js/simple_ajax.js');
  require('js/stock_math.js');
  require('js/stock_view.js');
  require('js/jgraph.js');

 convert to object which contains it's own se.sView.data set.
  select granulatiry of points from larger se.sView.data set to this.canvas.
  Remember where previou points have been drawn to allow mouse click.
  Allow user to select graph node points to place high / low selections.
  
  When selecting points to draw then must select previously chosen user point
  if one has been set.  
  
  Allow user to scale in or out.
  Allow user to sroll left or right.
  
  Recieves an array of stock se.sView.data in the form of
  a associate arrays.   created by stock_csv. 
  draws a graph context for that stock array
  
  Selects the set of se.sView.data needed to allow full drawing
  resultion and then computes the necessary scale for
  drawing.
  
  The current view point represents a beginning and
  ending context with the current se.sView.data set for which 
  the window scaled and rendered.  
  
  The current viewport can be scrolled left or 
  right to the limits of the available se.sView.data. 
  
  The system will arbitrarily grab representative
  labels for rendering from the current view port.
  se.sView.data. 
  
  Note:  If  Should treat the values of open, close, high low 
    as separate arrays so we can use the same array to render
    or come up with another se.sView.data based way to access rendering
    loop

*/

StockGraphMinPointsInView = 18;
Drawing_mode_none = 0;
Drawing_mode_vector = 1;
Drawing_mode_rubberband = 2;


MouseButtonLeft = 0;
MouseButtonCenter = 1;
MouseButtonRight = 2;

/*TODO:  Move to se.canvas_util.js */
// needed to allow se.canvas to resize to fit new Div size
// because se.canvas does not properly adjust size to 
// reflect changing page sizes. 
function setCanvasSizeToContainerSize(drawCanvas)
{
  //drawCanvas.style.width  = drawCanvas.parentElement.style.width;
  //drawCanvas.style.height  = drawCanvas.parentElement.style.height;
  drawCanvas.height = drawCanvas.parentElement.clientHeight - 10;
  drawCanvas.width = drawCanvas.parentElement.clientWidth - 15;
  //drawCanvas.height = drawCanvas.parentElement.style.height;
  //drawCanvas.width = drawCanvas.parentElement.style.width;

  //alert ("height=" +  drawCanvas.height +  " width" +  drawCanvas.width);
}

// needed because se.canvas.width does not change
// correctly after the se.canvas is resized.
function getCanvasDrawWidth(drawCanvas)
{
  return drawCanvas.clientWidth;
}

// needed because se.canvas.width does not change
// correctly after the se.canvas is resized.
function  getCanvasDrawHeight(drawCanvas)
{
  return drawCanvas.clientHeight;
}

var mathDegreeMultiplier = Math.PI / 180;
function drawAngledText(ctx, txt,x,y,angle)
{
    ctx.save();
    ctx.beginPath();
    ctx.translate(x,y)
    ctx.textBaseline = "center";
    ctx.rotate(mathDegreeMultiplier * angle);
    ctx.fillText(txt, 0, 0);
    ctx.closePath();
    ctx.restore();
}

function getMousePos(canvas, evt)
{
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;
    var mouseX = (evt.clientX - rect.left) - root.scrollLeft;
    var mouseY = (evt.clientY - rect.top) - root.scrollTop;
    var mouseDiv  = document.getElementById("mouse_pos");
    if (mouseDiv !== undefined)
    {
        tmsg = ""
            + " top=" + rect.top
            + " left=" + rect.left
            + " right=" + rect.right
            + " bottom=" + rect.bottom
            + " evtX=" + evt.clientX
            + " evtY=" + evt.clientY
            + " mouseX=" + mouseX
            + " mouseY=" + mouseY
        mouseDiv.innerHTML = tmsg;
    }
    return { x: mouseX, y: mouseY };
}

function Point(x,y)
{
   this.x = x;
   this.y = y;
}



/* A class to combine stock View with graph view
  so we can have basically render different charts
  on different chunks of the se.canvas.  After constuction
  assumption is user may change xPadd, yPadd top and
  bottom and the system should recase the effective
  view point for rendering.
 */
function GraphView(drawCanvas, pStockView)
{
    var se = this;
    se.sView = pStockView;
    se.canvas = drawCanvas;
    setCanvasSizeToContainerSize(this.canvas);
    se.c = this.canvas.getContext('2d');
    se.drawHeight = se.getDrawHeight(this.canvas);
    se.drawWidth  = se.getDrawWidth(this.canvas);
    se.xPaddLeft  = 30;
    se.xPaddRight = 30;
    se.yPaddTop   = 30;
    se.yPaddBot   = 30;
    se.pixelPerXLabel = {'x' : 30, 'y' : 60};
    se.pixelPerYLabel = {'x' : 60, 'y' : 30};
    se.zoom_vector = null;

}

GraphView.prototype.xPadd = function()
{
   return this.xPaddLeft + this.xPaddRight;
}

GraphView.prototype.yPadd = function()
{
  return this.yPaddTop + this.yPaddBot;
}

GraphView.prototype.chartHeight = function()
{
    return this.drawHeight - this.yPadd();
}

GraphView.prototype.chart_width = function()
{
    return this.drawWidth - this.xPadd();
}

GraphView.prototype.botLeft = function()
{
    this.yBottom  = this.drawHeight - this.yPaddBot;
    return {'x' : this.xPaddLeft, 'y' :  se.chart_bottom};
}

GraphView.prototype.topRight = function()
{
    this.yTop    = 0 + this.yPaddTop;
    var yRight   = this.drawWidth - this.xPaddRight;
    return {'x' : yRight, 'y' : se.chart_top}
}

// -- END Class GraphView --



function Stock_graph_canvas(drawCanvas, sView)
{
    var se = this;
    se.mouse_is_over = false;
    se.sView = sView;
    se.mouse_posit_stock_div = undefined;
    se.view_summary_div = undefined;
    se.canvas = drawCanvas;
    setCanvasSizeToContainerSize(drawCanvas);
    se.c = drawCanvas.getContext('2d');
    se.xPadding = 40;
    se.yPadding = 90;
    se.drawHeight = undefined;
    se.drawWidth = undefined;
    se.chart_bottom  = undefined;
    se.chart_top     = undefined;
    se.chart_left    = undefined; // left most pixel where we are drawing line portion of chart.
    se.chart_right   = undefined; // right most pixel where we are drawing line portion of chart.
    se.chartHeight   = undefined;
    se.chart_width   = undefined;
    se.maxY = undefined;
    se.minY = undefined;
    se.avg  = undefined;
    se.rangeY = undefined;
    se.pixPerY = undefined;
    se.auto_zoom  = true;
    se.curr_drawing_mode = Drawing_mode_none;
    se.curr_draw_vector  = null;


    se.calc_chart_bounds(se.sView);

    se.open_vector = null;
    se.vectors = new Stock_vectors();  // set of currently defined vectors.
    se.lastMousePos = new Point(se.drawHeight/2, se.drawWidth/2);
    se.lastMouseNdx = 10;
    se.lastMouseVal = 0;

    se.canvas.addEventListener('mousemove',
     function(evt) {return se.on_mouse_move(evt)});

    se.canvas.addEventListener('mousedown',
    function(evt) {return se.on_mouse_down(evt)},true);

    se.canvas.addEventListener('mouseup',
    function(evt) {return se.on_mouse_up(evt)},true);

    se.canvas.onmouseover =
      window.addEventListener(
        'keydown',
        function(evt){return se.on_key_down(evt)},
        true);

    se.vectors_load_from_local_storage();

}; // end constuctor


Stock_graph_canvas.prototype.vectors_load_from_local_storage = function()
{
  var se = this;
  var vectors_storage_key = se.vectors_storage_key();
  var vectors_str = localStorage.getItem(vectors_storage_key);
  if (vectors_str != null)
  {
    se.vectors.from_save_str(se.sView, vectors_str);
  }
}

Stock_graph_canvas.prototype.vectors_save_to_local_storage = function()
{
  var se = this;
  var vectors_storage_key = se.vectors_storage_key();
  var data_str = se.vectors.to_save_str();
  localStorage.setItem(vectors_storage_key, data_str);
  return data_str;
}

Stock_graph_canvas.prototype.vectors_clear_local_storage = function()
{
  var se = this;
  var vectors_storage_key = se.vectors_storage_key();
  localStorage.removeItem(vectors_storage_key);
  se.vectors = new Stock_vectors();
  se.redraw_all();
  se.draw_vectors_summary();
}

Stock_graph_canvas.prototype.vectors_storage_key = function()
{
  return this.sView.symbol + "_vectors";
}

Stock_graph_canvas.prototype.vectors_remove_last = function()
{
  var se = this;
  se.vectors.remove_last();
  se.redraw_all();
  se.draw_vectors_summary();
  se.vectors_save_to_local_storage();
}



Stock_graph_canvas.prototype.calc_pixels_per_item = function ()
{
  return this.sView.calc_items_per_pixel(this.chart_width);
}


Stock_graph_canvas.prototype.calc_items_per_pixel = function (tval)
{
  return this.sView.calc_items_per_pixel(this.chart_width);
}


Stock_graph_canvas.prototype.calc_y_pixel_for_value = function (tval)
{
  var se = this;
  var c = se.c;
  var aboveMin = tval -  se.minY.val;
  var pixMove = Math.floor(se.pixPerY * aboveMin);
  var cYPix =  se.chart_bottom - pixMove;
  return cYPix;
}

Stock_graph_canvas.prototype.get_point_from_ndx = function(ndx)
{
  var se = this;
  var tbar = se.sView.get(ndx);
  var pixels_per_item = se.chart_width / se.sView.view_length;
  var ndx_rel_to_view = ndx - se.sView.begNdx;
  var pix_rel_to_view = pixels_per_item * ndx_rel_to_view;
  var xPix = se.chart_left + pix_rel_to_view
  var yPix = se.calc_y_pixel_for_value(tbar.close);
  return new Point(xPix, yPix);
}

Stock_graph_canvas.prototype.calc_chart_bounds =  function(sView)
{
  var se = this;
  se.drawHeight = se.getDrawHeight();
  se.drawWidth = se.getDrawWidth();
  se.chart_bottom  = se.drawHeight - se.yPadding;
  se.chart_top     = 0 + (se.yPadding / 2);
  se.chartHeight =  se.chart_bottom - se.chart_top;
  se.chart_width  = se.drawWidth -  se.xPadding * 1.5;
  se.chart_left    = 0 +  se.xPadding;
  se.chart_right   = se.chart_left + se.chart_width;
}

Stock_graph_canvas.prototype.calc_vert_scale = function(sView)
{
  var se = this;
  var tsum = se.sView.view_summary;
  se.maxY = tsum.stats.max; // stockFindMax(sView.data, sView.begNdx, sView.endNdx, sView.label);
  se.minY = tsum.stats.min; // stockFindMin(sView.data, sView.begNdx, sView.endNdx, sView.label);
  se.avg  = tsum.stats.avg; // stockAverage(sView.data, sView.begNdx, sView.endNdx, sView.label);
  se.rangeY = tsum.trade_range;
  se.pixPerY =  se.chartHeight /  se.rangeY;
}

/* on_stock_loaded forces all the text areas to render 
* as well as graphic areas. */
Stock_graph_canvas.prototype.on_stock_loaded = function()
{ 
  var se = this;
  se.redraw_all(se.sView);
  se.render_view_summary(se.sView);
  se.draw_vectors_summary(se.sView);  
}

Stock_graph_canvas.prototype.draw = function(sView)
{
  var se = this;  
  var c = se.c;  
  setCanvasSizeToContainerSize(se.canvas);
  //this.sView.
  if (sView === undefined)
    sView = se.sView; // use our main instance sView if not specified
  se.calc_chart_bounds(sView);
  se.calc_vert_scale(sView);
  se.draw_all(sView);
} // end draw()


Stock_graph_canvas.prototype.redraw_all = function (sView)
{
  var se = this;
  se.c.clearRect(0,0, se.canvas.width, se.canvas.height);
  if (sView == undefined)
    sView = se.sView; // use our main instance sView if not specified
  se.draw_all(sView);
}


Stock_graph_canvas.prototype.draw_all = function (sView)
{
  var se = this;
  if (sView == undefined)
    sView = se.sView; // use our main instance sView if not specified

  if (se.auto_zoom)
  {
    se.calc_vert_scale(sView);
  }
  se.draw_axis(sView);
  se.draw_y_labels(sView);
  se.draw_x_labels(sView);
  se.drawMouseBall(sView);
  se.draw_chart_line(sView);
  se.draw_y_labels_right(sView);
  se.render_mouse_bar_text(sView);
  se.draw_vectors();  
}

Stock_graph_canvas.prototype.drawMouseBall = function ()
{
  var se = this;
  var c = se.c;
  var mPos = se.lastMousePos;
  // draw mouse ball
  var lineY = se.calc_y_pixel_for_value(se.lastMouseVal);
  c.beginPath();
  c.arc(mPos.x, lineY, 3, 0, 2 * Math.PI, false);
  c.fillStyle = 'red';
  c.fill();
  c.lineWidth = 1;
  c.strokeStyle = '#003300';
  c.stroke();
  c.closePath();

  var txmp = se.lastMousePos;
  // now re-draw based on the main user
  var ndx = se.sView.calc_ndx_from_pixel(mPos.x, se.chart_left, se.chart_right);
  var row = se.sView.get(ndx);
  var tx = se.get_point_from_ndx(ndx);
  c.beginPath();
  c.fillStyle = 'red';
  c.lineWidth = 1;
  c.strokeStyle = '#003300';
  c.moveTo(tx.x, tx.y-35);
  c.lineTo(tx.x, tx.y-1);
  c.stroke();
  c.closePath();


}



// left click = evt.button = 0;
// right click = evt.button = 2;
// evt.ctrlKey
// evt.shiftKey
// canvas.onmousewheel
// canvas.onclick
// canvas.onclick
Stock_graph_canvas.prototype.clear_drawing_modes = function ()
{
  this.curr_draw_vector = undefined;
  this.curr_drawing_mode = Drawing_mode_none;
}

// When Mouse down it starts a drawing bounds.  when in
// left click down then draw vector.   On right click
// starts.
Stock_graph_canvas.prototype.on_mouse_down = function (evt)
{
  var se = this;
  switch (evt.button)
  {
    case MouseButtonCenter:
      return se.on_mouse_down_middle(evt);
    case MouseButtonLeft:
      return se.on_mouse_down_left(evt);
    case MouseButtonRight:
      return se.on_mouse_down_right(evt);
  }
}

/* Change active zoom window on stock to show only the beg_ndx
and end_ndx.    Forces refresh of graph view window */
Stock_graph_canvas.prototype.set_view = function (beg_ndx, end_ndx)
{
  var se = this;
  se.sView.setView(se.curr_draw_vector.beg.ndx, se.curr_draw_vector.end.ndx);
  se.on_view_changed();
}

Stock_graph_canvas.prototype.on_view_changed = function()
{
  var se = this;
  se.render_view_summary(se.sView);
  //se.clear_drawing_modes();
  se.redraw_all();
  //se.vectors_scroll_to_first_in_view(se.sView);
}



Stock_graph_canvas.prototype.on_mouse_down_middle = function (evt)
{
  var se = this;
  var c = se.c;
  var mPos = getMousePos(se.canvas, evt);
  var ndx = se.sView.calc_ndx_from_pixel(mPos.x, se.chart_left, se.chart_right);
  // Draw bounds based on drawing mode.
  if (se.curr_drawing_mode == Drawing_mode_none) // Start Zoom Rubber band
  { // No mode active, so start rubber band for zoom
    se.curr_draw_vector = new Stock_vector(ndx, null, this.sView);
    se.curr_drawing_mode = Drawing_mode_rubberband;
  }
  else if (se.curr_drawing_mode == Drawing_mode_rubberband)
  {
    if (is_stock_vector_complete(se.curr_draw_vector))
    { // Have all the information needed so activated the zoome.
      var tnum = se.curr_draw_vector.num_data_points();
      if (tnum > 5)
      { // Zoom to the bounding box.
        se.set_view(se.curr_draw_vector.beg.ndx, se.curr_draw_vector.end.ndx);      
        se.clear_drawing_modes();  
      }
    }
    se.clear_drawing_modes();
    se.redraw_all();
  }
  else
  {  // Clear any other active modes
    se.clear_drawing_modes();
    se.redraw_all();
  }
  evt.returnValue=false;
  return false;
}


Stock_graph_canvas.prototype.on_mouse_down_left = function (evt)
{
  var se = this;
  var c = se.c;
  var mPos = getMousePos(se.canvas, evt);
  var ndx = se.sView.calc_ndx_from_pixel(mPos.x, se.chart_left, se.chart_right);

  if (se.curr_drawing_mode == Drawing_mode_none) // Start Zoom Rubber band
  { // No mode active, so start rubber band for zoom
    se.curr_draw_vector = new Stock_vector(ndx, null, this.sView);
    se.curr_drawing_mode = Drawing_mode_vector;
  }
  else if (se.curr_drawing_mode == Drawing_mode_vector)
  {
    if (se.close_curr_vector(ndx) == true)
    {
      se.clear_drawing_modes();
      se.redraw_all();
    }
  }
  else
  {
    se.clear_drawing_modes();
    se.redraw_all();
  }
}

Stock_graph_canvas.prototype.draw_vectors_summary = function ()
{
   var se = this;
   var disp_str = se.vectors.to_disp_str(se.sView);
   set_div_contents("vectors_info", disp_str);
}


Stock_graph_canvas.prototype.on_mouse_down_right = function (evt)
{
  var se = this;
  var c = se.c;
  alert("no right mouse handler defined yet")
  evt.returnValue=false;
  return false;
}


Stock_graph_canvas.prototype.on_mouse_up = function (evt)
{
  var se = this;
  var c = se.c;
  var mPos = getMousePos(se.canvas, evt);
  var ndx = se.sView.calc_ndx_from_pixel(mPos.x, se.chart_left, se.chart_right);

  // Check for current drawing mode to see what action we need
  // to take on the mouse up.
}



Stock_graph_canvas.prototype.on_mouse_move = function (evt)
{
  var se = this;
  var c = se.c;
  var mPos = getMousePos(se.canvas, evt);
  var ndx = se.sView.calc_ndx_from_pixel(mPos.x, se.chart_left, se.chart_right);
  se.lastMousePos = mPos;
  se.lastMouseNdx = ndx;
  se.lastMouseVal = se.sView.getVal(ndx);
  se.redraw_all();
  se.draw_bound_rect(ndx, mPos);
  se.draw_curr_vector(ndx, mPos);
}


Stock_graph_canvas.prototype.close_curr_vector =  function(ndx)
{
  var se = this;
  var cdv = se.curr_draw_vector;
  cdv.end = new Stock_point(ndx, se.sView.get(ndx));
  cdv.fixup_date();
  if (cdv.num_data_points() > 1)
  {
    se.vectors.push(cdv);
    se.clear_drawing_modes();     
    se.curr_draw_vector = null;
    se.vectors_save_to_local_storage();
    se.draw_vectors_summary();
    return true;
  }    
  else 
    return false;
}


//Stock_graph_canvas.prototype.draw_stock_vector =  function(aVector)
//{
//  var se = this;
//  var c = se.c;
//  // Draw bounds based on drawing mode.
//  if (is_stock_vector_complete(aVector) == false)
//    return false;
//}

Stock_graph_canvas.prototype.draw_curr_vector =  function(ndx)
{
  var se = this;
  var cdv = se.curr_draw_vector;
  if (se.curr_drawing_mode != Drawing_mode_vector)
    return false;

  if (isSet(cdv))
  {
    cdv.end = new Stock_point(ndx, se.sView.get(ndx));  
    if (is_stock_vector_complete(cdv))
      return se.draw_vector(cdv);
    else
      return false;
  }
}

Stock_graph_canvas.prototype.vector_hover = function(ndx)
{
  var se = this;
  var cdv = se.vectors.rows[ndx];
  if (se.last_hover_vector != cdv)
  {
    var midPoint = cdv.mid_point_ndx();
    se.redraw_all(se.sView);
    se.draw_vector(cdv, "bold1");
    //alert("cdv datetime=" + cdv.beg.bar.dateTime);
    se.last_hover_vector = cdv;
  }
}

Stock_graph_canvas.prototype.vector_remove = function(ndx)
{
  var se = this;
  var cdv = se.vectors.rows[ndx];
  
  if (isSet(cdv))
  {
    se.vectors.remove(ndx);
    se.redraw_all(se.sView);    
    //alert("cdv datetime=" + cdv.beg.bar.dateTime);
    se.last_hover_vector = null;
    se.draw_vectors_summary();
    se.vectors_save_to_local_storage();
  }
}


Stock_graph_canvas.prototype.vector_show_similar = function(ndx)
{
  var se = this;
  var sim_arr = se.vectors.rank_similarity(ndx);
  if (sim_arr.length < 2)
    return;
  var sb = new String_builder();    
  var rows = se.vectors.rows;
  var numRow = sim_arr.length;
  var first_score = sim_arr[0][1].score;
  var min_score = first_score * 0.82; 
  //alert("first_score=" + first_score + " min_score=" + min_score);
  // note: First rec is  always the compare rec 
  sb.push("<table border=1 align='left'><tr><th>#</th><th>score</th><th>days</th><th>#bar</th><th>%chg</th><th>slope</th><th>ndx</th></tr>");
  if (numRow > 10) numRow = 10;
  for (var ndx=0; ndx < numRow; ndx++)
  {
     var trec = sim_arr[ndx];
     var sdt = trec[1];
     if (sdt.score < min_score)
       break;
    //'ndx'      : ndx,
    //          'cal_days' : calc_sim_dist(d1.cal_days, d2.cal_days,0.2),
    //          'num_bar'  : calc_sim_dist(d1.num_bar, d2.num_bar, 3),
    //          'perc_change' : calc_sim_dist(d1.perc_change, d2.perc_change, 3),
    //          'slope' : calc_sim_dist(d1.slope, d2.slope,0.5)
    //          }                  
     var cdv_ndx = sdt.ndx;
     var tVect = rows[cdv_ndx];
     var label_txt = "#" + (ndx + 1) + " ";
     se.draw_vector(tVect, "bold2", label_txt);          
     
     //sb.push("<div>");
     //sb.push("ndx=" + sdt.ndx);
     //sb.push(" days=" + sdt.cal_days.toFixed(2));
     //sb.push(" #bar=" + sdt.num_bar.toFixed(2));
     //sb.push(" %chg=" + sdt.perc_change.toFixed(2));
     //sb.push(" slope=" + sdt.slope.toFixed(2));
     //sb.push(" score=" + sdt.score.toFixed(2));
     //sb.push("</div>").nl();
     sb.push("<tr>");
     sb.td(ndx + 1);
     sb.td(sdt.score.toFixed(2));
     sb.td(sdt.cal_days.toFixed(2));
     sb.td(sdt.num_bar.toFixed(2));
     sb.td(sdt.perc_change.toFixed(2));
     sb.td(sdt.slope.toFixed(2));
     sb.td(sdt.ndx);
     sb.push("</tr>").nl();
     
  }  
  sb.push("</table>");
  var disp_str = sb.to_str();
  set_div_contents("det_msg", disp_str);
  det_msg
}

  


Stock_graph_canvas.prototype.draw_vector =  function(pVect, pStyle, label_txt)
{
  MIN_VECT_WIDTH_ON_VIEW_FOR_LABEL = 10;
  var se = this;
  var c = se.c;
  if (is_stock_vector_complete(pVect) == false)
    return false;
    
  // Skip rendering vectors that do not fit on the current screen
  if ((pVect.beg.ndx < se.sView.begNdx) || (pVect.end.ndx > se.sView.endNdx))
    if  (pStyle != "bold1")
      return false;
    
  var p1 = se.get_point_from_ndx(pVect.beg.ndx);
  var p2 = se.get_point_from_ndx(pVect.end.ndx);
  var pwidth = Math.abs(p2.x - p1.x);
  var delta = pVect.delta().toFixed(2);
  var pchange = pVect.percent_change().toFixed(2);
  
  var line_width = 1;
  var line_color = "BLUE";  
  var font_size = '9pt Arial'
  if (label_txt === undefined)
    label_txt = "";
 
  
  if (pStyle == "bold1")
  {
    line_width = 3;
    line_color = "RED";  
  }
  if (pStyle == "bold2")
  {
    line_width = 3;
    line_color = "#6A6A10";
    //font_size = '10pt Arial'
  }

  //var offset = (cdv.num_data_points() * 0.02) + 20;
  var offset = 40;
  var offset2 = offset / 1.4;
  c.beginPath();
  c.strokeStyle = "BLUE";
  c.lineWidth = 1;
  c.textAlign = "left"
  c.textBaseline = "middle";
  c.font = font_size;
  c.fillStyle = 'black';
  
  // draw vertial trace lines  
  c.beginPath();
  c.lineWidth = 1;
  c.strokeStyle = line_color;
  c.moveTo(p1.x, p1.y - offset2);
  c.lineTo(p1.x, p1.y - offset);
  c.moveTo(p2.x, p2.y - offset2);
  c.lineTo(p2.x, p2.y - offset);
  var avgx = avg(p1.x,p2.x);
  var avgy = avg(p1.y, p2.y);
  c.moveTo(avgx, avgy-offset);
  c.lineTo(avgx, avgy - (offset + 15));
  c.stroke();
  c.closePath();
  
  // draw the main line
  c.beginPath();
  c.lineWidth = line_width;
  c.strokeStyle = line_color;
  c.moveTo(p1.x, p1.y-offset);
  c.lineTo(p2.x, p2.y-offset);
  c.stroke();
  c.closePath();
    
  c.beginPath();
  //c.lineTo(p2.x, p2.y);
  //c.lineWidth = 1;
  c.lineWidth = line_width;
  var move_dir = "UP"
  c.strokeStyle = "BLUE";
  c.line_width = 6;
  //if (cdv.beg.bar.close > cdv.end.bar.close)
  //  move_dir = "DOWN"
  //var txt = "$" + cdv.beg.bar.close.toFixed(2) + " to  $" + cdv.end.bar.close.toFixed(2)
  //  + " " + move_dir +  " $" + Math.abs(delta) + " " + Math.abs(pchange) + "%";
  if (pwidth > MIN_VECT_WIDTH_ON_VIEW_FOR_LABEL)
  {
    var calc_y = avgy - (offset + 20);
    var calc_x = avgx - 3;
    var txt = "" + Math.abs(pchange) + "%";
    drawAngledText(c, txt, calc_x , calc_y,  -80);
    c.stroke();
  }
  
  if (label_txt !== undefined)
  {
    //var calc_y = avgy + (offset + 45);
    var calc_y = se.canvas.height - (se.yPadding + 10);
    var calc_x = avgx - 6;
    var txt = "" + label_txt;
    drawAngledText(c, txt, calc_x , calc_y ,  0);
    c.stroke();
  }
  c.closePath();
}


Stock_graph_canvas.prototype.draw_vectors =  function(pndx, pmPos)
{
  var se = this;
  var vectors = se.vectors.rows;
  for (var ndx in vectors)
  {
    var cdv = vectors[ndx];
    se.draw_vector(cdv);
  }
}


Stock_graph_canvas.prototype.draw_bound_rect =  function(ndx, mPos)
{
  var se = this;
  var c = se.c;
  // Draw bounds based on drawing mode.
  if (se.curr_drawing_mode != Drawing_mode_rubberband)
    return false;
  if (se.curr_draw_vector === undefined)
    return false;

  var cdv = se.curr_draw_vector;
  cdv.end = new Stock_point(ndx, se.sView.get(ndx)); 
  var p1 = se.get_point_from_ndx(cdv.beg.ndx);
  var p2 = se.get_point_from_ndx(cdv.end.ndx);
  c.beginPath();
  var stat = se.sView.find_min_max(cdv.beg.ndx, cdv.end.ndx);
  var top = se.calc_y_pixel_for_value(stat.min.val);
  var bot = se.calc_y_pixel_for_value(stat.max.val);
  var pheight = bot - top;
  c.fillStyle = "#FAFAFA";
  c.strokeStyle = "purple";
  var pwidth = p2.x - p1.x;
  c.strokeRect(p1.x,top, pwidth, pheight);
  c.stroke();
  c.closePath();
  return true;
}




Stock_graph_canvas.prototype.on_key_down = function (evt)
{
  var se = this;
  if (se.mouse_is_over == false)
  { // only handle keyboard events if the mouse is over our graph canvas.
    // otherwise bubble them up for the rest of the screen.
    evt.returnValue=true;
    return true;
  }
  //alert("Key Pressed=" + evt.keyCode);
  switch (evt.keyCode)
  {
    case 38:  /* Up arrow was pressed */
      se.sView.zoomIn();
      se.clear_drawing_modes();
      se.on_view_changed();
      break;
    case 40:  /* Down arrow was pressed */
      se.sView.zoomOut();
      se.clear_drawing_modes();
      se.on_view_changed();
      break;
    case 37:  /* Left arrow was pressed */
      se.sView.scrollLeft();
      se.clear_drawing_modes();
      se.on_view_changed();
      break;
    case 39:  /* Right arrow was pressed */
      se.sView.scrollRight();
      se.clear_drawing_modes();
      se.on_view_changed();
      break;
    case 27: // escape key pressed
      se.clear_drawing_modes();
      se.redraw_all();
  }
  evt.returnValue=false;
  return false;
}

Stock_graph_canvas.prototype.draw_chart_tick = function (tcnt, x,y,tVal)
{
  var se = this;
  var c = se.c;
  // Draw tick to show NDX
  if (tcnt > 20)
  {
    tcnt = 0;
    c.stroke();
    c.closePath();
    c.beginPath();
    c.strokeStyle = '#FA0';
    c.lineWidth = 0.5;
    c.moveTo(x, y - 40);
    c.lineTo(x, y + 20);
    c.stroke();
    c.closePath();
    c.beginPath();
    c.moveTo(x, y);
    c.strokeStyle = '#600';
    c.lineWidth = 1;
    c.stroke();
    drawAngledText(c, "" + tVal,x,y - 40,270);
  }
  return tcnt += 1;
}

Stock_graph_canvas.prototype.render_mouse_bar_text = function (sView, ndx)
{
  var se = this;
  var c = se.c;
  if (ndx === undefined)
    ndx = se.lastMouseNdx;
  if (ndx === undefined)
    ndx = sView.length -1;
  if (ndx < 0)
    ndx = 0;
  if (ndx >= ndx.length)
    ndx = ndx.length - 1;
  var trow = sView.data.rows[ndx];
  var tmsg = " ndx: " + ndx
    + " date: " + trow.dateTime
    + " open: " + trow.open
    + " close: " + trow.close
    + " high: " + trow.high
    + " low: "  + trow.low
    + " volume: " + trow.volume
  //+ " chartx=" + chartX + " charty=" + chartY
  //+ " se.drawWidth=" + se.drawWidth
  //+ "   se.chartWidth=" +chartWidth;

  if (se.mouse_posit_stock_div !== undefined)
    se.mouse_posit_stock_div.innerHTML = tmsg;

  //var cwidth = Int(c.measureText(tmsg).width * 1.2) + 1;
  //c.beginPath();
  //c.textAlign = 'left';
  //c.textBaseline = 'middle';
  //c.fillStyle = 'green';
  //c.clearRect(0,0,cwidth ,20);
  //c.stroke();
  //c.closePath();
  //c.beginPath();
  //c.fillText(tmsg, 0,10);
  //c.stroke();
  //c.closePath();
}

Stock_graph_canvas.prototype.draw_chart_line = function (sView)
{
  var se = this;
  var c = se.c;
  var rows = sView.data.rows;
  var skipFactor = se.calc_items_per_pixel();
  var pixelsPerSample = sView.pixelsPerPoint(se.chart_width);
  var hskip = Math.floor(skipFactor / 2.0);
  var tavg = sView.average();
  // --- DRAW MAIN GRAPH LINE --
  c.strokeStyle = '#400';
  c.lineWidth = 1;
  c.font = 'italic 8pt sans-serif';
  c.textAlign = "left";
  var firstY = se.calc_y_pixel_for_value( se.minY.val);
  var caseY = firstY;
  var slabel = sView.label;
  var currLeft = se.chart_left;
  c.beginPath();
  c.moveTo(currLeft, caseY);
  var tcnt = 0;
  var i = sView.begNdx;
  while(true)
  {
     //tcnt += 1;
    var ndx = Math.floor(i);
    var trow = rows[ndx];
    var tVal = trow[slabel];
    //tVal = stockAverage(data, i - hskip, i + hskip, sView.label);
    caseY = se.calc_y_pixel_for_value(tVal);
    if (i == sView.begNdx)
      c.moveTo(currLeft, caseY);
    c.lineTo(currLeft, caseY);
    //tcnt = drawChartTick(tcnt, currLeft, caseY, tVal)
    currLeft += pixelsPerSample;
    //c.stroke();
    if (ndx == sView.endNdx)
      break;
    else
    {
      i += skipFactor
      if (i > sView.endNdx)
        i = sView.endNdx;
    }
  }
  c.moveTo(se.chart_left, firstY);
  c.stroke();
  c.closePath();
}

Stock_graph_canvas.prototype.draw_axis = function (sView)
{
  var se = this;
  var c = se.c;
  // Draw the axises
  c.beginPath();
  c.strokeStyle = '#C00';
  c.lineWidth = 2;
  //c.stroke();
  c.moveTo( se.xPadding, 0);
  c.lineTo( se.xPadding, se.canvas.height - se.yPadding);
  c.lineTo(se.canvas.width, se.canvas.height - se.yPadding);
  c.stroke();
  c.closePath();
}

Stock_graph_canvas.prototype.draw_y_labels = function (sView)
{
  var se = this;
  var c = se.c;
  c.beginPath();
  // Draw the Y value texts
  c.textAlign = "right"
  c.textBaseline = "middle";
  c.font = '8pt Arial';
  c.fillStyle = 'black';
  var pixPerLabel = 25;
  var numLabel = (se.chartHeight / pixPerLabel);
  var yRange = se.maxY.val -  se.minY.val;
  var valPerTick = se.rangeY / numLabel;
  var caseY =  se.chart_bottom;
  var yVal =  se.minY.val;
  var lineLeft = se.chart_left;
  var textLeft = se.chart_left -2;
  for(var i = 0;  i <= numLabel; i++)
  {
    var label = yVal.toFixed(2);
    c.fillText(label, textLeft, caseY);
    c.stroke();
    if (i > 0)
    {
      // Draw vertical grid lines
      c.strokeStyle = '#EBEBEB';
      c.lineWidth = 0.2;
      c.moveTo(lineLeft+2, caseY);
      c.lineTo(se.drawWidth, caseY);
      c.stroke();
    }
    caseY -= pixPerLabel;
    yVal += valPerTick;
  }
  c.closePath();
}

Stock_graph_canvas.prototype.draw_y_labels_right = function (sView)
{
  var se = this;
  var c = se.c;
  c.save();
  var rangeY = se.maxY.val -  se.minY.val;

  // Draw average label
  //var tAvg = stockAverage(sView.data,sView.begNdx, sView.endNdx, default_stock_case_label);

  var caseY = se.calc_y_pixel_for_value(se.avg);
  var avgLabel = "Average " + se.avg.toFixed(2);
  c.beginPath();
  c.moveTo(se.chart_left, caseY);
  c.lineWidth = 2;
  c.strokeStyle = '#11EA11';
  c.lineTo(se.drawWidth, caseY);
  c.stroke();


  c.textAlign = 'right';
  c.fillText(avgLabel, se.drawWidth - 40, caseY -5);
  c.stroke();
  c.closePath();


  // Draw the Y value texts
  c.textAlign = "right"
  c.textBaseline = "middle";
  c.font = '8pt Arial';
  c.fillStyle = 'black';
  var numLabel = 10;
  var pixPerLabel =  se.chartHeight / numLabel;
  var textLeft = se.drawWidth -1;
  var lp = 0;
  var hi_val = se.avg;
  var lo_val = se.avg;
  var mov_y  = se.rangeY / numLabel;
  c.beginPath();
  for(var i = 0;  i <= numLabel; i++)
  {
    //var se.maxY = stockFindMax(data, sView.begNdx, sView.endNdx, sView.label);
    //var  se.minY = stockFindMin(data, sView.begNdx, sView.endNdx, sView.label);
    //var se.avg  = se.avg
    hi_val += mov_y;
    lo_val -= mov_y;
    var adelta = hi_val - se.avg;
    var tperc = ((adelta / se.avg) * 100).toFixed(1);
    var label = "+" + tperc + "%";
    var caseY = se.calc_y_pixel_for_value(hi_val);
    if (caseY > se.chart_top)
    {
      c.fillText(label, textLeft, caseY);
      c.stroke();
    }
    adelta = se.avg - lo_val;
    var tperc = ((adelta / se.avg) * 100).toFixed(1);
    var label = "-" + tperc + "%";
    var caseY = se.calc_y_pixel_for_value(lo_val);
    if (caseY <  se.chart_bottom)
    {
      c.fillText(label, textLeft, caseY);
      c.stroke();
    }
    lp += 10;
  }
  c.closePath();
  c.restore();
} // end function

Stock_graph_canvas.prototype.draw_x_labels = function (sView)
{
  var se = this;
  var c = se.c;
  var rows = sView.data.rows;
  c.beginPath();
  //c.font = '8pt sans-serif';
  c.font = '8pt Veranda';
  c.textAlign = "left";
  c.strokeStyle = '#EAEAEA';
  c.fillStyle = 'black';
  var pixPerLabel = 60;
  var numLabel = Int(se.chart_width / pixPerLabel);
  var skipFactor = sView.view_length / (numLabel);

  // can not count the zero label because it consumes
  // no points.
  pixPerLabel =   se.chart_width / (numLabel);
  var currLeft = se.chart_left;
  var caseY =  se.chart_bottom + 5;
  var skipNdx = sView.begNdx;
  var textLeft = currLeft;
  for (var i = 0; i<= numLabel; i++)
  {
    var readNdx = Int(skipNdx)
    textLeft = Int(currLeft);
    if ( i == numLabel)
      textLeft -= 1;

    if (readNdx > sView.endNdx)
      readNdx = sView.endNdx;

    var trow = rows[readNdx];
    var label = stock_date_to_disp_date(trow.dateTime).replace(" ","\n");
    drawAngledText(c, label,textLeft,caseY,90);
    if (i > 0)
    {
      // Draw vertical grid lines
      var lineLeft = currLeft;
      c.strokeStyle = '#DADADB';
      c.lineWidth = 0.4;
      c.moveTo(lineLeft, se.chart_top);
      c.lineTo(lineLeft,  se.chart_bottom+8);
      c.stroke();
    }
    skipNdx += skipFactor;
    currLeft+= pixPerLabel;

  }
  // Draw the last label
  //  currLeft = se.drawWidth - 10;
  //  trow = rows[rows.length-1];
  //  label = trow.dateTime.substr(2,14);
  //  drawAngledText(c, label,currLeft,caseY,90);
  //  c.stroke();
  c.closePath();
}


// needed because se.canvas.width does not change
// correctly after the se.canvas is resized.
Stock_graph_canvas.prototype.getDrawWidth = function ()
{
  return this.canvas.clientWidth;
}

// needed because se.canvas.width does not change
// correctly after the se.canvas is resized.
Stock_graph_canvas.prototype.getDrawHeight = function  ()
{
  return this.canvas.clientHeight;
}

Stock_graph_canvas.prototype.render_view_summary =  function()
{
  var se = this;
  if (se.view_summary_div !== undefined)
  {
    var sb = new String_builder();
    var tsum = this.sView.view_summary;
    var stats = tsum.stats;
    sb.push("<h3>View " + tsum.num_days + " trade days</h3>");
    sb.push(tsum.calendar_days + " calendar days, ");
    sb.push(" avg = " + stats.avg.toFixed(2)).br();
    sb.push(" min = " + stats.min.val.toFixed(2));
    sb.push(" max = " + stats.max.val.toFixed(2)).br();
    sb.push(" range = "+ tsum.trade_range.toFixed(2) + " = " + tsum.percent_delta.toFixed(1) + "%");
    sb.to_div(se.view_summary_div);
  }
}

Stock_graph_canvas.prototype.render_symbol_performance =  function(div_name)
{
    var tout = this.sView.calc_hist_stats();
    var sb = new String_builder();
    sb.push("<table id='symbol_perf_table'><tr><td></td><td>Min</td><td>Max</td><td>Avg</td></tr>")
    for (var ndx in tout)
    {
       sb.push("<tr>");
       var stats = tout[ndx];
       sb.make_element("TD",undefined, stats.label);
       sb.make_element("TD",undefined, stats.min.val.toFixed(2));
       sb.make_element("TD",undefined, stats.max.val.toFixed(2));
       sb.make_element("TD",undefined, stats.avg.toFixed(2));
       sb.push("</tr>");
    }
    sb.push("</table>")

    //tout = this.sView.calc_hist_stats();
    //sb = new String_builder();
    //sb.push("");
    //for (var ndx in tout)
    //{
    //  sb.push("<tr>");
    //  var stats = tout[ndx];
    //  sb.push(stats.label + " = ");
    //  sb.push(stats.min.val.toFixed(2) + " - ");
    //  sb.push(stats.max.val.toFixed(2));
    //  sb.push(" avg= " + stats.avg.toFixed(2));
    //  sb.br();
    //}
    sb.to_div(div_name);
}

//JOE TODO INSERT CODE TO RENDER LAST 30, Last 60, Last 90 HERE


Stock_graph_canvas.prototype.set_view_days =  function(numDays, view_summary_div_name)
{
  var stats = this.sView.set_view_to_days_ago(numDays);
  this.redraw_all();
}
