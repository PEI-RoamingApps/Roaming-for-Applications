import { useRef, useState } from 'react';
import { ArrowUpRight, Box, LoaderCircle, Plus, Trash2 } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import EdgeEuropeMap from '../components/map/EdgeEuropeMap';

const inputClass = 'mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900';

export default function DeveloperView() {
  const { applications, deploy, terminate } = useAppState();
  const formRef = useRef(null);
  const [form, setForm] = useState({ name: '', image: 'ghcr.io/roaming/edge-service:latest', slaMs: 25 });
  const [selected, setSelected] = useState({ city: 'Aveiro', country: 'PT', lat: 40.6405, lon: -8.6538 });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const deployFromButton = async (event) => {
    event.preventDefault();
    if (!formRef.current?.reportValidity() || busy) return;
    setBusy(true);
    setNotice('');
    try {
      const app = await deploy({ ...form, ...selected });
      setNotice(app.status === 'RUNNING' ? `Workload is running in ${app.location}. ${app.rationale}` : app.rationale);
      setForm((previous) => ({ ...previous, name: '' }));
    } catch {
      setNotice('Deployment could not be completed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return <div className="space-y-8">
    <div><p className="mb-2 text-sm font-semibold text-blue-700 dark:text-blue-300">PROVIDER ACCESS POINT</p><h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Deploy at the edge</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">Place workloads close to your users. The platform selects a suitable edge zone and keeps partner routing details private.</p></div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <form ref={formRef} noValidate onSubmit={(event) => event.preventDefault()} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 dark:border-slate-800 dark:bg-slate-950">
        <div><h2 className="font-semibold">New deployment</h2><p className="mt-1 text-xs text-slate-500">Configure the container and service level.</p></div>
        <label className="block text-sm font-medium">Workload name<input required maxLength={48} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. live-stream-api" className={inputClass} /></label>
        <label className="block text-sm font-medium">Container image<input required value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} className={`${inputClass} font-mono text-xs`} /></label>
        <div><label className="mb-2 block text-sm font-medium">Target location</label><EdgeEuropeMap selected={selected} onSelect={setSelected} /></div>
        <div><div className="mb-2 flex justify-between text-sm"><label htmlFor="sla">Maximum latency</label><span className="font-semibold text-blue-700 dark:text-blue-300">{form.slaMs} ms</span></div><input id="sla" type="range" min="5" max="100" step="1" value={form.slaMs} onChange={(event) => setForm({ ...form, slaMs: Number(event.target.value) })} className="w-full accent-blue-600" /><div className="flex justify-between text-[11px] text-slate-400"><span>5 ms</span><span>100 ms</span></div></div>
        <Button type="button" onClick={deployFromButton} disabled={busy} className="w-full">{busy ? <LoaderCircle className="animate-spin" size={17} /> : <Plus size={17} />}{busy ? 'Placing workload…' : 'Deploy workload'}</Button>
        {notice && <p role="status" className="rounded-lg bg-blue-50 p-3 text-sm leading-5 text-blue-900 dark:bg-blue-950 dark:text-blue-200">{notice}</p>}
      </form>
      <section className="min-w-0"><div className="mb-4 flex items-end justify-between"><div><h2 className="font-semibold">My applications</h2><p className="mt-1 text-xs text-slate-500">Deployment endpoints and current status.</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">{applications.length} total</span></div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">{applications.length ? <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-900"><tr>{['Workload', 'Status', 'Location', 'Endpoint', ''].map((heading) => <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{applications.map((app) => <tr key={app.id}><td className="px-4 py-4"><div className="flex items-center gap-2 font-semibold"><Box size={16} className="text-blue-600" />{app.name}</div><div className="mt-1 max-w-40 truncate pl-6 font-mono text-[10px] text-slate-400">{app.image}</div></td><td className="px-4 py-4"><Badge status={app.status} /></td><td className="px-4 py-4 text-slate-600 dark:text-slate-300">{app.location}</td><td className="px-4 py-4">{app.endpoint ? <a href={app.endpoint} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-xs text-blue-700 hover:underline dark:text-blue-300">Open endpoint<ArrowUpRight size={13} /></a> : '—'}</td><td className="px-4 py-4"><button type="button" aria-label={`Terminate ${app.name}`} onClick={() => terminate(app.id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-700 focus-visible:ring-2 focus-visible:ring-rose-500 dark:hover:bg-rose-950"><Trash2 size={16} /></button></td></tr>)}</tbody></table></div> : <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center"><span className="mb-3 grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-900"><Box size={20} /></span><p className="font-medium">No workloads yet</p><p className="mt-1 max-w-xs text-sm text-slate-500">Your deployments and service endpoints will appear here.</p></div>}</div>
      </section>
    </div>
  </div>;
}
