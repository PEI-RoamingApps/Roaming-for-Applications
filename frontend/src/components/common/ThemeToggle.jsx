import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
export default function ThemeToggle() { const { theme, toggleTheme } = useTheme(); return <button onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-300 dark:hover:bg-slate-800">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>; }
