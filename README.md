DroneHQ
=======

<img width="500" alt="dronehq_screenshot" src="https://cloud.githubusercontent.com/assets/4162573/12527135/3599d0a0-c12b-11e5-9df1-3aa5190e48a7.png">

=======

This Leaflet app allows you to randomly place a selectable number of waypoint drones on a map. You can then drag-and-drop a (draggable) mission drone on to the map, which will display lines of varying color between the mission and waypoint drones. These lines are a dynamic indication of a somewhat arbitrary prioritization of distances between mission and waypoint drones, but could be used for more specific visualizations such as an indication of prioritized waypoint navigation or remaining battery life for a drone navigating through waypoints.

The app combines Leaflet map control along with D3 line graphics translated to map coordinates. Additionally, draggable HTML elements that can be placed into the Leaflet map environment provide for a more interactive experience. Dynamic, geospatial calculations are performed for each movement, allowing for the possibility of more complex analyses to be performed.


Try It Out
==========

Download the zip and open the 'tool.html' file in your browser of choice. Tested in Chrome (Version 37.0.2062.124 m), IE (10.0.9200.17088, requires you to allow ActiveX though) and Firefox (32.0.3).


DISCLAIMER
==========

The use of the Skyward IO, Inc. logo is merely for demonstration purposes; this app is not affiliated with Skyward IO, Inc. in any way.
