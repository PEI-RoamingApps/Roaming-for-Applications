import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../services/mockApi';

const AppStateContext = createContext(null);
const demoUsers = {
  sofia: { id: 'sofia', name: 'Sofia Martins', email: 'sofia@example.com', role: 'Application Developer', initials: 'SM' },
  lau: { id: 'lau', name: 'Lau Silva', email: 'lau@example.com', role: 'Operator Administrator', initials: 'LS' },
};

function readSession() {
  try {
    const session = JSON.parse(localStorage.getItem('roaming-session') || 'null');
    if (session?.id === 'sofia' || session?.id === 'lau') return demoUsers[session.id];
    if (session?.id && ['Application Developer', 'Operator Administrator'].includes(session.role) && session.email) return session;
  } catch { /* An invalid local session is treated as signed out. */ }
  return null;
}

export function AppStateProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(readSession);
  const [applications, setApplications] = useState([]);
  const [applicationProvider, setApplicationProvider] = useState(null);
  const [zones, setZones] = useState([]);
  const [federations, setFederations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [platform, setPlatform] = useState(null);
  const [operatorProfile, setOperatorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (currentUser?.role === 'Application Developer') {
      const [apps, provider] = await Promise.all([
        api.fetchApplications(),
        currentUser.appProviderId ? api.fetchApplicationProvider(currentUser.appProviderId) : Promise.resolve(null),
      ]);
      setApplications(apps);
      setApplicationProvider(provider);
      setZones([]); setFederations([]); setAuditLogs([]); setPlatform(null); setOperatorProfile(null);
    } else if (currentUser?.role === 'Operator Administrator') {
      const operatorData = currentUser.platformId
        ? [api.fetchPlatform(currentUser.platformId), api.fetchOperatorProfile(currentUser.platformId)]
        : [Promise.resolve(null), Promise.resolve(null)];
      const [edgeZones, peers, logs, currentPlatform, profile] = await Promise.all([
        api.fetchZones(), api.fetchFederations(), api.fetchAuditLogs(), ...operatorData,
      ]);
      setZones(edgeZones); setFederations(peers); setAuditLogs(logs); setPlatform(currentPlatform); setOperatorProfile(profile);
      setApplications([]); setApplicationProvider(null);
    } else {
      setApplications([]); setApplicationProvider(null); setZones([]); setFederations([]); setAuditLogs([]); setPlatform(null); setOperatorProfile(null);
    }
  }, [currentUser]);

  useEffect(() => { Promise.resolve().then(refresh).finally(() => setLoading(false)); }, [refresh]);

  const commitLogin = useCallback((user) => {
    if (!user?.id || !user?.email || !['Application Developer', 'Operator Administrator'].includes(user.role)) throw new Error('Invalid account profile.');
    setCurrentUser(user);
    localStorage.setItem('roaming-session', JSON.stringify(user));
    return user;
  }, []);
  const login = useCallback(async (email, password) => commitLogin(await api.authenticate(email, password)), [commitLogin]);
  const registerDeveloper = useCallback(async (data) => {
    const result = await api.registerDeveloper(data);
    setApplicationProvider(result.provider);
    commitLogin(result.user);
    return result;
  }, [commitLogin]);
  const registerOperator = useCallback(async (data) => {
    const result = await api.registerOperator(data);
    setPlatform(result.platform);
    setOperatorProfile(result.profile);
    commitLogin(result.user);
    return result;
  }, [commitLogin]);
  const logout = useCallback(() => { setCurrentUser(null); localStorage.removeItem('roaming-session'); }, []);
  const deploy = useCallback(async (descriptor) => { const created = await api.deployApplication(descriptor); await refresh(); return created; }, [refresh]);
  const terminate = useCallback(async (id) => { await api.terminateApplication(id); setApplications((apps) => apps.filter((app) => app.id !== id)); }, []);
  const toggleSubscription = useCallback(async (id) => setZones(await api.toggleZoneSubscription(id)), []);
  const onboard = useCallback(async (data) => { await api.onboardPartner(data); await refresh(); }, [refresh]);
  const renew = useCallback(async (id) => { await api.renewFederation(id); await refresh(); }, [refresh]);

  const value = useMemo(() => ({
    currentUser, loading,
    ...(!currentUser ? { login, registerDeveloper, registerOperator } : { logout }),
    ...(currentUser?.role === 'Application Developer' ? { applications, applicationProvider, deploy, terminate } : {}),
    ...(currentUser?.role === 'Operator Administrator' ? { zones, federations, auditLogs, platform, operatorProfile, toggleSubscription, onboard, renew } : {}),
  }), [currentUser, login, logout, registerDeveloper, registerOperator, loading, applications, applicationProvider, deploy, terminate, zones, federations, auditLogs, platform, operatorProfile, toggleSubscription, onboard, renew]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export const useAppState = () => useContext(AppStateContext);
