var map;
var markers = [];
var infowindow;
var messagewindow;
var locations = [];
var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var markerCluster;

function refreshMatchedMarkers() {
  // locations.forEach(function(location){console.log(location)});
	var matchedMarkers = locations.map(function(location, i) {
		return new google.maps.Marker({
			position: location,
			label: (i + 1) + ""//labels[i % labels.length]
		});
	});
	// Add a marker clusterer to manage the markers.
	if(markerCluster != null) {
		markerCluster.clearMarkers();
	}
	if(matchedMarkers.length == 0) {
        return;
    }
	markerCluster = new MarkerClusterer(map, matchedMarkers, {
		imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
	});
}

function initMap() {
	var california = {
		lat: 37.4419,
		lng: -122.1419
	};
	map = new google.maps.Map(document.getElementById('map'), {
		center: california,
		zoom: 15
	});

	// Create the search box and link it to the UI element.
	var input = document.getElementById('pac-input');
	var searchBox = new google.maps.places.SearchBox(input);
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
	// Bias the SearchBox results towards current map's viewport.
	map.addListener('bounds_changed', function() {
		searchBox.setBounds(map.getBounds());
	});

	var searchMarkers = [];
	// Listen for the event fired when the user selects a prediction and retrieve
	// more details for that place.
	searchBox.addListener('places_changed', function() {
		var places = searchBox.getPlaces();

		if(places.length == 0) {
			return;
		}

		// Clear out the old searchMarkers.
		searchMarkers.forEach(function(marker) {
			marker.setMap(null);
		});
		searchMarkers = [];

		// For each place, get the icon, name and location.
		var bounds = new google.maps.LatLngBounds();
		places.forEach(function(place) {
			if(!place.geometry) {
				console.log("Returned place contains no geometry");
				return;
			}
			var icon = {
				url: place.icon,
				size: new google.maps.Size(71, 71),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(17, 34),
				scaledSize: new google.maps.Size(25, 25)
			};

			// Create a marker for each place.
			var marker = new google.maps.Marker({
				map: map,
				icon: icon,
				title: place.name,
				position: place.geometry.location
			});
			searchMarkers.push(marker);
			selectMarker(marker);

			if(place.geometry.viewport) {
				// Only geocodes have viewport.
				bounds.union(place.geometry.viewport);
			} else {
				bounds.extend(place.geometry.location);
			}
		});
		map.fitBounds(bounds);
	});

	//lables
	// var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

	// locations = [{
	// 	lat: 37.7723,
	// 	lng: -122.440
	// }]
	refreshMatchedMarkers();

	google.maps.event.addListener(map, 'click', function(event) {
		var marker = new google.maps.Marker({
			position: event.latLng,
			map: map
		});
		selectMarker(marker);
    // saveData();
	});

	currInfoWindow = new google.maps.InfoWindow;

	function selectMarker(marker) {
		if(markers.length == 1) {
			markers[0].setMap(null);
		}
		markers = [];
		markers.push(marker);
	}

	// Try HTML5 geolocation.
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var pos = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};

			var currLatLng = new google.maps.LatLng(pos.lat, pos.lng);
			var marker = new google.maps.Marker({
				position: currLatLng,
				icon: {
					path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
					scale: 5
				},
				draggable: true,
				map: map
			});
			selectMarker(marker);

			map.setCenter(pos);
		}, function() {
			handleLocationError(true, currInfoWindow, map.getCenter());
		});
	} else {
		// Browser doesn't support Geolocation
		handleLocationError(false, currInfoWindow, map.getCenter());
	}
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
	infoWindow.setPosition(pos);
	infoWindow.setContent(browserHasGeolocation ?
		'Error: The Geolocation service failed.' :
		'Error: Your browser doesn\'t support geolocation.');
	infoWindow.open(map);
}

function saveData() {
	// var time = document.getElementById('time').value;
	// var attendance = document.getElementById('attendance').value;
	var latlng = markers[0].getPosition();
	console.log('latitude: ' + latlng.lat());
	console.log('longitude: ' + latlng.lng());
	// alert('time: '+time+'  max attentance: '+attendance);
}
