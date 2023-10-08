// Define the map and its initial view
var map = L.map('map').setView([1.287953, 103.851784], 14);

// Add a base tile layer (e.g., OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Initialize a variable to hold the user's marker
var userMarker;

// Function to update the user's marker
function updateUserMarker(lat, lon) {
    // Remove the existing marker if it exists
    if (userMarker) {
        map.removeLayer(userMarker);
    }

    // Create a red marker at the user's location
    userMarker = L.marker([lat, lon], {
        icon: L.divIcon({ className: 'user-marker', html: '📍' }),
    }).addTo(map);
}

// Add a click event listener to the "Get My Location" button
document.getElementById('getLocationButton').addEventListener('click', function () {
    // Check if geolocation is available in the browser
    if ('geolocation' in navigator) {
        // Get the user's location
        navigator.geolocation.getCurrentPosition(function (position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;

            // Center the map on the user's location
            map.setView([lat, lon], 14);

            // Update the user's marker
            updateUserMarker(lat, lon);
        }, function (error) {
            console.error('Error getting location:', error);
        });
    } else {
        alert('Geolocation is not available in your browser.');
    }
});

// Fetch grid data from the CSV file using the CORS proxy
var csvURL = 'https://cors-anywhere.herokuapp.com/https://docs.google.com/spreadsheets/d/e/2PACX-1vSxosCPpLTporUy5svCDRcqxbRgW8RGw7Ua7FJCMlwe27A5SNSvAlRtehk6HnjTbkyzg1KLPziS7FaF/pub?gid=192796888&single=true&output=csv';

fetch(csvURL)
  .then(function (response) {
    return response.text();
  })
  .then(function (csvText) {
    // Parse the CSV data into an array of objects
    var gridData = parseCSV(csvText);

    // Loop through your grid data and create polygons
    gridData.forEach(function (grid) {
      // Create an array of coordinate pairs based on latitudes and longitudes
      var coordinates = [
        [parseFloat(grid.lat1), parseFloat(grid.lon1)],
        [parseFloat(grid.lat2), parseFloat(grid.lon2)],
        [parseFloat(grid.lat3), parseFloat(grid.lon3)],
        [parseFloat(grid.lat4), parseFloat(grid.lon4)],
      ];
      
      var polygon = L.polygon(coordinates, {
        fillColor: getColorForHabitatCode(grid.habitatCode), // Define a function to get the fill color
        color: 'black', // Outline color
        weight: 0.25, // Adjust this value for thinner or thicker lines
      }).addTo(map);
    
      // You can add popups or other interactions to the polygons here
      polygon.bindPopup('ID: ' + grid.id + '<br>Habitat Code: ' + grid.habitatCode);
    });
  })
  .catch(function (error) {
    console.error('Error fetching or parsing CSV data:', error);
  });

// Define a function to parse CSV data into an array of objects
function parseCSV(csvText) {
  var lines = csvText.split('\n');
  var headers = lines[0].split(',').map(header => header.trim()); // Remove leading/trailing whitespace
  var result = [];

  for (var i = 1; i < lines.length; i++) {
    var obj = {};
    var currentLine = lines[i].split(',');

    for (var j = 0; j < headers.length; j++) {
      // Check if the current cell is empty or undefined
      if (currentLine[j] !== undefined) {
        // Trim whitespace and line-ending characters
        var value = currentLine[j].trim();
        obj[headers[j]] = value;
      } else {
        // If the cell is empty, provide a default habitatCode value (e.g., '0')
        obj[headers[j]] = '0';
      }
    }

    result.push(obj);
  }

  return result;
}

// Define a function to get the fill color based on habitatCode
function getColorForHabitatCode(habitatCode) {
  // Implement your logic to map habitatCode to a color
  // For example, you can use a switch statement or a lookup table

  switch (habitatCode) {
    case '1':
      return 'green';
    case '2':
      return 'yellow';
    case '3':
      return 'purple';
    default:
      return 'white';
  }
}
