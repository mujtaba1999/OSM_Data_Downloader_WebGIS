
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

✅ **Interactive Map** (Leaflet.js with OSM basemap)  
✅ **Draw AOI** using Leaflet Draw tools (polygon support).  
✅ **Upload AOI** as:
   - GeoJSON (`.geojson` or `.json`)
   - Shapefile (`.zip` containing `.shp`, `.shx`, `.dbf`)  
✅ **Fetch OSM Data** by category:
   - Roads
   - Buildings
   - Shops
   - All features  
✅ **GeoJSON Download** of fetched data.  
✅ **Layer Management Panel** to toggle visibility of AOI, uploaded AOI, and OSM layers.  
✅ **Collapsible UI Panels** for a clean user experience.  

---

## 🖼️ Screenshots

*(Add your own screenshots here for GitHub preview, e.g. `docs/screenshots/`)*  

Example placeholders:  

- Drawing AOI:  
  ![Draw AOI](docs/screenshots/draw_aoi.png)  

- Uploading AOI:  
  ![Upload AOI](docs/screenshots/upload_aoi.png)  

- Viewing fetched OSM data:  
  ![OSM Data](docs/screenshots/osm_data.png)  

---

## 📂 Project Structure

```

gis-web-app/
│
├── index.html              # Main entry point
├── scripts/
│   └── app.js              # Application logic (map, API, interactivity)
├── styles/
│   └── main.css            # App styling
├── docs/
│   └── screenshots/        # Place your screenshots here
├── .github/
│   ├── workflows/ci.yml    # GitHub Actions CI workflow
│   └── ISSUE\_TEMPLATE/     # Bug report template
├── LICENSE
├── README.md
├── CONTRIBUTING.md
├── CODE\_OF\_CONDUCT.md
├── SECURITY.md
├── CHANGELOG.md
└── Makefile                # Dev commands

````

---

## ⚙️ Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/gis-web-app.git
cd gis-web-app
````

### 2. Run Locally

Since this app is pure **HTML, CSS, JS**:

* Simply open `index.html` in your browser.
* No server or build tools are required.

*(Optional)* Run with a lightweight HTTP server (Python):

```bash
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

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

