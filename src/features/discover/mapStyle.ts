/**
 * The map's night styling.
 *
 * Not decoration. This screen is used at 1am inside a dark app, and a default
 * Google map is a white rectangle — a flashbang in a bar. The palette is the
 * app's own: `bg/canvas` for land, `surface/*` for roads, water pushed toward
 * the brand blue so the city reads at a glance without competing with the pins.
 */
export const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0B0D13' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6B7280' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#06070B' }] },

  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#8A94A6' }] },

  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  // Bars and clubs are the one POI class this app is about, but they come from
  // our own provider as pins — the basemap's version would double them.
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#101720' }] },

  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#151A24' }] },
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#1C2230' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#262E3D' }] },

  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0A1526' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3B82F6' }] },
];
