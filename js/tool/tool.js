// Tool controller object
function object_tool(){
		
	// Define GeographicLib.Geodesic function!
	this.geod = GeographicLib.Geodesic.WGS84;
	
	// Initialize Tool object
	this.init_tool = function(){	

		var that = this; 
		
		// Initialize map to Skyward IO HQ
		v_map.init_map(45.520369, -122.671264, 16);
		
		// Define click function for add random waypoint drones button
		$('#btn_rdm_drone_waypoint').click(function(){
			
			// Get input number of waypoint drones
			var num_drone_waypoint_tmp = $('#input_drone_waypoint').val();

			// Check that input number of waypoint drones is real number
			if(that.isNumber(num_drone_waypoint_tmp)){
				var num_drone_waypoint = parseInt(num_drone_waypoint_tmp);
			}else{
				// If not a number, default to 1
				var num_drone_waypoint = 1;
			}
			$('#input_drone_waypoint').val(num_drone_waypoint);
			
			// Get LatLng bounds of Leaflet current zoom
			var bounds = v_map.map.getBounds();
			
			// Generate waypoint drones
			v_map.generateWaypointDrones(bounds, num_drone_waypoint);

			// Update mission drone information
			v_tool.updateMissionDrone();
			
		})
		
		// Define click function for clear all drones button
		$('#btn_clear_drone_all').click(function(){
			v_map.clearWaypointDrones(); // Clear all waypoint drones
			v_map.clearMissionDrone(); // Clear mission drone
			that.clearLines();
		})
	
	}
	
	// Update mission drone information
	this.updateMissionDrone = function(){
		// If mission drone exists...
		if(v_map.markers.drone_mission.length > 0){
			this.plotLines(); // Plot mission-waypoint drone lines
		}
	}
	
	// Clear all mission-waypoint drone lines
	this.clearLines = function(){
		d3.selectAll("line").remove()
	}	
	
	// Plot mission-waypoint drone lines
	this.plotLines = function(){

		var that = this;
		
		this.clearLines(); // Clear all mission-waypoint drone lines
		
		// Get pixel xy points of mission drone LatLng
		var point_drone_mission = v_map.projectLatLng(v_map.markers.drone_mission[0]._latlng);
		
		// Calculate distance/bearing between mission drone and HQ
		// Assume Leaflet coordinate system is WGS84!
		var geo_mission2hq = this.geod.Inverse(
			v_map.markers.hq[0]._latlng.lat, 
			v_map.markers.hq[0]._latlng.lng, 
			v_map.markers.drone_mission[0]._latlng.lat, 
			v_map.markers.drone_mission[0]._latlng.lng
		);
		
		// Initialize relative distance arrays
		var rel_distances_waypoint2hq = [];
		var rel_distances_mission2hq = [];
		var rel_distances_mission2waypoint = [];
		
		// Loop through each waypoint drone...
		$.each(v_map.markers.drone_waypoint, function(idx, drone_waypoint){
		
			// Calculate distance/bearing between mission and waypoint drones
			var ge0_mission2waypoint = that.geod.Inverse(
				v_map.markers.drone_mission[0]._latlng.lat, 
				v_map.markers.drone_mission[0]._latlng.lng, 
				drone_waypoint._latlng.lat, 
				drone_waypoint._latlng.lng
			);
			
			// Calculate distance/bearing between waypoint drone and HQ
			var geo_waypoint2hq = that.geod.Inverse(
				v_map.markers.hq[0]._latlng.lat, 
				v_map.markers.hq[0]._latlng.lng, 
				drone_waypoint._latlng.lat, 
				drone_waypoint._latlng.lng
			);
			
			// Define relative distance metric and add to array
			// Arbirtary strength of distance between 3 interactions:
			// - mission drone & HQ
			// - mission drone & waypoint drone
			// - waypoint drone & HQ 
			
			// Arbitrary metric
			var metric = ge0_mission2waypoint.s12 * geo_waypoint2hq.s12 / geo_mission2hq.s12;
			
			// Add metric value to relative distance array
			rel_distances_mission2waypoint.push(metric);
		
			// Define default HSV color of mission-waypoint drone line
			var hue = 120, sat = 100, val = 50;
			var color = 'hsl(' + hue + ',' + sat + '%,' + val + '%)';
			
			// Get pixel xy points of waypoint drone LatLng
			var point_drone_waypoint = v_map.projectLatLng(drone_waypoint._latlng);
		
			// Draw D3 line between mission and waypoint drone
			var myLine = v_map.svg_layer.svg.append("svg:line")
				.attr("x1", point_drone_waypoint[0])
				.attr("y1", point_drone_waypoint[1])
				.attr("x2", point_drone_mission[0])
				.attr("y2", point_drone_mission[1])
				.style("stroke", color)
				.style("stroke-width", 5);
		})
		
		// Select all mission-waypoint drone lines and apply new stroke color
		d3.selectAll('line').style("stroke", function(d,ii){
			
			// Get relative distance metric
			// NOTE: Assumes array order matches between D3 lines and markers.
			var rel_distance = rel_distances_mission2waypoint[ii];

			// Calculate max/min relative distance
			var max_rel_distance = Math.max.apply(Math, rel_distances_mission2waypoint);
			var min_rel_distance = Math.min.apply(Math, rel_distances_mission2waypoint);
			
			// Define HSV color range (red=0 to green=120)
			var hue_min = 0, hue_max = 120;
			var sat = 100, val = 50;
			
			// Calculate hue based on relative distance
			var hue = (((rel_distance - min_rel_distance) * (hue_max - hue_min)) / (max_rel_distance - min_rel_distance)) + hue_min;
			var color = 'hsl(' + hue + ',' + sat + '%,' + val + '%)';
			return color;
		})

	}
	
	// Real number check
	this.isNumber = function(n){
		return !isNaN(parseFloat(n)) && isFinite(n);
	}
	
}