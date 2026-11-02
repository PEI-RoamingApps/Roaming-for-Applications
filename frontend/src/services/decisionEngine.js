/** Chooses an eligible edge zone while keeping federation identifiers private. */
export function decidePlacement(descriptor, zones) {
  const local = zones.find((zone) => zone.id === 'pt-aveiro-edge-01');
  const targetCountry = descriptor.country || countryForCoordinates(descriptor.lat, descriptor.lon);
  const destination = targetCountry === 'ES' ? 'es-madrid-edge-01' : targetCountry === 'FR' ? 'fr-paris-edge-01' : null;
  const localUnavailable = !local || local.availableVcpu <= 0;
  const needsHandover = localUnavailable || Boolean(destination) || descriptor.slaMs < 10;
  if (!needsHandover && local) return { zone: local, decision: 'LOCAL', rationale: 'Local capacity is available and the requested service level can be met.' };
  const chosenId = destination || (descriptor.slaMs < 10 ? 'es-madrid-edge-01' : null);
  const zone = (chosenId && zones.find((item) => item.id === chosenId && item.subscribed)) || zones.find((item) => !item.local && item.subscribed);
  if (!zone) return { zone: null, decision: 'REJECTED', rationale: 'No subscribed partner zone is eligible for this placement.' };
  const reasons = [];
  if (localUnavailable) reasons.push('local capacity is exhausted');
  if (destination) reasons.push(`the target is in ${zone.region}`);
  if (descriptor.slaMs < 10) reasons.push('the requested latency SLA is below 10 ms');
  return { zone, decision: 'EWBI_HANDOVER', rationale: `EWBI handover selected ${zone.region} because ${reasons.join(' and ')}.` };
}
function countryForCoordinates(lat, lon) {
  if (lat > 45 && lon > -2) return 'FR';
  if (lat < 44 && lon > -10 && lon < 0) return 'ES';
  return 'PT';
}
