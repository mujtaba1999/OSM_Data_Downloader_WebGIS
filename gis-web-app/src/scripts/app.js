// This file contains the JavaScript code for the web application.
// It handles the interactive features and functionality, such as map rendering and user interactions.

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Leaflet map
    var map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // FeatureGroup to store drawn layers
    var drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // Layer group for OSM data
    var osmLayer = L.geoJSON(null, {
        style: { color: '#0078ff' },
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, { radius: 6, color: '#ff7800' });
        },
        onEachFeature: function (feature, layer) {
            var props = feature.properties || {};
            var type = props.highway || props.building || props.shop || '';
            var popupContent = '<div style="min-width:150px;padding:8px 12px;background:#f8f9fa;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.12);color:#333;">';
            if (props.name) {
                popupContent += '<div style="font-weight:bold;font-size:16px;margin-bottom:4px;">' + props.name + '</div>';
            }
            if (type) {
                popupContent += '<div style="font-size:14px;color:#0078ff;">Type: ' + type + '</div>';
            }
            if (!props.name && !type) {
                popupContent += '<div style="font-size:14px;">No details available.</div>';
            }
            popupContent += '</div>';
            layer.bindPopup(popupContent);
        }
    }).addTo(map);

    // Initialize the draw control and pass it the FeatureGroup of editable layers
    var drawControl = new L.Control.Draw({
        draw: {
            polyline: false,
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false,
            polygon: {
                allowIntersection: false,
                showArea: true,
                drawError: {
                    color: '#e1e100',
                    message: '<strong>Error:<strong> you cannot draw that!'
                },
                shapeOptions: {
                    color: '#97009c'
                }
            }
        },
        edit: {
            featureGroup: drawnItems
        }
    });
    map.addControl(drawControl);

    var currentAOI = null;

    // Helper to get Overpass query for selected type
    function getOverpassQuery(type, polygonCoords) {
        // Ensure polygon is closed
        if (polygonCoords.length > 0 && (polygonCoords[0].lat !== polygonCoords[polygonCoords.length-1].lat || polygonCoords[0].lng !== polygonCoords[polygonCoords.length-1].lng)) {
            polygonCoords = polygonCoords.concat([polygonCoords[0]]);
        }
        var polyString = polygonCoords.map(function (latlng) {
            return latlng.lat + ' ' + latlng.lng;
        }).join(' ');
        console.log('Overpass polyString:', polyString);
        var queries = {
            roads: 'way["highway"](poly:"' + polyString + '");',
            buildings: 'way["building"](poly:"' + polyString + '");',
            shops: 'node["shop"](poly:"' + polyString + '");',
            all: 'way["highway"](poly:"' + polyString + '");way["building"](poly:"' + polyString + '");node["shop"](poly:"' + polyString + '");'
        };
        // For roads, only fetch ways (not nodes)
        if (type === 'roads') {
            return '[out:json][timeout:25];(' + queries.roads + ');out body;>;out skel qt;';
        }
        return '[out:json][timeout:25];(' + queries[type] + ');out body;>;out skel qt;';
    }

    // Wait for osmtogeojson to load before using it
    var osmtogeojsonReady = false;
    var fetchBtn = document.getElementById('fetch-osm-btn');
    if (fetchBtn) fetchBtn.disabled = true;

    // Helper to enable fetch button when ready
    function enableFetchButtonIfReady() {
        var hasDrawnAOI = currentAOI;
        var hasUploadedAOI = uploadedAOICoords && uploadedAOICoords.length > 0;
        if (fetchBtn && (hasDrawnAOI || hasUploadedAOI) && osmtogeojsonReady) {
            fetchBtn.disabled = false;
        } else if (fetchBtn) {
            fetchBtn.disabled = true;
        }
    }

    // Add osmtogeojson library
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/osmtogeojson@3.0.0-beta.5/osmtogeojson.min.js';
    script.onload = function() {
        osmtogeojsonReady = true;
        enableFetchButtonIfReady();
        console.log('osmtogeojson library loaded and ready.');
    };
    document.body.appendChild(script);

    var downloadBtn = document.getElementById('download-geojson-btn');
    var lastGeoJSON = null;

    // Enable OSM checkbox and download button only when data is fetched
    function fetchOSMData(type, polygonLayer) {
        var fetchingIndicator = document.getElementById('fetching-indicator');
        if (fetchingIndicator) fetchingIndicator.style.display = 'block';
        console.log('fetchOSMData called with type:', type);
        var latlngs = polygonLayer.getLatLngs()[0];
        console.log('LatLngs for Overpass:', latlngs);
        // Log AOI bounds
        if (latlngs && latlngs.length > 0) {
            var lats = latlngs.map(function(p){return p.lat;});
            var lngs = latlngs.map(function(p){return p.lng;});
            console.log('AOI bounds:', {
                minLat: Math.min.apply(null, lats),
                maxLat: Math.max.apply(null, lats),
                minLng: Math.min.apply(null, lngs),
                maxLng: Math.max.apply(null, lngs)
            });
        }
        var query = getOverpassQuery(type, latlngs);
        console.log('Overpass query:', query);
        var url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);
        console.log('Fetching OSM data from:', url);
        fetch(url)
            .then(function (response) {
                console.log('Overpass API response status:', response.status);
                return response.json();
            })
            .then(function (data) {
                console.log('Overpass API data:', data);
                var geojson = window.osmtogeojson(data);
                lastGeoJSON = geojson;
                console.log('Converted to GeoJSON:', geojson);
                osmLayer.clearLayers();
                osmLayer.addData(geojson);
                // Fit map to bounds if features exist
                var bounds = osmLayer.getBounds();
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { maxZoom: 17 });
                }
                if (!geojson.features || geojson.features.length === 0) {
                    alert('No OSM data found for the selected area and type.');
                    if (toggleOSM) {
                        toggleOSM.disabled = true;
                        toggleOSM.checked = false;
                    }
                    if (downloadBtn) {
                        downloadBtn.disabled = true;
                    }
                } else {
                    if (toggleOSM) {
                        toggleOSM.disabled = false;
                        toggleOSM.checked = true;
                    }
                    if (downloadBtn) {
                        downloadBtn.disabled = false;
                    }
                }
            })
            .catch(function (err) {
                console.error('Error fetching OSM data:', err);
                alert('Error fetching OSM data: ' + err);
                if (toggleOSM) {
                    toggleOSM.disabled = true;
                    toggleOSM.checked = false;
                }
                if (downloadBtn) {
                    downloadBtn.disabled = true;
                }
            })
            .finally(function () {
                if (progress) progress.style.display = 'none';
                if (fetchingIndicator) fetchingIndicator.style.display = 'none';
            });
    }

    // Download GeoJSON functionality
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function () {
            if (!lastGeoJSON) return;
            if (lastGeoJSON && lastGeoJSON.features && lastGeoJSON.features.length > 0) {
                var confirmDownload = confirm('Are you sure you want to download the current GeoJSON data?');
                if (!confirmDownload) return;
            }
            var dataStr = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lastGeoJSON, null, 2));
            var downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "osm_data.geojson");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        });
    }

    // Listen for button click to fetch OSM data
    var dropdown = document.getElementById('layer-dropdown');
    if (fetchBtn) {
        fetchBtn.addEventListener('click', function () {
            console.log('Fetch button clicked');
            var useUploadedAOI = uploadedAOICoords && uploadedAOICoords.length > 0;
            var aoiToUse = useUploadedAOI ? uploadedAOICoords : (currentAOI ? currentAOI.getLatLngs()[0] : null);
            console.log('AOI to use for fetch:', aoiToUse);
            if ((useUploadedAOI || currentAOI) && dropdown) {
                if (lastGeoJSON && lastGeoJSON.features && lastGeoJSON.features.length > 0) {
                    var confirmFetch = confirm('There is already fetched data on the map. Do you want to overwrite it with new data?');
                    if (!confirmFetch) return;
                }
                console.log('AOI and dropdown present, fetching:', dropdown.value);
                // Use uploaded AOI for Overpass query if present
                fetchOSMData(dropdown.value, { getLatLngs: function() { return [aoiToUse]; } });
            } else {
                alert('Please draw an AOI, upload a file, and select a layer type first.');
            }
        });
        fetchBtn.disabled = true;
    }

    // Event handler for when a polygon is created
    map.on(L.Draw.Event.CREATED, function (event) {
        var layer = event.layer;
        drawnItems.clearLayers();
        drawnItems.addLayer(layer);
        currentAOI = layer;
        if (toggleAOI) {
            toggleAOI.disabled = false;
            toggleAOI.checked = true;
        }
        enableFetchButtonIfReady();
    });

    // Layer control toggles
    var toggleAOI = document.getElementById('toggle-aoi');
    var toggleOSM = document.getElementById('toggle-osm');
    var toggleUploaded = document.getElementById('toggle-uploaded');
    if (toggleAOI) {
        toggleAOI.addEventListener('change', function() {
            drawnItems.eachLayer(function(layer) {
                if (toggleAOI.checked) {
                    map.addLayer(layer);
                } else {
                    map.removeLayer(layer);
                }
            });
        });
    }
    if (toggleOSM) {
        toggleOSM.addEventListener('change', function() {
            if (toggleOSM.checked) {
                map.addLayer(osmLayer);
            } else {
                map.removeLayer(osmLayer);
            }
        });
    }
    if (toggleUploaded) {
        toggleUploaded.addEventListener('change', function() {
            if (uploadedAOILayer) {
                if (toggleUploaded.checked) {
                    map.addLayer(uploadedAOILayer);
                } else {
                    map.removeLayer(uploadedAOILayer);
                }
            }
        });
    }

    // Collapsible layer control panel
    var layerPanel = document.getElementById('layer-control-panel');
    var layerToggle = document.getElementById('layer-control-toggle');
    if (layerPanel && layerToggle) {
        layerToggle.addEventListener('click', function() {
            layerPanel.classList.toggle('collapsed');
        });
    }

    var clearBtn = document.getElementById('clear-selection-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            osmLayer.clearLayers();
            lastGeoJSON = null;
            if (toggleOSM) {
                toggleOSM.disabled = true;
                toggleOSM.checked = false;
            }
            if (downloadBtn) {
                downloadBtn.disabled = true;
            }
        });
    }

    // File upload and AOI fetch for GeoJSON
    var uploadInput = document.getElementById('upload-input');
    var uploadedAOILayer = null;
    var uploadedAOICoords = null;

    if (uploadInput) {
        uploadInput.addEventListener('change', function(e) {
            var file = e.target.files[0];
            if (!file) return;
            var ext = file.name.split('.').pop().toLowerCase();
            if (ext === 'geojson' || ext === 'json') {
                var reader = new FileReader();
                reader.onload = function(event) {
                    try {
                        var geojson = JSON.parse(event.target.result);
                        if (uploadedAOILayer) {
                            map.removeLayer(uploadedAOILayer);
                        }
                        uploadedAOILayer = L.geoJSON(geojson, {
                            style: { color: '#5b9df9', weight: 2, fillOpacity: 0.2 },
                            onEachFeature: function (feature, layer) {
                                layer.bindPopup('Uploaded AOI');
                            }
                        }).addTo(map);
                        map.fitBounds(uploadedAOILayer.getBounds());
                        // Try to extract polygon coordinates for Overpass
                        var coords = null;
                        if (geojson.type === 'FeatureCollection' && geojson.features.length > 0) {
                            var poly = geojson.features[0].geometry;
                            if (poly.type === 'Polygon') coords = poly.coordinates[0];
                            if (poly.type === 'MultiPolygon') coords = poly.coordinates[0][0];
                        } else if (geojson.type === 'Polygon') {
                            coords = geojson.coordinates[0];
                        } else if (geojson.type === 'MultiPolygon') {
                            coords = geojson.coordinates[0][0];
                        }
                        if (coords) {
                            // Ensure [lat, lng] order for Overpass
                            uploadedAOICoords = coords.map(function(c) {
                                // If coordinates are [lng, lat], swap them
                                if (Array.isArray(c) && c.length === 2) {
                                    return {lat: c[1], lng: c[0]};
                                }
                                return c;
                            });
                            // Ensure polygon is closed
                            if (uploadedAOICoords.length > 0 && (uploadedAOICoords[0].lat !== uploadedAOICoords[uploadedAOICoords.length-1].lat || uploadedAOICoords[0].lng !== uploadedAOICoords[uploadedAOICoords.length-1].lng)) {
                                uploadedAOICoords.push({lat: uploadedAOICoords[0].lat, lng: uploadedAOICoords[0].lng});
                            }
                            console.log('Final AOI coordinates for Overpass:', uploadedAOICoords);
                            enableFetchButtonIfReady();
                        } else {
                            uploadedAOICoords = null;
                            alert('Could not extract polygon coordinates from uploaded file.');
                        }
                        // Enable toggle after AOI layer is created
                        if (toggleUploaded) {
                            toggleUploaded.disabled = !uploadedAOILayer;
                            toggleUploaded.checked = !!uploadedAOILayer;
                            if (uploadedAOILayer && toggleUploaded.checked) {
                                map.addLayer(uploadedAOILayer);
                            } else if (uploadedAOILayer && !toggleUploaded.checked) {
                                map.removeLayer(uploadedAOILayer);
                            }
                        }
                    } catch (err) {
                        alert('Invalid GeoJSON file.');
                    }
                };
                reader.readAsText(file);
            } else if (ext === 'zip') {
                var reader = new FileReader();
                reader.onload = function(event) {
                    shp(event.target.result).then(function(geojson) {
                        if (uploadedAOILayer) {
                            map.removeLayer(uploadedAOILayer);
                        }
                        uploadedAOILayer = L.geoJSON(geojson, {
                            style: { color: '#5b9df9', weight: 2, fillOpacity: 0.2 },
                            onEachFeature: function (feature, layer) {
                                layer.bindPopup('Uploaded AOI');
                            }
                        }).addTo(map);
                        map.fitBounds(uploadedAOILayer.getBounds());
                        // Try to extract polygon coordinates for Overpass
                        var coords = null;
                        if (geojson.type === 'FeatureCollection' && geojson.features.length > 0) {
                            var poly = geojson.features[0].geometry;
                            if (poly.type === 'Polygon') coords = poly.coordinates[0];
                            if (poly.type === 'MultiPolygon') coords = poly.coordinates[0][0];
                        } else if (geojson.type === 'Polygon') {
                            coords = geojson.coordinates[0];
                        } else if (geojson.type === 'MultiPolygon') {
                            coords = geojson.coordinates[0][0];
                        }
                        if (coords) {
                            // Ensure [lat, lng] order for Overpass
                            uploadedAOICoords = coords.map(function(c) {
                                // If coordinates are [lng, lat], swap them
                                if (Array.isArray(c) && c.length === 2) {
                                    return {lat: c[1], lng: c[0]};
                                }
                                return c;
                            });
                            // Ensure polygon is closed
                            if (uploadedAOICoords.length > 0 && (uploadedAOICoords[0].lat !== uploadedAOICoords[uploadedAOICoords.length-1].lat || uploadedAOICoords[0].lng !== uploadedAOICoords[uploadedAOICoords.length-1].lng)) {
                                uploadedAOICoords.push({lat: uploadedAOICoords[0].lat, lng: uploadedAOICoords[0].lng});
                            }
                            console.log('Final AOI coordinates for Overpass:', uploadedAOICoords);
                            enableFetchButtonIfReady();
                        } else {
                            uploadedAOICoords = null;
                            alert('Could not extract polygon coordinates from uploaded shapefile.');
                            if (fetchBtn) fetchBtn.disabled = true;
                        }
                        // Enable toggle after AOI layer is created
                        if (toggleUploaded) {
                            toggleUploaded.disabled = !uploadedAOILayer;
                            toggleUploaded.checked = !!uploadedAOILayer;
                            if (uploadedAOILayer && toggleUploaded.checked) {
                                map.addLayer(uploadedAOILayer);
                            } else if (uploadedAOILayer && !toggleUploaded.checked) {
                                map.removeLayer(uploadedAOILayer);
                            }
                        }
                    }).catch(function(err) {
                        console.error('shpjs error:', err);
                        alert('Invalid or unsupported shapefile ZIP. Please ensure your ZIP contains .shp, .shx, and .dbf files.');
                    });
                };
                reader.readAsArrayBuffer(file);
            } else if (ext === 'shp') {
                alert('Please upload a zipped shapefile (.zip) containing .shp, .shx, and .dbf files, or a valid GeoJSON/JSON file.');
            } else {
                alert('Unsupported file type. Please upload a valid GeoJSON, JSON, or zipped shapefile (.zip).');
            }
            // After successfully adding uploadedAOILayer:
            enableFetchButtonIfReady();
        });
    }

    var removeUploadBtn = document.getElementById('remove-upload-btn');
    if (removeUploadBtn) {
        removeUploadBtn.addEventListener('click', function () {
            if (uploadedAOILayer) {
                map.removeLayer(uploadedAOILayer);
                uploadedAOILayer = null;
            }
            uploadedAOICoords = null;
            uploadInput.value = '';
        });
    }
});