/* Simple Sample Graphicing using 
*  HTML5 canvas.    
*  simple graph drawing demonstration used 
*  to learn to interact with the canvas 
*/


  var graph;
  var xPadding = 30;
  var yPadding = 30;
  
  var test_data = { values:[
    { X: "Jan", Y: 12 },
    { X: "Feb", Y: 28 },
    { X: "Mar", Y: 18 },
    { X: "Apr", Y: 34 },
    { X: "May", Y: 40 },
  ]};
   

  function sgraph_draw(data)
  {
      //alert("draw():21");
    var graph = document.getElementById("graph");
    var c = graph.getContext('2d');            
    
    c.lineWidth = 2;
    c.strokeStyle = '#333';
    c.font = 'italic 8pt sans-serif';
    c.textAlign = "center";
    
    // Returns the max Y value in our data list
    function getMaxY(data)
    {
      var max = 0;                
      for(var i = 0; i < data.values.length; i ++)
      {
       if(data.values[i].Y > max)
       {
        max = data.values[i].Y;
       }
      }
      max += 10 - max % 10;
      return max;
    }               
    var maxY = getMaxY(data)
  
    // Return the x pixel for a graph point
    function getXPixel(val)
    {
      return ((graph.width - xPadding) / data.values.length) * val + (xPadding * 1.5);
    }
  
    // Return the y pixel for a graph point
    function getYPixel(val) 
    {
      return graph.height - (((graph.height - yPadding) / maxY) * val) - yPadding;
    }
    
    
    // Draw the axises
    c.beginPath();
    c.moveTo(xPadding, 0);
    c.lineTo(xPadding, graph.height - yPadding);
    c.lineTo(graph.width, graph.height - yPadding);
    c.stroke();
    
    // Draw the X value texts
    for(var i = 0; i < data.values.length; i ++) 
    {
      c.fillText(data.values[i].X, getXPixel(i), graph.height - yPadding + 20);
    }
    
    // Draw the Y value texts
    c.textAlign = "right"
    c.textBaseline = "middle";
    
    for(var i = 0; i < maxY; i += 10) 
    {
      c.fillText(i, xPadding - 10, getYPixel(i));
    }
    
    c.strokeStyle = '#f00';
    
    // Draw the line graph
    c.beginPath();
    c.moveTo(getXPixel(0), getYPixel(data.values[0].Y));
    for(var i = 1; i < data.values.length; i ++) 
    {
      c.lineTo(getXPixel(i), getYPixel(data.values[i].Y));
    }
    c.stroke();
    
    // Draw the dots
    c.fillStyle = '#333';                
    for(var i = 0; i < data.values.length; i ++) 
    {  
      c.beginPath();
      c.arc(graph, getXPixel(i), getYPixel(data.values[i].Y), 4, 0, Math.PI * 2, true);
      c.fill();
    }
  };
  
  function simple_graph_test()
  {     
     sgraph_draw(test_data);
  }