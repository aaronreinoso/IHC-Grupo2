import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

type AuthErrors = {
  nombre?: string;
  email?: string;
  password?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const SIGNUP_COOLDOWN_KEY = 'ihc-login-signup-cooldown-until';
const SIGNUP_COOLDOWN_MS = 60_000;

const getAuthErrorMessage = (error: { message?: string; status?: number }, isRegistering: boolean) => {
  const rawMessage = (error.message || '').toLowerCase();

  if (error.status === 429 || rawMessage.includes('rate limit')) {
    return 'Demasiados intentos. Espera unos minutos antes de volver a intentarlo.';
  }

  if (isRegistering) {
    if (rawMessage.includes('already registered') || rawMessage.includes('user already exists')) {
      return 'Ese correo ya está registrado. Inicia sesión o usa otro correo.';
    }
    return 'No se pudo crear la cuenta. Revisa los datos e inténtalo de nuevo.';
  }

  if (rawMessage.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.';
  }

  return 'No se pudo iniciar sesión. Verifica tus credenciales e inténtalo de nuevo.';
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<AuthErrors>({});
  const [cooldownActive, setCooldownActive] = useState(false);
  const submitLockRef = useRef(false);
  const navigate = useNavigate();

  const trimmedEmail = email.trim();
  const passwordRequirements = [
    { label: `Mínimo ${MIN_PASSWORD_LENGTH} caracteres`, isValid: password.trim().length >= MIN_PASSWORD_LENGTH },
    { label: 'Una letra mayúscula', isValid: /[A-Z]/.test(password) },
    { label: 'Una letra minúscula', isValid: /[a-z]/.test(password) },
    { label: 'Un número', isValid: /[0-9]/.test(password) },
  ];
  const completedRequirements = passwordRequirements.filter((item) => item.isValid).length;
  const hasAnyError = Object.keys(errors).length > 0;

  useEffect(() => {
    const storedCooldownUntil = Number(window.localStorage.getItem(SIGNUP_COOLDOWN_KEY) || 0);
    if (!storedCooldownUntil) return;

    const remainingTime = storedCooldownUntil - Date.now();
    if (remainingTime <= 0) {
      window.localStorage.removeItem(SIGNUP_COOLDOWN_KEY);
      return;
    }

    setCooldownActive(true);
    const timeoutId = window.setTimeout(() => {
      setCooldownActive(false);
      window.localStorage.removeItem(SIGNUP_COOLDOWN_KEY);
    }, remainingTime);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const validateNombre = (value: string) => {
    const trimmedValue = value.trim();
    const nameParts = trimmedValue.split(/\s+/).filter(Boolean);
    if (!trimmedValue) return 'Debes ingresar tu nombre y apellido completos.';
    if (nameParts.length < 2) return 'Ingresa nombre y apellido completos, separados por un espacio.';
    return '';
  };

  const validateEmail = (value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return 'Debes ingresar tu correo electrónico.';
    if (!EMAIL_REGEX.test(trimmedValue)) return 'Ingresa un correo electrónico válido.';
    return '';
  };

  const validatePassword = (value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return isRegistering ? 'Debes ingresar una contraseña.' : 'Debes ingresar tu contraseña.';
    if (isRegistering) {
      if (trimmedValue.length < MIN_PASSWORD_LENGTH) return `Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`;
      if (!/[A-Z]/.test(trimmedValue) || !/[a-z]/.test(trimmedValue) || !/[0-9]/.test(trimmedValue)) {
        return 'La contraseña no cumple con los requisitos de seguridad.';
      }
    }
    return '';
  };

  const clearFieldErrorIfValid = (field: keyof AuthErrors, message: string) => {
    if (!message) {
      setErrors((curr) => {
        const next = { ...curr };
        delete next[field];
        return next;
      });
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLockRef.current || loading || cooldownActive) return;

    const nextErrors: AuthErrors = {};
    if (isRegistering) {
      const nErr = validateNombre(nombre); if (nErr) nextErrors.nombre = nErr;
    }
    const eErr = validateEmail(email); if (eErr) nextErrors.email = eErr;
    const pErr = validatePassword(password); if (pErr) nextErrors.password = pErr;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error('Revisa los campos marcados.');
      return;
    }

    setLoading(true);
    submitLockRef.current = true;
    const emailKey = email.trim().toLowerCase();
    const blockedKey = `ihc-blocked-email-${emailKey}`;

    try {
      if (isRegistering) {
        const blockedUntil = Number(window.localStorage.getItem(blockedKey) || 0);
        if (blockedUntil && blockedUntil > Date.now()) {
          toast.error('Espera unos minutos antes de intentar con este correo.');
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { nombre: nombre.trim() } },
        });
        if (error) throw error;
        toast.success('Registro exitoso. Revisa tu email.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        toast.success('¡Bienvenido/a!');
        setTimeout(() => navigate('/dashboard', { replace: true }), 800);
      }
    } catch (err: any) {
      if (err?.status === 429) {
        const until = Date.now() + SIGNUP_COOLDOWN_MS;
        window.localStorage.setItem(SIGNUP_COOLDOWN_KEY, String(until));
        window.localStorage.setItem(blockedKey, String(until));
        setCooldownActive(true);
      }
      toast.error(getAuthErrorMessage(err, isRegistering));
    } finally {
      setLoading(false);
      submitLockRef.current = false;
    }
  };

  const inputBase = 'w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100';
  const errorInput = 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100';

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-8">
      <Toaster position="top-center" />
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        
        {/* Panel Informativo (Jerarquía Visual) */}
        <aside className="hidden rounded-[2rem] bg-blue-700 p-10 text-white shadow-2xl lg:block">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            Diseño IHC aplicado
          </div>
          <h1 className="text-4xl font-black leading-tight">Gestiona tus pruebas con claridad y confianza.</h1>
          <p className="mt-5 text-blue-100">Acceso optimizado con leyes de Gestalt para una mejor experiencia de usuario.</p>
          <div className="mt-10 space-y-4">
            {['Gestalt', 'Jerarquía', 'Prevención'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <p className="font-bold">{item}</p>
                <p className="text-xs text-blue-100">Mejora la navegación y reduce la carga cognitiva.</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Formulario (Prevención de Errores y Diseño Emocional) */}
        <section className="mx-auto w-full max-w-md">
          <div className="mb-5 flex items-center gap-2 text-blue-700">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">IHC</span>
            <span className="font-bold">IHC Testing Tool</span>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-2xl backdrop-blur">
            <div className="mb-6">
              <h2 className="text-3xl font-black text-slate-950">{isRegistering ? 'Únete al panel' : 'Bienvenido/a de nuevo'}</h2>
              <p className="text-sm text-slate-500 mt-1">{isRegistering ? 'Crea tu cuenta segura.' : 'Ingresa tus credenciales.'}</p>
            </div>

            <nav className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1 text-sm font-bold">
              <button onClick={() => {setIsRegistering(false); setErrors({});}} className={`rounded-xl py-2 ${!isRegistering ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>Ingresar</button>
              <button onClick={() => {setIsRegistering(true); setErrors({});}} className={`rounded-xl py-2 ${isRegistering ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>Registrarse</button>
            </nav>

            {hasAnyError && <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-100">Revisa los campos en rojo.</div>}

            <form onSubmit={handleAuth} className="space-y-4">
              {isRegistering && (
                <div className="rounded-2xl bg-slate-50 p-3">
                  <label className="text-xs font-bold text-slate-700">Nombre y apellido</label>
                  <input value={nombre} onChange={(e) => {setNombre(e.target.value); clearFieldErrorIfValid('nombre', validateNombre(e.target.value))}} className={`${inputBase} mt-1 ${errors.nombre ? errorInput : 'border-slate-200'}`} placeholder="Gisselle Pérez" />
                  {errors.nombre && <p className="mt-1 text-xs font-bold text-red-600">{errors.nombre}</p>}
                </div>
              )}

              <div className="rounded-2xl bg-slate-50 p-3">
                <label className="text-xs font-bold text-slate-700">Correo electrónico</label>
                <input value={email} onChange={(e) => {setEmail(e.target.value); clearFieldErrorIfValid('email', validateEmail(e.target.value))}} className={`${inputBase} mt-1 ${errors.email ? errorInput : 'border-slate-200'}`} placeholder="tu@email.com" />
                {errors.email && <p className="mt-1 text-xs font-bold text-red-600">{errors.email}</p>}
              </div>

              <div className="rounded-2xl bg-slate-50 p-3">
                <label className="text-xs font-bold text-slate-700">Contraseña</label>
                <div className="relative mt-1">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => {setPassword(e.target.value); clearFieldErrorIfValid('password', validatePassword(e.target.value))}} className={`${inputBase} pr-12 ${errors.password ? errorInput : 'border-slate-200'}`} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-4 text-slate-400 hover:text-blue-600">
                    {showPassword ? '🐵' : '🙈'}
                  </button>
                </div>
                {isRegistering && (
                  <div className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-white p-3">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 transition-all" style={{ width: `${(completedRequirements / 4) * 100}%` }} />
                    </div>
                    <ul className="grid grid-cols-2 gap-1 text-[10px] text-slate-500">
                      {passwordRequirements.map((r) => (
                        <li key={r.label} className={r.isValid ? 'text-emerald-600 font-bold' : ''}>{r.isValid ? '✓' : '•'} {r.label}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {errors.password && <p className="mt-1 text-xs font-bold text-red-600">{errors.password}</p>}
              </div>

              <button disabled={loading || cooldownActive} className="w-full rounded-2xl bg-blue-600 py-4 font-black text-white shadow-xl shadow-blue-100 transition-all hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Procesando...' : isRegistering ? 'Crear cuenta segura' : 'Entrar al dashboard'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              <button onClick={() => setIsRegistering(!isRegistering)} className="font-black text-blue-600 underline underline-offset-4">
                {isRegistering ? 'Ya tengo cuenta' : 'Crear una cuenta nueva'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}