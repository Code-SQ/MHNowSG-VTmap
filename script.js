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

  // Define a function to get the fill color based on habitatCode and current UTC 0 date
  function getColorForHabitatCode(habitatCode) {
    // Specify the start date in UTC 0 time zone (YYYY-MM-DD format)
    const startDate = new Date('2023-09-14');

    // Get the current UTC 0 date
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0 to ensure UTC 0 time

    // Calculate the number of days since the start date
    const daysPassed = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));

    // Define an array of colors in the desired sequence (green -> yellow -> purple)
    const colors = ['#00FF00', '#FFFF00', '#FF00FF'];

    // If habitatCode is 0 or undefined, return white
    if (habitatCode === '0' || habitatCode === undefined) {
        return '#FFFFFF'; // White color
    }

    // Calculate the index of the color to use based on habitatCode and days passed
    const colorIndex = (parseInt(habitatCode) - 1 + daysPassed) % colors.length;

    // Return the color based on the color index
    return colors[colorIndex];
  }

  // Define a function to update the habitat information
  function updateHabitatInfo() {
    // Specify the start date in UTC 0 time zone (YYYY-MM-DD format)
    const startDate = new Date('2023-09-14');

    // Get the current UTC 0 date in yyyy-mm-dd format
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0 to ensure UTC 0 time
    const currentUTCDate = currentDate.toISOString().split('T')[0]; // Format the date

    // Define an array of habitats in the desired sequence (Forest -> Desert -> Swamp)
    const habitats = ['Forest', 'Desert', 'Swamp'];

    // Calculate the number of days since the start date
    const daysPassed = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));

    // Create the habitat information text
    var habitatInfoText = 'Habitat Code Info<br>';
    for (var i = 1; i <= 3; i++) {
      const habitatIndex = (i - 1 + daysPassed) % habitats.length;
      habitatInfoText += i + ' = ' + habitats[habitatIndex] + '<br>';
    }
    habitatInfoText += 'Current UTC Date: ' + currentUTCDate;

    // Update the habitat information div
    const habitatInfoDiv = document.getElementById('habitatInfo');
    if (habitatInfoDiv) {
      habitatInfoDiv.innerHTML = habitatInfoText;
    }
  }

  // Call the function to initially populate the habitat information
  updateHabitatInfo();

  // Define park marker location
  var markers = [
    { name: 'Alexandra Canal Linear Park', lat: 1.2964539527893066, lon: 103.80558776855469, status: 'Unverified' },
    { name: 'Bedok Reservoir Park', lat: 1.3385679721832275, lon: 103.934326171875, status: 'Unverified' },
    { name: 'Bishan-Ang Mo Kio Park', lat: 1.3601479530334473, lon: 103.85192108154297, status: 'Verified' },
    { name: 'Bukit Batok Central Park', lat: 1.3487269878387451, lon: 103.74644470214844, status: 'Unverified' },
    { name: 'Choa Chu Kang Park', lat: 1.38510000705719, lon: 103.74652099609375, status: 'Verified' },
    { name: 'City Green', lat: 1.3117669820785522, lon: 103.85588073730469, status: 'Unverified' },
    { name: 'East Coast Park (Zone C)', lat: 1.2979110479354858, lon: 103.90574645996094, status: 'Verified' },
    { name: 'Fort Canning Park', lat: 1.2912720441818237, lon: 103.84851837158203, status: 'Unverified' },
    { name: 'Gardens by the Bay', lat: 1.2841140031814575, lon: 103.86548614501953, status: 'Unverified' },
    { name: 'Green House', lat: 1.3784600496292114, lon: 103.76513671875, status: 'Unverified' },
    { name: 'Holland Village Park', lat: 1.3117749691009521, lon: 103.79552459716797, status: 'Unverified' },
    { name: 'Hougang Neighbourhood Park', lat: 1.367671012878418, lon: 103.89631652832031, status: 'Unverified' },
    { name: 'Jubilee Gardening Community Park', lat: 1.3051249980926514, lon: 103.765625, status: 'Unverified' },
    { name: 'Jurong Central Park', lat: 1.3394629955291748, lon: 103.7077865600586, status: 'Unverified' },
    { name: 'Mount Faber Park', lat: 1.2703410387039185, lon: 103.82206726074219, status: 'Unverified' },
    { name: 'My Waterway@Punggol', lat: 1.4071370363235474, lon: 103.90245056152344, status: 'Unverified' },
    { name: 'Pasir Ris Park', lat: 1.3777610063552856, lon: 103.94451141357422, status: 'Unverified' },
    { name: 'Singapore Botanic Gardens', lat: 1.3222529888153076, lon: 103.815185546875, status: 'Unverified' },
    { name: 'Tampines Central Park', lat: 1.3538860082626343, lon: 103.93647003173828, status: 'Verified' },
    { name: 'Toa Payoh Town Park', lat: 1.3312729597091675, lon: 103.84647369384766, status: 'Verified' },
    { name: 'Upper Seletar Reservoir Park', lat: 1.4053939580917358, lon: 103.8080825805664, status: 'Unverified' },
    { name: 'Woodlands Admiral Garden', lat: 1.4375200271606445, lon: 103.79950714111328, status: 'Unverified' },
    { name: 'Yishun Park', lat: 1.4240150451660156, lon: 103.84410858154297, status: 'Verified' },
    { name: 'Bugis Junction', lat: 1.299131211395429, lon: 103.85544961289685, status: 'Verified' },
    { name: 'Hougang Ave 1 Park', lat: 1.35609, lon: 103.88926, status: 'Verified' },
    { name: 'Bukit Panjang Park', lat: 1.37239, lon: 103.77631, status: 'Verified' },
    { name: 'Velocity @ Novena Square', lat: 1.31997, lon: 103.84389, status: 'Verified' },
    { name: 'Bishan Harmony Park', lat: 1.34505, lon: 103.84728, status: 'Verified' }
  ];

  function createTreeMarkerIcon() {
    return L.divIcon({
        className: 'tree-marker',
        html: '<div style="font-size: 24px; color: #13A10E; background-color: #fff; border: 2px solid #13A10E; border-radius: 50%; text-align: center; width: 32px; height: 32px; line-height: 32px;">🌳</div>',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    });
  }

  // Function to add tree markers to the map
  function addTreeMarkers() {
    markers.forEach(function (marker) {
      var treeMarker = L.marker([marker.lat, marker.lon], {
        icon: createTreeMarkerIcon(),
      }).addTo(map);
      
      // Add a Tooltip that displays the name when hovering over the marker
      treeMarker.bindTooltip(marker.name + '<br>' + marker.status, {
          permanent: false,
          direction: 'top',
          offset: [0, -20]
      });
      
      // Handle mouse events to show/hide the Tooltip
      treeMarker.on('mouseover', function () {
          treeMarker.openTooltip();
      });
      
      treeMarker.on('mouseout', function () {
          treeMarker.closeTooltip();
      });
      
    });
  }

  // Call the function to add tree markers to the map
  addTreeMarkers();

});
