import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function Map({ routeCoords, poiList }) {
  return (
    <MapContainer center={[28.6139, 77.2090]} zoom={6} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {routeCoords.length > 0 && (
        <>
          <Polyline positions={routeCoords} color="blue" />
          <Marker position={routeCoords[0]}>
            <Popup>Start</Popup>
          </Marker>
          <Marker position={routeCoords[routeCoords.length - 1]}>
            <Popup>Destination</Popup>
          </Marker>
        </>
      )}

      {poiList.map((poi) => (
        <Marker key={poi.id} position={[poi.lat, poi.lon]}>
          <Popup>
            <strong>{poi.name}</strong><br />
            Type: {poi.type}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default Map;
