// Store our API endpoint as queryUrl.
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

const limits = [10, 30, 70, 150, 300];
const colors = ["darkred", "firebrick", "chocolate", "orangered", "lightsalmon", "mistyrose"];

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
  // Using the features array sent back in the API data, create a GeoJSON layer, and add it to the map.

  // Pass the features to a createFeatures() function:
  createFeatures(data.features);

});

// marker size according magnitude
function markerSize(mag) {
  return ((mag+3)*0.6)**2;
}

// marker coloraccording depth
function markerColor(depth){
  if ( depth <= limits[0] ) {
    return colors[0];
  } else
  if ( depth < limits[1]) {
    return colors[1];
  } else
  if ( depth < limits[2]) {
    return colors[2];
  } else
  if ( depth < limits[3]) {
    return colors[3];
  } else
  if ( depth < limits[4]) {
    return colors[4];
  } else {
    return colors[5];
  }
}

// build earthquakes layer
var min=0;
var max=0;
function createFeatures(earthquakeData) {

  function addPopup(feature, layer) {
    layer.bindPopup(`<h2>Magnitude: ${feature.properties.mag}<br>Depth: ${feature.geometry.coordinates[2]} km<br><h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    
    if ( min > feature.geometry.coordinates[2] ) {
      min = Math.round(feature.geometry.coordinates[2]);
    }
    if ( max < feature.geometry.coordinates[2] ) {
      max =  Math.round(feature.geometry.coordinates[2]);
    }
  }

  let earthquakesLayer = L.geoJSON(earthquakeData, {
    onEachFeature: addPopup,
    pointToLayer(feature,latlng) {
      return L.circleMarker(latlng, {
        radius: markerSize(feature.properties.mag),
        color: markerColor(feature.geometry.coordinates[2]),
        //fillcolor:markerColor(feature.geometry.coordinates[2]),
        weight: 1,
        opacity: 1,
        fillopacity: 0.8
      });
    }
  });

  // Pass the earthquake layer to a createMap() function.
  createMap(earthquakesLayer);
}



// createMap() takes the earthquake data and incorporates it into the visualization:
function createMap(earthquakesLayer) {
  // Add Layer for plates boundary
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(response) {
      var boundaryLayer = L.geoJSON(response);
 
    // Create the base layers.
    var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
    
    // Create a baseMaps object.
    var baseMaps = {
      "World Map": street,
      "Topographic Map": topo
    };

      // Creat an overlays object.
    //let earthquakLayer=L.layerGroup(earthquakes);

    var overlayMaps ={
      "Earthquakes" : earthquakesLayer,
      "Tectonic Plates" : boundaryLayer
    }

    // Create a new map.
    // Edit the code to add the earthquake data to the layers.
    var myMap = L.map("map", {
      center: [
        1.352083, 103.819836
      ],
      zoom: 3,
      layers: [street, earthquakesLayer, boundaryLayer]
    });

    // Create a layer control that contains our baseMaps.
    // Be sure to add an overlay Layer that contains the earthquake GeoJSON.
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

  
    // Adding the legend to the map
    // Add legend (don't forget to add the CSS from index.html)
    var legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (myMap) {
      var div = L.DomUtil.create('div', 'info legend');
      var labels = [];

      div.innerHTML = `<div class="labels"><h4>Earthquake Depth</h4></div>`;

      var lastlimit;
      limits.forEach(function (limit, index) {
        if ( index == 0 ) 
          labels.push(`<i style="background: ${colors[index]}"></i> ${min} - ${limit} km<br clear="all">`);
        else 
          labels.push(`<i style="background: ${colors[index]}"></i> ${lastlimit} - ${limit} km<br clear="all">`);
        
        if ( index+1 == limits.length) {
          labels.push(`<i style="background: ${colors[index+1]}"></i> ${limit} - ${max} km<br clear="all">`);
        }
        lastlimit=limit;
      }); 

      div.innerHTML += `<div class="info legend"> ${labels.join('')} </div>`;

      return div;
    };
    legend.addTo(myMap);
  })
}
