import { MapContainer, TileLayer, Polyline, Marker, Tooltip, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import type { LatLon, Route, Ford } from '../data';

export const ROAD_COLOR = '#336880';
export const F_COLOR = '#c2562b';

export interface MapMarker { coords: LatLon; label: string; title: string; kind?: 'night' | 'stop' | 'poi'; onClick?: () => void }

function numberIcon(label: string, kind: MapMarker['kind']) {
  const bg = kind === 'night' ? '#17191b' : kind === 'poi' ? '#ffffff' : '#41819a';
  const fg = kind === 'poi' ? '#17191b' : '#ffffff';
  const size = kind === 'poi' ? 22 : 28;
  const w = label.length > 2 ? size + 12 : size;
  return L.divIcon({
    className: '',
    iconSize: [w, size],
    iconAnchor: [w / 2, size / 2],
    html: `<div style="width:${w}px;height:${size}px;border-radius:999px;background:${bg};color:${fg};display:flex;align-items:center;justify-content:center;font:600 ${kind === 'poi' ? 10 : 12}px Inter,sans-serif;box-shadow:0 1px 4px rgba(0,0,0,.35);border:2px solid #fff">${label}</div>`,
  });
}

function Fit({ points }: { points: LatLon[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length) map.fitBounds(L.latLngBounds(points), { padding: [28, 28] });
  }, [map, JSON.stringify(points.length ? [points[0], points[points.length - 1], points.length] : [])]);
  return null;
}

export default function TripMap({ routes, markers, fords = [], height = 480, onRouteClick }: {
  routes: { id: string | number; route: Route; dim?: boolean }[];
  markers: MapMarker[];
  fords?: Ford[];
  height?: number | string;
  onRouteClick?: (id: string | number) => void;
}) {
  const all: LatLon[] = [...routes.flatMap((r) => r.route.segments.flatMap((s) => s.coords)), ...markers.map((m) => m.coords)];
  return (
    <MapContainer center={[64.9, -18.6]} zoom={6} scrollWheelZoom={false} style={{ height, width: '100%' }} className="rounded-2xl">
      <TileLayer attribution='&copy; contributeurs <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {routes.map((r) =>
        r.route.segments.map((s, i) => (
          <Polyline
            key={`${r.id}-${i}`}
            positions={s.coords}
            pathOptions={{ color: s.isF ? F_COLOR : ROAD_COLOR, weight: r.dim ? 3 : 4.5, opacity: r.dim ? 0.45 : 0.95, dashArray: s.isF ? '8 6' : undefined }}
            eventHandlers={onRouteClick ? { click: () => onRouteClick(r.id) } : undefined}
          />
        )),
      )}
      {fords.map((f) => (
        <CircleMarker key={f.osmId} center={f.coords} radius={6} pathOptions={{ color: '#fff', weight: 2, fillColor: '#1d4ed8', fillOpacity: 1 }}>
          <Popup>
            <strong>Gué cartographié (OSM)</strong><br />
            km ≈ {f.alongKm} du trajet<br />
            {f.tags.name && <>Nom : {f.tags.name}<br /></>}
            <a href={`https://www.openstreetmap.org/${f.osmId}`} target="_blank" rel="noreferrer">{f.osmId}</a><br />
            <em>Difficulté non documentée</em>
          </Popup>
        </CircleMarker>
      ))}
      {markers.map((m, i) => (
        <Marker key={i} position={m.coords} icon={numberIcon(m.label, m.kind)} eventHandlers={m.onClick ? { click: m.onClick } : undefined}>
          <Tooltip direction="top" offset={[0, -12]}>{m.title}</Tooltip>
        </Marker>
      ))}
      <Fit points={all} />
    </MapContainer>
  );
}
