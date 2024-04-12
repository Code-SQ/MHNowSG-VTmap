function openFormPage() {
    // Specify the URL to open in a new tab
    var url = 'https://forms.gle/NGdhNVEBQyZfKXsp8';
  
    // Open the URL in a new tab or window
    window.open(url, '_blank');
  }
  
  
  // Wait for the DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function () {
  
    // Define the map and its initial view
    var map = L.map('map').setView([1.287953, 103.851784], 17);
  
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
  
        // Create a custom icon for the user marker with a larger size
        var userIcon = L.divIcon({
            className: 'user-marker',
            html: '<div style="font-size: 24px;">📍</div>',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
        });
  
        // Create the user marker with the custom icon
        userMarker = L.marker([lat, lon], {
            icon: userIcon,
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
                map.setView([lat, lon], 17);
  
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
    var csvURL = 'Published_CSV.csv';
  
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
        switch (habitatCode) {
            case 'Forest':
                return '#00FF00'; // Green color
            case 'Desert':
                return '#FFFF00'; // Yellow color
            case 'Swamp':
                return '#FF00FF'; // Purple color
            default:
                return '#FFFFFF'; // White color for unknown habitatCode
        }
    }
  
    // Define a function to update the habitat information
    function updateHabitatInfo() {
        // Get the current UTC 0 date in yyyy-mm-dd format
        const currentDate = new Date();
        currentDate.setUTCHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0 to ensure UTC 0 time
        const currentUTCDate = currentDate.toISOString().split('T')[0]; // Format the date

        // Create the habitat information text
        var habitatInfoText = 'Volatile Territory Info<br>';
        habitatInfoText += 'Green = Forest<br>';
        habitatInfoText += 'Yellow = Desert<br>';
        habitatInfoText += 'Purple = Swamp<br>';
        habitatInfoText += 'Current UTC Date: ' + currentUTCDate;

        // Update the habitat information div
        const habitatInfoDiv = document.getElementById('habitatInfo');
        if (habitatInfoDiv) {
            habitatInfoDiv.innerHTML = habitatInfoText;
        }
    }
  
    // Call the function to initially populate the habitat information
    updateHabitatInfo();
  
  }
);
