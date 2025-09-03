
# 🌍 GIS Web Application

An interactive **Geographic Information System (GIS) web app** for fetching and visualizing **OpenStreetMap (OSM) data** within a user-defined or uploaded **Area of Interest (AOI)**.  

This project lets you:
- Draw AOIs directly on the map.
- Upload AOIs as **GeoJSON** or **Shapefiles**.
- Fetch data from **OSM** using the **Overpass API**.
- Display and explore features like **roads, buildings, and shops**.
- Download results as **GeoJSON** for further GIS analysis.

---

## ✨ Features

 **Interactive Map** (Leaflet.js with OSM basemap)  
 **Draw AOI** using Leaflet Draw tools (polygon support).  
 **Upload AOI** as:
   - GeoJSON (`.geojson` or `.json`)
   - Shapefile (`.zip` containing `.shp`, `.shx`, `.dbf`)  
 **Fetch OSM Data** by category:
   - Roads
   - Buildings
   - Shops
   - All features  
 **GeoJSON Download** of fetched data.  
 **Layer Management Panel** to toggle visibility of AOI, uploaded AOI, and OSM layers.  
 **Collapsible UI Panels** for a clean user experience.  

---


## 📦 Dependencies

The app uses CDN-hosted libraries (no installation required):

* [Leaflet.js](https://leafletjs.com/) – Map rendering
* [Leaflet.draw](https://github.com/Leaflet/Leaflet.draw) – Drawing polygons
* [shpjs](https://github.com/calvinmetcalf/shapefile-js) – Reading shapefiles
* [osmtogeojson](https://github.com/tyrasd/osmtogeojson) – OSM → GeoJSON
* [Overpass API](https://overpass-api.de/) – Fetching OSM data

---

## 🔎 How It Works

1. **Select AOI**

   * Draw on the map using the polygon tool, OR
   * Upload a GeoJSON/Shapefile AOI.

2. **Choose Data Type**

   * Use the dropdown to select: *roads, buildings, shops, all*.

3. **Fetch Data**

   * Click **Fetch OSM Data** → data retrieved via **Overpass API**.

4. **Explore Results**

   * Features are styled by type.
   * Click on features for details.

5. **Download Data**

   * Save as **GeoJSON** for use in QGIS, ArcGIS, or other tools.

---




## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

## 🌟 Acknowledgements

* [OpenStreetMap](https://www.openstreetmap.org/) contributors
* [Leaflet](https://leafletjs.com/) for maps
* [Overpass API](https://overpass-api.de/) for OSM data

```

