/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Import marker images directly
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const MapComponent = () => {
  useEffect(() => {
    // Ensure map container exists and hasn't been initialized
    const mapContainer = document.getElementById("map");
    if (!mapContainer || mapContainer._leaflet_id) return;

    // Create custom icon using imported images
    const defaultIcon = L.icon({
      iconUrl: markerIcon,
      iconRetinaUrl: markerIcon2x,
      shadowUrl: markerShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Set default icon for all markers
    L.Marker.prototype.options.icon = defaultIcon;

    // Initialize map
    const map = L.map("map", {
      center: [-1.908585181820936, 30.06428949699932],
      zoom: 8
    });

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add marker
    L.marker([-1.908585181820936, 30.06428949699932])
      .addTo(map)
      .bindPopup("<b>Our Location</b>")
      .openPopup();

    // Cleanup function
    return () => {
      map.remove();
    };
  }, []); 

  return (
    <div
      id="map"
      style={{
        height: "200px",
        width: "100%",
      }}
      className="w-full"
    />
  );
};

export default MapComponent;