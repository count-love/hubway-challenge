#!/usr/bin/env bash

mkdir -p build/js
mkdir -p build/css
mkdir -p build/data
mkdir -p build/img

node=/Applications/CodeKit.app/Contents/Resources/engines/node/node
cleancss=/Applications/CodeKit.app/Contents/Resources/engines/node_modules/clean-css/bin/cleancss
uglifyjs=/Applications/CodeKit.app/Contents/Resources/engines/node_modules/uglify-js/bin/uglifyjs

$node $uglifyjs external/jquery/2.1.1/jquery.js external/jquery.easing/1.4.0/jquery.easing.js \
    external/bootstrap/3.3.7/bootstrap.js external/leaflet/1.0.3/leaflet.js external/d3/4.6.0/d3-array.v1.js \
	external/d3/4.6.0/d3-collection.v1.js external/d3/4.6.0/d3-color.v1.js external/d3/4.6.0/d3-format.v1.js \
	external/d3/4.6.0/d3-interpolate.v1.js external/d3/4.6.0/d3-scale.v1.js external/d3/4.6.0/d3-geo.v1.js \
    external/d3-contour/d3-contour.js external/leaflet-curve/leaflet.curve.js external/jdataview/2.5.0/jdataview.js \
    external/jbinary/2.1.3/jbinary.js directions/transit-layer.js datasource.js explore.js \
    story/story.js story/story-data.js -m -c unsafe=true -o build/js/hubway.min.js

$node $cleancss --skip-rebase -o build/css/hubway.css external/bootstrap/3.3.7/bootstrap.css \
	external/leaflet/1.0.3/leaflet.css story/story.css

# data
cp -f data/directions-s.json build/data/directions-s.json
cp -f data/directions-l.json build/data/directions-l.json
cp -f data/trips.bin build/data/trips.bin
cp -f data/stations.json build/data/stations.json

# images
cp -f img/bike.svg build/img/bike.svg
cp -f img/favicon.ico build/img/favicon.ico
cp -f img/favicon-196x196.png build/img/favicon-196x196.png
cp -f img/opengraph.png build/img/opengraph.png

# html
cp -f htaccess build/.htaccess
cp -f index.html build/index.html

# rsync -avzc build/ countlove@countlove.org:hubway.countlove.org/
