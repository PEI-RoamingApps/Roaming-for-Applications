import { useState } from 'react';
import { AlertCircle, ArrowRight, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import Button from '../components/common/Button';
import ThemeToggle from '../components/common/ThemeToggle';

const inputClass = 'mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white';
const accountTypes = [
  { id: 'developer', title: 'Developer account', icon: UserRound },
  { id: 'operator', title: 'Operator platform', icon: ShieldCheck },
];

export default function LoginView() {
  const { login, registerDeveloper, registerOperator } = useAppState();
  const [mode, setMode] = useState('signin');
  const [accountType, setAccountType] = useState('developer');
  const [values, setValues] = useState({ fullName: '', organization: '', platformName: '', mcc: '', mnc: '', ewbiEndpoint: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const setField = (field, value) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: '', form: '' }));
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!values.email.trim()) nextErrors.email = 'Enter your email address.';
    if (!values.password) nextErrors.password = 'Enter your password.';
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setBusy(true);
    try {
      await login(values.email, values.password);
    } catch {
      setErrors({ email: 'Check your email and password, then try again.' });
    } finally { setBusy(false); }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (accountType === 'developer') {
      if (!values.fullName.trim()) nextErrors.fullName = 'Enter your full name.';
      if (!values.organization.trim()) nextErrors.organization = 'Enter your organization.';
    } else {
      if (!values.platformName.trim()) nextErrors.platformName = 'Enter your operator platform name.';
      if (!/^\d{3}$/.test(values.mcc)) nextErrors.mcc = 'MCC must contain exactly 3 digits.';
      if (!/^\d{2,3}$/.test(values.mnc)) nextErrors.mnc = 'MNC must contain 2 or 3 digits.';
      if (!values.ewbiEndpoint.trim()) nextErrors.ewbiEndpoint = 'Enter the EWBI endpoint URL.';
      else if (!isValidUrl(values.ewbiEndpoint)) nextErrors.ewbiEndpoint = 'Enter a valid URL, including https://.';
    }
    if (!values.email.trim()) nextErrors.email = 'Enter an email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (values.password.length < 8) nextErrors.password = 'Use at least 8 characters for your password.';
    if (!values.confirmPassword) nextErrors.confirmPassword = 'Confirm your password.';
    else if (values.password !== values.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }

    setBusy(true);
    try {
      if (accountType === 'developer') {
        await registerDeveloper({ fullName: values.fullName, organization: values.organization, email: values.email, password: values.password });
      } else {
        await registerOperator({ platformName: values.platformName, mcc: values.mcc, mnc: values.mnc, ewbiEndpoint: values.ewbiEndpoint, email: values.email, password: values.password });
      }
    } catch (error) {
      const message = error.message?.includes('already exists') ? 'An account with this email already exists.' : 'We could not create your account. Check your details and try again.';
      setErrors({ email: message });
    } finally { setBusy(false); }
  };

  return <main className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-50 px-4 py-12 text-slate-900 dark:bg-[#080d17] dark:text-slate-100"><div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/70 via-slate-50 to-slate-50 dark:from-blue-950/50 dark:via-[#080d17] dark:to-[#080d17]" /><div className="absolute right-5 top-5"><ThemeToggle /></div><section className="relative w-full max-w-xl">
    <h1 className="mb-6 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 bg-clip-text text-center text-2xl font-bold tracking-tight text-transparent dark:from-blue-300 dark:via-indigo-300 dark:to-sky-300">Roaming for Applications</h1>
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-7 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20">
      <div role="group" aria-label="Authentication mode" className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-900"><button type="button" aria-pressed={mode === 'signin'} onClick={() => { setMode('signin'); setErrors({}); }} className={modeClass(mode === 'signin')}>Sign In</button><button type="button" aria-pressed={mode === 'register'} onClick={() => { setMode('register'); setErrors({}); }} className={modeClass(mode === 'register')}>Create Account</button></div>

      {mode === 'signin' ? <>
        <form onSubmit={handleSignIn} noValidate className="space-y-4">
          <TextField id="signin-email" label="Email address" type="email" autoComplete="username" value={values.email} onChange={(value) => setField('email', value)} error={errors.email} placeholder="you@example.com" icon={Mail} />
          <TextField id="signin-password" label="Password" type="password" autoComplete="current-password" value={values.password} onChange={(value) => setField('password', value)} error={errors.password} placeholder="Enter your password" icon={LockKeyhole} />
          {errors.form && <FormError>{errors.form}</FormError>}
          <Button type="submit" disabled={busy} className="w-full">{busy ? 'Signing in…' : 'Sign in'}<ArrowRight size={16} /></Button>
        </form>
      </> : <>
        <fieldset className="mb-5"><legend className="mb-2 text-sm font-semibold">Account type</legend><div className="grid gap-2 sm:grid-cols-2">{accountTypes.map(({ id, title, icon: Icon }) => <label key={id} htmlFor={`account-type-${id}`} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition focus-within:ring-2 focus-within:ring-blue-500 ${accountType === id ? 'border-blue-500 bg-blue-50/70 dark:border-blue-700 dark:bg-blue-950/40' : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'}`}><input id={`account-type-${id}`} type="radio" name="accountType" value={id} checked={accountType === id} onChange={() => { setAccountType(id); setErrors({}); }} className="size-4 accent-blue-600" /><Icon size={17} className="shrink-0 text-blue-700 dark:text-blue-300" /><span className="text-sm font-semibold">{title}</span></label>)}</div></fieldset>
        <form onSubmit={handleRegister} noValidate className="space-y-3.5">
          {accountType === 'developer' ? <>
            <TextField id="developer-full-name" label="Full name" autoComplete="name" value={values.fullName} onChange={(value) => setField('fullName', value)} error={errors.fullName} placeholder="Sofia Martins" />
            <TextField id="developer-organization" label="Organization" autoComplete="organization" value={values.organization} onChange={(value) => setField('organization', value)} error={errors.organization} placeholder="SkyVision Labs" />
          </> : <>
            <TextField id="operator-platform-name" label="Operator platform name" value={values.platformName} onChange={(value) => setField('platformName', value)} error={errors.platformName} placeholder="NOS Portugal" />
            <div className="grid grid-cols-2 gap-3"><TextField id="operator-mcc" label="Mobile Country Code (MCC)" inputMode="numeric" maxLength={3} value={values.mcc} onChange={(value) => setField('mcc', value.replace(/\D/g, '').slice(0, 3))} error={errors.mcc} placeholder="268" /><TextField id="operator-mnc" label="Mobile Network Code (MNC)" inputMode="numeric" maxLength={3} value={values.mnc} onChange={(value) => setField('mnc', value.replace(/\D/g, '').slice(0, 3))} error={errors.mnc} placeholder="03" /></div>
            <TextField id="operator-ewbi-endpoint" label="EWBI endpoint URL" type="url" value={values.ewbiEndpoint} onChange={(value) => setField('ewbiEndpoint', value)} error={errors.ewbiEndpoint} placeholder="https://ewbi.nos.pt/v1" />
          </>}
          <TextField id="register-email" label={accountType === 'developer' ? 'Developer email' : 'Admin email'} type="email" autoComplete="email" value={values.email} onChange={(value) => setField('email', value)} error={errors.email} placeholder="you@organization.com" />
          <TextField id="register-password" label="Password" type="password" autoComplete="new-password" value={values.password} onChange={(value) => setField('password', value)} error={errors.password} placeholder="At least 8 characters" />
          <TextField id="register-confirm-password" label="Confirm password" type="password" autoComplete="new-password" value={values.confirmPassword} onChange={(value) => setField('confirmPassword', value)} error={errors.confirmPassword} placeholder="Re-enter your password" />
          {errors.form && <FormError>{errors.form}</FormError>}
          <Button type="submit" disabled={busy} className="mt-1 w-full">{busy ? 'Creating account…' : 'Create account'}<ArrowRight size={16} /></Button>
        </form>
      </>}
    </div>
  </section></main>;
}

function TextField({ id, label, value, onChange, error, type = 'text', icon: Icon, ...inputProps }) {
  const errorId = `${id}-error`;
  return <div><label htmlFor={id} className="block text-sm font-medium">{label}</label><div className="relative">{Icon && <Icon size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}<input id={id} name={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className={`${inputClass} ${Icon ? 'pl-10' : ''}`} {...inputProps} /></div>{error && <FieldError id={errorId}>{error}</FieldError>}</div>;
}

function FieldError({ id, children }) { return <p id={id} aria-live="polite" className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-rose-700 dark:text-rose-300"><AlertCircle size={14} aria-hidden="true" className="mt-px shrink-0" /><span>{children}</span></p>; }
function FormError({ children }) { return <p role="alert" aria-live="polite" className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-800 dark:bg-rose-950 dark:text-rose-200"><AlertCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0" /><span>{children}</span></p>; }
function modeClass(active) { return `min-h-10 rounded-lg px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${active ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`; }
function isValidUrl(value) { try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:'; } catch { return false; } }
