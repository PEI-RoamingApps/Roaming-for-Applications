import { initialApplications, initialFederations, initialZones } from '../data/mockData';
import { decidePlacement } from './decisionEngine';

let zones = structuredClone(initialZones);
let federations = structuredClone(initialFederations);
let applications = structuredClone(initialApplications);
let auditLogs = [];
const DEMO_ACCOUNTS = [
  { email: 'sofia@example.com', password: 'demo123', user: { id: 'sofia', name: 'Sofia Martins', email: 'sofia@example.com', role: 'Application Developer', initials: 'SM' } },
  { email: 'lau@example.com', password: 'demo123', user: { id: 'lau', name: 'Lau Silva', email: 'lau@example.com', role: 'Operator Administrator', initials: 'LS' } },
];
let registeredAccounts = readStored('roaming-accounts', []);
let applicationProviders = readStored('roaming-application-providers', []);
let platforms = readStored('roaming-platforms', []);
let operatorProfiles = readStored('roaming-operator-profiles', []);
const delay = () => new Promise((resolve) => setTimeout(resolve, 50 + Math.floor(Math.random() * 151)));
const copy = (value) => structuredClone(value);
function readStored(key, fallback) { try { const value = JSON.parse(localStorage.getItem(key) || 'null'); return Array.isArray(value) ? value : fallback; } catch { return fallback; } }
function store(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
const publicDeployment = (deployment) => ({ id: deployment.id, name: deployment.name, image: deployment.image, status: deployment.status, endpoint: deployment.endpoint, location: deployment.location, createdAt: deployment.createdAt, rationale: deployment.rationale });

export async function authenticate(email, password) {
  await delay();
  const normalizedEmail = email.trim().toLowerCase();
  const account = [...DEMO_ACCOUNTS, ...registeredAccounts].find((item) => item.email.toLowerCase() === normalizedEmail && item.password === password);
  if (!account) throw new Error('Invalid email or password.');
  return copy(account.user);
}

export async function registerDeveloper(data) {
  await delay();
  const email = data.email.trim().toLowerCase();
  assertUniqueEmail(email);
  const provider = { id: `isv-${slug(data.organization).replace(/-labs$/, '')}-${randomSuffix()}`, fullName: data.fullName.trim(), organization: data.organization.trim(), email, createdAt: new Date().toISOString() };
  const user = { id: `user-${crypto.randomUUID()}`, name: provider.fullName, email, role: 'Application Developer', initials: initials(provider.fullName), appProviderId: provider.id, organization: provider.organization };
  const account = { email, password: data.password, user };
  applicationProviders = [provider, ...applicationProviders];
  registeredAccounts = [account, ...registeredAccounts];
  store('roaming-application-providers', applicationProviders);
  store('roaming-accounts', registeredAccounts);
  return copy({ user, provider });
}

export async function registerOperator(data) {
  await delay();
  const email = data.email.trim().toLowerCase();
  assertUniqueEmail(email);
  const platform = { id: `platform-${slug(data.platformName)}-${randomSuffix()}`, name: data.platformName.trim(), mcc: data.mcc, mnc: data.mnc, ewbiEndpoint: data.ewbiEndpoint.trim(), createdAt: new Date().toISOString() };
  const displayName = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  const profile = { id: `admin-${crypto.randomUUID()}`, platformId: platform.id, email, name: displayName };
  const user = { id: `user-${crypto.randomUUID()}`, name: displayName, email, role: 'Operator Administrator', initials: initials(displayName), platformId: platform.id, platformName: platform.name };
  registeredAccounts = [{ email, password: data.password, user }, ...registeredAccounts];
  platforms = [platform, ...platforms];
  operatorProfiles = [profile, ...operatorProfiles];
  store('roaming-accounts', registeredAccounts);
  store('roaming-platforms', platforms);
  store('roaming-operator-profiles', operatorProfiles);
  return copy({ user, platform, profile });
}

export async function fetchApplicationProvider(providerId) { await delay(); return copy(applicationProviders.find((provider) => provider.id === providerId) || null); }
export async function fetchPlatform(platformId) { await delay(); return copy(platforms.find((platform) => platform.id === platformId) || null); }
export async function fetchOperatorProfile(platformId) { await delay(); return copy(operatorProfiles.find((profile) => profile.platformId === platformId) || null); }
function assertUniqueEmail(email) { if ([...DEMO_ACCOUNTS, ...registeredAccounts].some((account) => account.email.toLowerCase() === email)) throw new Error('An account with this email already exists.'); }
function randomSuffix() { return String(100 + Math.floor(Math.random() * 900)); }
function initials(name) { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('') || 'U'; }

export async function fetchApplications() { await delay(); return applications.map(publicDeployment); }
export async function deployApplication(descriptor) {
  await delay();
  const placement = decidePlacement(descriptor, zones);
  const id = `app-${crypto.randomUUID()}`;
  const app = { id, name: descriptor.name, image: descriptor.image, status: placement.zone ? 'RUNNING' : 'FAILED', endpoint: placement.zone ? `https://${slug(descriptor.name)}.edge.roaming.app` : '', location: placement.zone?.city || 'Unavailable', createdAt: new Date().toISOString(), rationale: placement.rationale, zoneId: placement.zone?.id || null, partnerOperatorId: placement.zone?.operatorId || null, federationContextId: placement.zone?.local ? null : `ctx-${crypto.randomUUID()}`, topology: placement.zone ? `${placement.zone.id}/cluster-01` : null };
  applications = [app, ...applications];
  auditLogs = [{ id: `audit-${crypto.randomUUID()}`, timestamp: app.createdAt, application: app.name, decision: placement.decision, rationale: placement.rationale, target: `${descriptor.lat}, ${descriptor.lon}`, zone: placement.zone?.name || 'None', operatorId: placement.zone?.operatorId || 'operator-a', federationContextId: app.federationContextId }, ...auditLogs];
  return publicDeployment(app);
}
export async function terminateApplication(id) { await delay(); applications = applications.filter((app) => app.id !== id); return { id, status: 'TERMINATED' }; }
export async function fetchZones() { await delay(); return copy(zones); }
export async function toggleZoneSubscription(zoneId) { await delay(); zones = zones.map((zone) => zone.id === zoneId ? { ...zone, subscribed: !zone.subscribed } : zone); return copy(zones); }
export async function fetchFederations() { await delay(); return copy(federations); }
export async function fetchAuditLogs() { await delay(); return copy(auditLogs); }
export async function onboardPartner(data) { await delay(); const peer = { ...data, id: `fed-${crypto.randomUUID()}`, status: 'ACTIVE', expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(), operatorId: `operator-${crypto.randomUUID()}` }; federations = [peer, ...federations]; return copy(peer); }
export async function renewFederation(contextId) { await delay(); federations = federations.map((peer) => peer.id === contextId ? { ...peer, expiresAt: new Date(Date.now() + 365 * 86400000).toISOString() } : peer); return copy(federations); }
const slug = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
