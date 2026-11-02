import { Globe2, Layers3, LogOut, Network, Server } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

const operatorNav = [{ id: 'federations', title: 'Federations', icon: Network }, { id: 'catalogue', title: 'Edge zones', icon: Globe2 }];
export default function Sidebar({ activeView, onNavigate }) {
  const { currentUser, logout } = useAppState();
  const isDeveloper = currentUser?.id === 'sofia';
  return <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
    <a href="#main" className="flex h-16 items-center gap-3 border-b border-slate-200 px-5 dark:border-slate-800"><span className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white"><Layers3 size={19} /></span><span className="font-semibold tracking-tight">Roaming for Apps</span></a>
    <div className="flex-1 p-4"><p className="px-3 pb-3 pt-2 text-[11px] font-bold uppercase tracking-[.14em] text-slate-400">{isDeveloper ? 'Developer portal' : 'Operator console'}</p><nav aria-label="Primary navigation" className="flex gap-1 lg:flex-col">
      {isDeveloper ? <button type="button" onClick={() => onNavigate('developer')} className={itemClass(activeView === 'developer')}><Server size={17} />My applications</button> : operatorNav.map(({ id, title, icon: Icon }) => <button type="button" key={id} onClick={() => onNavigate(id)} className={itemClass(activeView === id)}><Icon size={17} />{title}</button>)}
    </nav></div>
    <div className="flex items-center gap-3 border-t border-slate-200 p-4 dark:border-slate-800"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white" aria-hidden="true">{currentUser.initials}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{currentUser.name}</p><p className="truncate text-xs text-slate-500">{currentUser.role}</p></div><button type="button" onClick={logout} aria-label="Sign out" title="Sign out" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-slate-800 dark:hover:text-white"><LogOut size={17} /></button></div>
  </aside>;
}
function itemClass(active) { return `flex min-h-10 flex-1 items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition lg:flex-none ${active ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'}`; }
