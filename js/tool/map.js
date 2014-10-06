// Map controller object
function object_map(){	
	
	////// Parameters //////
	
	// Leafet layers
	this.layers = {
		hq: [],
		drone_waypoint: [],
		drone_mission: []
	}
	
	// Leaflet markers
	this.markers = {
		hq: [],
		drone_mission: [],
		drone_waypoint: []
	};
	
	// Specify icon types (L.Icon extensions)
	var icon_types = {
		hq: L.Icon.extend({options: {iconSize: [50, 50], iconAnchor: [25, 25],	popupAnchor: [0, -15]}}),
		drone: L.Icon.extend({options: {iconSize: [50, 50], iconAnchor: [25, 25],	popupAnchor: [0, -15]}})
	};
	
	// Specify icon images
	var icons = {
		skyward: new icon_types.hq({iconUrl: 'icons/icon-skyward.png'}),
		drone_mission: new icon_types.drone({iconUrl: 'icons/icon-drone_mission.png'}),
		drone_waypoint: new icon_types.drone({iconUrl: 'icons/icon-drone_waypoint.png'})
	}

	////// Methods //////
	
	// Initialize map
	this.init_map = function(lat,lng,zoom){
	
		// Leaflet map
		v_map.map = L.map('map', {center: [lat, lng], zoom: zoom, worldCopyJump: true});		
				
		// Create base layers and overlays
		// ESRI maps w/ ASTER Terrain overlays
		L.control.layers({
			'Topographic Map': L.esri.basemapLayer("Topographic",{continuousWorld: false, noWrap: true}).addTo(v_map.map),
			'Imagery Map': L.esri.basemapLayer("Imagery",{continuousWorld: false, noWrap: true}),
			'Gray Map': L.esri.basemapLayer("Gray",{continuousWorld: false, noWrap: true}),
			},
			{'ASTER GDEM & SRTM Hillshade': L.tileLayer(
				'http://129.206.74.245:8004/tms_hs.ashx?x={x}&y={y}&z={z}',
				{continuousWorld: false, noWrap: true}
			),
			'ASTER GDEM Contour': L.tileLayer(
				'http://129.206.74.245:8006/tms_il.ashx?x={x}&y={y}&z={z} ',
				{continuousWorld: false, noWrap: true}
			)
		}).addTo(v_map.map);
		
		// Mouse position display
		L.control.mousePosition().addTo(v_map.map);
		
		// *** Add SkyWard IO HQ *** 
		
		// Create popup text
		var pu = '<img src="images/img_hq.png"></><br><b>SkyWard IO, Inc.</b><br>233 SW Naito Pkwy.<br>Portland, OR 97204';
		
		// Create HQ marker
		v_map.markers.hq = [L.marker([lat, lng], {icon: icons.skyward}).bindPopup(pu)];
		
		// Add HQ marker to layer and add to map
		v_map.layers.hq = L.layerGroup(v_map.markers.hq).addTo(v_map.map);
	
		// Define draggable start/stop functions for new mission drone element 
		$(".drag").draggable({
		  helper: 'clone',
		  stack: ".drag",
		  containment: 'map',
		  zIndex: 10000,
		  appendTo: 'body',
		  start: function(evt, ui) {
			  $('#drone_mission').fadeTo('fast', 0.6, function() {});
			  v_map.clearMissionDrone(); // Clear mission Drone from map
		  },
		  stop: function(evt, ui) {
			  $('#drone_mission').fadeTo('fast', 1.0, function() {});
				var offset = $('#map').offset(); // Get offset of 'map' element
				var size = v_map.map.getSize(); // Get Leaflet size of map
				// Check to make sure that the drag end position is in map
				if((ui.offset.left >= offset.left  & ui.offset.left <= (offset.left + size.x)) & 
				(ui.offset.top >= offset.top & ui.offset.top <= (offset.top + size.y))){
					v_map.addMissionDrone(evt); // Add new mission drone to map
					v_tool.updateMissionDrone(); // Update mission drone information				
				}
		  }
		});
		
		
		// Set map viewreset function 
		v_map.map.on("viewreset", v_map.resetView);
				
		// Create SVG layer for D3 overlay
		v_map.map._initPathRoot(); // Initialize the SVG layer 
		v_map.svg_layer = {};
		v_map.svg_layer.svg = d3.select("#map").select("svg");
		v_map.svg_layer.g = v_map.svg_layer.svg.append("g");
		
	}
		
	// Set base map layer
	this.setBaseMap = function(maptype){
		v_map.pcv_map.removeLayer(v_map.pcv_map.current_layer);
		v_map.pcv_map.current_layer = L.esri.basemapLayer(maptype);
		v_map.pcv_map.addLayer(v_map.pcv_map.current_layer);
	}
	
	// Reset view function for Leaflet
	this.resetView = function(){
		if(v_map.markers.drone_mission.length > 0 && v_map.markers.drone_waypoint.length > 0){
			v_tool.plotLines(); // Redraw mission-bad drone lines on zoom
		}
	}
	
	// Clear mission drone marker from map
	this.clearMissionDrone = function(){
		v_map.map.removeLayer(v_map.layers.drone_mission);
		v_map.markers.drone_mission = [];
		
	}
	
	// Add mission drone to map
	this.addMissionDrone = function(evt){
		
		// Inputs
		// evt = mission drone icon draggable stop event

		// Get LatLng position of dragend point (mission drone location)
		var latlng = v_map.map.containerPointToLatLng(v_map.map.mouseEventToContainerPoint(evt));
	
		// Create popup for mission drone
		var pu = '<b>Mission Drone</b><br>Lat: ' + latlng.lat.toFixed(4) + '<br>Lng: ' + latlng.lng.toFixed(4);
		
		// Create mission drone marker
		v_map.markers.drone_mission = [
			L.marker(latlng, {icon: icons.drone_mission, draggable: true}).bindPopup(pu)
			.on('dragstart', function(e){
				v_tool.clearLines(); // Clear mission-bad drone lines on dragstart
			})
			.on('dragend', function(e){
				latlng = e.target.getLatLng(); // Get LatLng of dragend position
				// Create popup
				var pu = '<b>mission Drone</b><br>Lat: ' + latlng.lat.toFixed(4) + '<br>Lng: ' + latlng.lng.toFixed(4);
				this.bindPopup(pu); // Bind popup to new mission drone marker
				v_tool.updateMissionDrone(); // Update mission drone information
			})
		];
		
		// Add mission drone layer to map
		v_map.layers.drone_mission = L.layerGroup(v_map.markers.drone_mission).addTo(v_map.map);
		
	}
	
	// Clear all bad drones from map
	this.clearWaypointDrones = function(){
	
		v_map.map.removeLayer(v_map.layers.drone_waypoint);
		v_map.markers.drone_waypoint = [];
		
	}
		
	// Generate new bad drones randomly on map
	this.generateWaypointDrones = function(bounds, num_drone_waypoint){
		
		// Inputs	
		// bounds = SW/NE bounds of Leaflet map (current zoom)
		// num_drone_waypoint = input number of bad drones

		this.clearWaypointDrones(); // Clear all bad drones
		
		// Loop through number of bad drones
		for (var ii = 0; ii < num_drone_waypoint; ii++){
		
			// Calculate lat/lng range of Leaflet zoom
			var d_lat = Math.abs(bounds._northEast.lat - bounds._southWest.lat);
			var d_lng = Math.abs(bounds._northEast.lng - bounds._southWest.lng);
			
			// Generate random lat/lng within range
			var lat = Math.random() * d_lat + bounds._southWest.lat;
			var lng = Math.random() * d_lng + bounds._southWest.lng;
			
			// Create popup for each bad drone
			var pu = '<b>Waypoint Drone #' + (ii+1) + '</b><br>Lat: ' + lat.toFixed(4) + '<br>Lng: ' + lng.toFixed(4);
			
			// Crate bad drone marker
			v_map.markers.drone_waypoint.push(L.marker([lat, lng], {icon: icons.drone_waypoint}).bindPopup(pu));
		}
		
		// Add waypoint drone marker set to layer and map
		v_map.layers.drone_waypoint = L.layerGroup(v_map.markers.drone_waypoint).addTo(v_map.map);
	
	}
	
	// Convert Leaflet LatLng to pixel points
	this.projectLatLng = function(x){
		point = v_map.map.latLngToLayerPoint(x);
		return [point.x, point.y];
	}
		
}
