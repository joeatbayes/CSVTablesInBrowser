# CSV Tables in Browser using AJAX#

* Renders CSV Tables automatically without custom coding.
* Tables can be inserted into existing DIV on custom pages.
* Title & Sort Order easily changed
* Optional Custom callback to format specific columns. 
####I Sell consulting services [contact](http://BayesAnalytic.com/contact) ####

## Sample Output##
![sample Output](CSVTablesSample.jpg)
##Metadata##
* License is [MIT](https://opensource.org/licenses/MIT)
* Owner: Joseph Ellsworth
##Important Notes##
* This software uses AJAX in the browser.  Most browsers will not support AJAX when using the file: protocol so the samples in [index.html](index.html) will only work when served via HTTP. 
## Getting Started##
* Download repository to local hard disk
* Place Contents inside web server.
> * the file [httpServer.go](httpServer.go) will provide a simple web server or you can copy the contents of repository into a directory already being served by a web server. 
* Open the URI: http://127.0.0.1:9090/ It will display several data sets to be rendered. Click on any of those links and you should see the content rendered as CSV.

  > > ```
  > > To start the built in GO server. First install GO then run the following command.
  > >
  > > go run httpServer9090.go
  > > ```

## Basic Use ##
The CSV formatting is designed to embed formated output in other web pages.  To make it easier to see in operating I have supplied [view_csv.html] which reads the parameters from URI,  fetch the specified data and render it into a table. 

Assuming you are running the built-in server.

> * http://127.0.0.1:9090/view_csv.html?uri=data/NYSE_20110824.csv&sort=false&title=NYSE%20Aug-25-1022%20No%20Sort
> * http://127.0.0.1:9090/view_csv.html?uri=data/NYSE_20110824.csv&sort=true&title=NYSE%20Aug-25-1022%20Sorted
> * http://127.0.0.1:9090/view_csv.html?uri=data/NYSE_20110824.csv&sort=reverse&title=NYSE%20Aug-25-1022%20sort%20Reverse
>
> Look in [view_csv.html](view_csv.html) for examples of how to embed the CSV in a web page.



## Some of my Other Projects

> - **[Quantized Classifier](https://bitbucket.org/joexdobs/ml-classifier-gesture-recognition)** A Machine Learning classifier using novel techniques that delivers precision at 100% recall comparable to with Deep Learning CNN for many classification tasks while running many times faster.  If is written in GO  and available on a MIT license. 
> - [**Solve Water Scarcity Using DEM**](http://AirSolarWater.com/dem)  A Novel way of using micro reservoirs to reduce the impact of water scarcity. Ideal for adoption on poor countries especially in the very poor rural agricultural regions.   It is based on the premis of building very small micro capture dams using stones and dam.   The DEM (Digital Elevation Model) work models water flow so we can show people where to build these small reservoirs so each reservoir will refill with 1,000's of gallons of water everytime there is more than 0.3 inches of runoff.  Water soaks in to nurture food producing trees while also refilling local aquifer.
> - **[Bayesanlytic.com Articles About Machine Learning](http://bayesanalytic.com/main/technical-engineering/machine-learning/)**  - Many articles including conceptual approach to building KNN engines.     A description of our  predictive Analytic engine using AI techniques with high volume, high speed and big data capability.  Designed to predict stock price moves using technical data.  
>
>
> - [The **Air Solar Water product line A2WH**](http://airsolarwater.com/)  is a fully renewable extraction of water from air.  Provides systems which extract liquid potable water from air using solar energy.   This technology  can deliver water cost effectively in the most hostile locations and can scale from 1 gallon per day up through millions of gallons per day. A2WH patented technology provides world leading ability to extract water from air using only renewable energy. 
> - [**FastQueueFS**](https://github.com/joeatbayes/fastQueueFS) Fast Queue with many reader capacity using HTTP Protocol and REST API. Similar to Kafka but faster and with more flexible topics and queue configuration. Written in FSharp automatically handles multiple topics. Very high performance, Low Latency with N-Tier data propagation
> - [**CNCUtil**](https://bitbucket.org/joexdobs/cncutil)  Ruby Code to Generate optimized GCODE using high level scripting commands.
>
>
> - [**Correct Energy Solutions**](http://correctenergysolutions.com/) -  provides  unique energy solutions designed solve real world energy and conservation problems.  This includes [micro-wind turbines](http://correctenergysolutions.com/wind) suitable for near ground installation,  renewable cooling and air to water technologies.  
> - [**CSVTablesInBrowser**](https://github.com/joeatbayes/CSVTablesInBrowser)  Render CSV files on the server in nice tables fetched using AJAX. Very easy to use with repeated headers, value override via callbacks.
>
>
> -  My personal site [**JoeEllsworth.com**](http://joeellsworth.com/) which contains my [resume](http://joeellsworth.com/resume/2013-v04-joe-bio-dir-cto-architect.pdf)




