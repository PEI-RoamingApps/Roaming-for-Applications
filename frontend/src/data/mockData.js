export const initialZones = [
  { id: 'pt-aveiro-edge-01', name: 'Aveiro Edge 01', city: 'Aveiro', region: 'Portugal', country: 'PT', lat: 40.6405, lon: -8.6538, availableVcpu: 20, totalVcpu: 32, availableMemoryGb: 64, totalMemoryGb: 128, latencyProfile: { minMs: 5, maxMs: 8 }, operatorPlatformName: 'Local Platform (Operator A)', local: true, subscribed: true },
  { id: 'es-madrid-edge-01', name: 'Madrid Central Edge', city: 'Madrid', region: 'Spain', country: 'ES', lat: 40.4168, lon: -3.7038, availableVcpu: 83, totalVcpu: 128, availableMemoryGb: 392, totalMemoryGb: 512, latencyProfile: { minMs: 12, maxMs: 18 }, operatorPlatformName: 'Operator B (Telefónica Edge)', local: false, subscribed: true, operatorId: 'operator-b' },
  { id: 'fr-paris-edge-01', name: 'Paris Edge Core', city: 'Paris', region: 'France', country: 'FR', lat: 48.8566, lon: 2.3522, availableVcpu: 46, totalVcpu: 256, availableMemoryGb: 224, totalMemoryGb: 1024, latencyProfile: { minMs: 15, maxMs: 25 }, operatorPlatformName: 'Operator C (Orange Edge)', local: false, subscribed: true, operatorId: 'operator-c' },
];
export const initialFederations = [
  { id: 'fed-es-01', name: 'Iberia Edge Network', region: 'Spain', mcc: '214', mnc: '07', endpoint: 'https://api.iberia-edge.es/ewbi/v1', status: 'ACTIVE', expiresAt: '2027-12-31T23:59:59Z', operatorId: 'operator-b' },
  { id: 'fed-fr-01', name: 'Francilien Cloud Core', region: 'France', mcc: '208', mnc: '01', endpoint: 'https://federation.francloud.fr/ewbi/v1', status: 'ACTIVE', expiresAt: '2027-10-15T00:00:00Z', operatorId: 'operator-c' },
];
export const initialApplications = [];
