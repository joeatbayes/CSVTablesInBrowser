/*
 <div>
 <A href="#" onClick="run_test_non_bock();">draw test non block</A>
 </div>


 <div style="width:98%;">
 <canvas id="graphBig" width="600" height="400">
 </canvas>
 </div>


 <div id="ajax_message">
 </div>

 <div id="mouse_pos">.</div>

<hr/>
GraphX2

<canvas id="GraphX2" width="600" height="400">
</canvas>

 <hr/>
 img1 <br/>
 <img id="img1" width=900 height=400></img>

*/


        function SampleHowToHandleDoubleBuffer()
{
    // Save the content of the current canvas to a second
    // canvas so we could use the 2nd canvas as a source
    // for the double buffering so do not have to render
    // full logic again.
    var imgX2 = canvas.toDataURL();
    var draw2Canvas = document.getElementById("GraphX2");
    draw2Canvas.width =   canvas.width;
    draw2Canvas.height =   canvas.height;
    var ctx2 =  draw2Canvas.getContext('2d');

    // renders the image from one canvas to a second
    // canvas works.   Which means we could render
    // a mostly complete base canvas and then render
    // back to the master without needing to re-render
    // the orginal.  This allows the main rendering
    // loop to only need to render what has changed
    // such as mouse pointers.  More sophisticated
    // is use two canvases on top of each other
    // fill the back one with the background and
    // the front one with foreground which saves
    // even more processing time.
    ctx2.drawImage(canvas,0,0);

    // Rendering from the img back to
    // to the original canvas This failed with
    // type error.
    //ctx2.drawImage(imgX2,0,0);

    // This does not fail with the typeerror
    // but it does not render correctly into
    // the graph context.
    imgC2 = new Image();
    imgC2.src = imgX2;
    ctx2.drawImage(imgC2, 0,0);
    ctx2.stroke();

    // Save the image we copied out of the
    // canvas and display as another image already
    // defined in the markup.  Works but be careful
    // with the scaling.
    var imgxx  = document.getElementById("img1");
    imgxx.src = imgX2;
    ctx2.drawImage(imgxx, 0,0);
    ctx2.stroke();
}