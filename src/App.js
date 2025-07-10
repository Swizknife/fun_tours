import { useState } from "react";
import axios from "axios";
import Map from "./components/Map";

const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImExYThlYzM3YmNjNjRjMmZiMWFkMTkwNzYyZjYzZmUxIiwiaCI6Im11cm11cjY0In0=";

function App() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [routeCoords, setRouteCoords] = useState([]);
  const [category, setCategory] = useState("tourism");
  const [poiList, setPoiList] = useState([]);
  const [tripStats, setTripStats] = useState(null);

  const getCoordinates = async (place) => {
    const res = await axios.get(
      `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(place)}`
    );
    const coords = res.data.features[0].geometry.coordinates;
    return [coords[1], coords[0]];
  };

  const getRoute = async () => {
    try {
      const startCoords = await getCoordinates(start);
      const endCoords = await getCoordinates(end);

      const body = {
        coordinates: [
          [startCoords[1], startCoords[0]],
          [endCoords[1], endCoords[0]],
        ],
      };

      const res = await axios.post(
        `https://api.openrouteservice.org/v2/directions/driving-car/geojson`,
        body,
        {
          headers: {
            Authorization: ORS_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      const route = res.data.features[0];
      const coords = route.geometry.coordinates.map((c) => [c[1], c[0]]);
      setRouteCoords(coords);

      const distanceKm = route.properties.segments[0].distance / 1000;
      const durationMin = route.properties.segments[0].duration / 60;

      setTripStats({
        drivingTime: durationMin.toFixed(0),
        distance: distanceKm.toFixed(1),
        stopCount: 0,
        stopTime: 0,
        totalTime: durationMin.toFixed(0),
      });

      getPOIs(coords);
    } catch (err) {
      console.error("Route error:", err);
      alert("Could not fetch route.");
    }
  };

  const getPOIs = async (coords) => {
    let minLat = coords[0][0], maxLat = coords[0][0];
    let minLng = coords[0][1], maxLng = coords[0][1];

    coords.forEach(([lat, lng]) => {
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    });

    const query = `
      [out:json][timeout:25];
      (
        node["${category}"](${minLat},${minLng},${maxLat},${maxLng});
      );
      out body;
    `;

    try {
      const res = await axios.post(
        "https://overpass-api.de/api/interpreter",
        query,
        { headers: { "Content-Type": "text/plain" } }
      );

      const pois = res.data.elements.map((el) => ({
        id: el.id,
        lat: el.lat,
        lon: el.lon,
        name: el.tags?.name || "Unnamed",
        type: el.tags?.[category] || "POI",
      }));

      const maxDistance = 0.05;
      const closePOIs = pois.filter((poi) =>
        coords.some(([lat, lng]) => {
          const dLat = lat - poi.lat;
          const dLng = lng - poi.lon;
          const distance = Math.sqrt(dLat * dLat + dLng * dLng);
          return distance < maxDistance;
        })
      );

      const topPOIs = closePOIs.slice(0, 5);

      const enrichedPOIs = await Promise.all(
        topPOIs.map(async (poi) => {
          try {
            const response = await axios.post("http://localhost:5000/predict", {
              distance: 0.02,
              type: poi.type,
              category: category,
            });
            return { ...poi, predictedTime: response.data.predicted_minutes };
          } catch (e) {
            console.error("Prediction failed:", e);
            return { ...poi, predictedTime: 30 };
          }
        })
      );

      setPoiList(enrichedPOIs);

      const totalStopTime = enrichedPOIs.reduce((sum, poi) => sum + poi.predictedTime, 0);
      setTripStats((prev) => ({
        ...prev,
        stopCount: enrichedPOIs.length,
        stopTime: totalStopTime,
        totalTime: (parseFloat(prev.drivingTime) + totalStopTime).toFixed(0),
      }));
    } catch (err) {
      console.error("POI fetch failed:", err);
      alert("Could not fetch points of interest.");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Sightseeing Route Planner</h1>
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Start location"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          style={{ marginRight: "0.5rem" }}
        />
        <input
          type="text"
          placeholder="Destination"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          style={{ marginRight: "0.5rem" }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ marginRight: "0.5rem" }}
        >
          <option value="tourism">Tourism</option>
          <option value="amenity">Restaurants</option>
          <option value="historic">Historic</option>
          <option value="leisure">Parks</option>
          <option value="shop">Shops</option>
        </select>
        <button onClick={getRoute}>Search Route & POIs</button>
      </div>

      {tripStats && (
        <div style={{ marginTop: "1rem", background: "#f5f5f5", padding: "1rem", borderRadius: "8px" }}>
          <h3>Trip Summary</h3>
          <p><strong>Distance:</strong> {tripStats.distance} km</p>
          <p><strong>Driving Time:</strong> {tripStats.drivingTime} min</p>
          <p><strong>Stops:</strong> {tripStats.stopCount} POIs</p>
          <p><strong>Stop Time:</strong> {tripStats.stopTime} min</p>
          <p><strong>Total Trip Time:</strong> {tripStats.totalTime} min</p>
        </div>
      )}

      {poiList.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Estimated Stop Times:</h3>
          <ul>
            {poiList.map((poi) => (
              <li key={poi.id}>
                {poi.name} ({poi.type}) — ⏱ {poi.predictedTime} min
              </li>
            ))}
          </ul>
        </div>
      )}

      <Map routeCoords={routeCoords} poiList={poiList} />
    </div>
  );
}

export default App;
