import { Cpu, Globe2, MapPin, MemoryStick, ShieldCheck } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export default function CatalogueView() {
  const { zones, toggleSubscription } = useAppState();
  return <div className="space-y-7">
    <div><p className="mb-2 text-sm font-semibold text-blue-700 dark:text-blue-300">OPERATOR CONSOLE</p><h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Edge zone catalogue</h1><p className="mt-2 text-sm text-slate-500">Review edge resources and manage federation zone subscriptions.</p></div>
    <div className="grid items-stretch gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {zones.map((zone) => <article key={zone.id} className={`flex h-full flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm dark:bg-slate-950 ${zone.local ? 'border-blue-300 dark:border-blue-800' : 'border-slate-200 dark:border-slate-800'}`}>
        <div>
          <div className="mb-5 flex items-start justify-between gap-3"><div><div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500"><MapPin size={14} aria-hidden="true" />{zone.region} <span aria-hidden="true">·</span> {zone.operatorPlatformName}</div><h2 className="text-lg font-semibold">{zone.name}</h2></div><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${zone.local ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300'}`}>{zone.local ? <ShieldCheck size={20} /> : <Globe2 size={20} />}</span></div>
          <div className="mb-5 flex items-center justify-between"><Badge status={zone.local ? 'LOCAL' : zone.subscribed ? 'ACTIVE' : 'PENDING'} /><span className="text-xs text-slate-500">{zone.lat.toFixed(2)}°, {zone.lon.toFixed(2)}°</span></div>
          <Resource icon={Cpu} label="vCPU Allocation" available={zone.availableVcpu} total={zone.totalVcpu} unit="vCPU" />
          <Resource icon={MemoryStick} label="Memory Allocation" available={zone.availableMemoryGb} total={zone.totalMemoryGb} unit="GB" />
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs dark:border-slate-800"><span className="text-slate-500">Latency SLA (Round-trip)</span><span className="font-semibold">{zone.latencyProfile.minMs} – {zone.latencyProfile.maxMs} ms</span></div>
        </div>
        <div className="mt-6">{zone.local
          ? <div className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300"><ShieldCheck size={14} aria-hidden="true" className="shrink-0 text-emerald-500" /><span>Published to Federated Partners (Local Master)</span></div>
          : <Button variant={zone.subscribed ? 'secondary' : 'primary'} className="w-full" onClick={() => toggleSubscription(zone.id)}>{zone.subscribed ? 'Unsubscribe from zone' : 'Subscribe to zone'}</Button>}</div>
      </article>)}
    </div>
  </div>;
}

function Resource({ icon: Icon, label, available, total, unit }) {
  const safeTotal = Math.max(0, total);
  const safeAvailable = Math.min(safeTotal, Math.max(0, available));
  const used = safeTotal - safeAvailable;
  const utilization = safeTotal > 0 ? (used / safeTotal) * 100 : 0;
  return <div className="mb-4">
    <div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="flex shrink-0 items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300"><Icon size={14} aria-hidden="true" />{label}</span><span className="text-right text-slate-500">{used} used / {safeTotal} total ({safeAvailable} available)</span></div>
    <div role="progressbar" aria-label={`${label} utilization`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={utilization} aria-valuetext={`${used} ${unit} used of ${safeTotal} ${unit}; ${safeAvailable} ${unit} available`} className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${utilization > 85 ? 'bg-amber-500' : 'bg-blue-600'}`} style={{ width: `${utilization}%` }} /></div>
  </div>;
}
