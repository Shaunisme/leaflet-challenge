// Store our API endpoint as queryUrl.
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

const limits = [10, 30, 70, 150, 300];
const colors = ["darkred", "firebrick", "chocolate", "orangered", "lightsalmon", "mistyrose"];

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
  console.log("features: ", data.features);
  // Using the features array sent back in the API data, create a GeoJSON layer, and add it to the map.

  // 1.
  // Pass the features to a createFeatures() function:
  createFeatures(data.features);

});

// 2. 
// marker size according magnitude
function markerSize(mag) {
  return ((mag+1)*0.8)**2;
}

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

var min=0;
var max=0;
function createFeatures(earthquakeData) {

  function addPopup(feature, layer) {
    layer.bindPopup(`<h2>Mag ${feature.properties.mag}<br>Depth ${feature.geometry.coordinates[2]} km</h2><h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    
    if ( min > feature.geometry.coordinates[2] ) {
      min = feature.geometry.coordinates[2];
    }
    if ( max < feature.geometry.coordinates[2] ) {
      max = feature.geometry.coordinates[2];
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

  // Pass the earthquake data to a createMap() function.
  createMap(earthquakesLayer);

}


// 3.
// createMap() takes the earthquake data and incorporates it into the visualization:

function createMap(earthquakesLayer) {
  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street
  };

  // Creat an overlays object.
  //let earthquakLayer=L.layerGroup(earthquakes);

  let overlayMaps ={
    "Earthquakes" : earthquakesLayer
  }

  // Create a new map.
  // Edit the code to add the earthquake data to the layers.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 3,
    layers: [street,earthquakesLayer]
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

    var lastlimit;
    limits.forEach(function (limit, index) {
      if ( index == 0 ) 
        labels.push(`<i style="background: ${colors[index]}"></i><span> ${min} - ${limit} km</span><br>`);
      else 
        labels.push(`<i style="background: ${colors[index]}"></i><span> ${lastlimit} - ${limit} km</span><br>`);
      
      if ( index+1 == limits.length) {
        labels.push(`<i style="background: ${colors[index+1]}"></i><span> ${limit} - ${max} km</span><br>`);
      }
      lastlimit=limit;
    }); 

    div.innerHTML += `<div class="info legend"> ${labels.join('')} </div>`;
    console.log("div: ",div);
    return div;
  };
  legend.addTo(myMap);
}