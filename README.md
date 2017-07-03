# Hubway Challenge
In the first half of 2017, Hubway, a bike sharing service in Boston, hosted a competition to explore all of the historical data that it has collected about its bike network and userbase. We tried to identify parts of the city that existing modes of public transportation potentially underserve, with the hopes that asking why these areas are underserved might help local officials discover problems that may be amenable to policy or infrastructure solutions. You can find our data challenge entry at [https://hubway.countlove.org]([https://hubway.countlove.org).

The code in this repository contains the tools that we built to conduct our exploration of the Hubway dataset. While a lot of the code is project-specific, examples of potentially interesting components include: 1) the binary format that we created to compress all five years of Hubway data into 10 megabytes; 2) the Javascript k-means clustering function that we wrote to dynamically group similar query results; and 3) the story and query framework that we built to modularly stitch together data queries, map visualizations, and our text analysis to present our findings.

## External Libraries
Our exploration tools also require the following external libraries:

* Bootstrap 3.3.7
* jQuery 2.1.1
* jQuery-easing 1.4.0
* leaflet 1.3.0
* leaflet-curve 0.1
* d3 4.6.0
* d3-contour 1.0.0
* jdataview 2.5.0
* jbinary 2.1.3
