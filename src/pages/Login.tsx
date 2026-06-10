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

    if (rawMessage.includes('password') && rawMessage.includes('short')) {
      return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
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

    if (!storedCooldownUntil) {
      return;
    }

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

    if (!trimmedValue) {
      return 'Debes ingresar tu nombre y apellido completos.';
    }

    if (nameParts.length < 2) {
      return 'Ingresa nombre y apellido completos, separados por un espacio.';
    }

    if (nameParts.some((part) => part.length < 2)) {
      return 'Cada parte del nombre debe tener al menos 2 caracteres.';
    }

    return '';
  };

  const validateEmail = (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return 'Debes ingresar tu correo electrónico.';
    }

    if (!EMAIL_REGEX.test(trimmedValue)) {
      return 'Ingresa un correo electrónico válido, por ejemplo usuario@correo.com.';
    }

    return '';
  };

  const validatePassword = (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return isRegistering ? 'Debes ingresar una contraseña.' : 'Debes ingresar tu contraseña.';
    }

    if (isRegistering) {
      if (trimmedValue.length < MIN_PASSWORD_LENGTH) {
        return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
      }

      if (!/[A-Z]/.test(trimmedValue)) {
        return 'La contraseña debe incluir al menos una letra mayúscula.';
      }

      if (!/[a-z]/.test(trimmedValue)) {
        return 'La contraseña debe incluir al menos una letra minúscula.';
      }

      if (!/[0-9]/.test(trimmedValue)) {
        return 'La contraseña debe incluir al menos un número.';
      }
    }

    return '';
  };

  const clearFieldErrorIfValid = (field: keyof AuthErrors, message: string) => {
    if (!message) {
      setErrors((currentErrors) => {
        if (!currentErrors[field]) {
          return currentErrors;
        }

        const nextErrors = { ...currentErrors };
        delete nextErrors[field];
        return nextErrors;
      });
    }
  };

  const validateForm = () => {
    const nextErrors: AuthErrors = {};

    if (isRegistering) {
      const nombreError = validateNombre(nombre);
      const emailError = validateEmail(email);
      const passwordError = validatePassword(password);

      if (nombreError) nextErrors.nombre = nombreError;
      if (emailError) nextErrors.email = emailError;
      if (passwordError) nextErrors.password = passwordError;
    } else {
      const emailError = validateEmail(email);
      const passwordError = validatePassword(password);

      if (emailError) nextErrors.email = emailError;
      if (passwordError) nextErrors.password = passwordError;
    }

    return nextErrors;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitLockRef.current || loading || cooldownActive) {
      return;
    }

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error('Revisa los campos marcados antes de continuar.');
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
          toast.error('No es posible crear la cuenta ahora para este correo. Espera unos minutos.');
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { nombre: nombre.trim() } },
        });
        if (error) throw error;

        try { window.localStorage.removeItem(blockedKey); } catch (_) {}
        try { window.localStorage.removeItem(SIGNUP_COOLDOWN_KEY); } catch (_) {}

        toast.success('Registro exitoso. Revisa tu email para confirmar.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;

        try { window.localStorage.removeItem(blockedKey); } catch (_) {}
        try { window.localStorage.removeItem(SIGNUP_COOLDOWN_KEY); } catch (_) {}

        toast.success('Inicio de sesión exitoso. Bienvenido/a.');
        setTimeout(() => navigate('/dashboard', { replace: true }), 800);
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Auth error raw:', err);

      if (err?.status === 429) {
        const cooldownUntil = Date.now() + SIGNUP_COOLDOWN_MS;
        try { window.localStorage.setItem(SIGNUP_COOLDOWN_KEY, String(cooldownUntil)); } catch (_) {}
        try { window.localStorage.setItem(blockedKey, String(cooldownUntil)); } catch (_) {}

        setCooldownActive(true);
        window.setTimeout(() => {
          setCooldownActive(false);
          try { window.localStorage.removeItem(SIGNUP_COOLDOWN_KEY); } catch (_) {}
          try { window.localStorage.removeItem(blockedKey); } catch (_) {}
        }, SIGNUP_COOLDOWN_MS);
      }

      const serverMsg = err?.message || err?.error_description || null;
      if (serverMsg) {
        toast.error(getAuthErrorMessage(err, isRegistering) + ' (' + serverMsg + ')');
      } else {
        toast.error(getAuthErrorMessage(err, isRegistering));
      }
    } finally {
      setLoading(false);
      submitLockRef.current = false;
    }
  };

  const inputBaseClass = 'w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100';
  const errorClass = 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100';

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-8 text-slate-900">
      <Toaster position="top-center" />
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="hidden overflow-hidden rounded-[2rem] bg-blue-700 p-8 text-white shadow-2xl lg:block">
          <div className="mb-10 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            Diseño centrado en el usuario
          </div>

          <h1 className="max-w-lg text-4xl font-black leading-tight tracking-tight">
            Gestiona tus pruebas de usabilidad con claridad y confianza.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-blue-100">
            El acceso se reorganizó para que el usuario entienda dónde está, qué debe hacer y cómo corregir errores antes de enviar el formulario.
          </p>

          <div className="mt-10 grid gap-4">
            {[
              ['Gestalt', 'Elementos agrupados, alineados y con proximidad visual.'],
              ['Jerarquía visual', 'Título, instrucciones, campos y acción principal ordenados por importancia.'],
              ['Prevención de errores', 'Validación inmediata, requisitos visibles y bloqueo de doble envío.'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur">
                <p className="font-bold">{title}</p>
                <p className="mt-1 text-sm leading-6 text-blue-100">{description}</p>
              </div>
            ))}
          </div>
        </aside>

        <section className="mx-auto w-full max-w-md">
          <div className="mb-5 flex items-center justify-center gap-2 text-sm font-semibold text-blue-700 lg:justify-start">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">IHC</span>
            <span>IHC Testing Tool</span>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-2xl backdrop-blur sm:p-8">
            <div className="mb-7">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                {isRegistering ? 'Crear cuenta' : 'Inicio de sesión'}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                {isRegistering ? 'Únete al panel' : 'Bienvenido/a de nuevo'}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {isRegistering
                  ? 'Completa tus datos para acceder al sistema de pruebas de usabilidad.'
                  : 'Ingresa tus credenciales para continuar al dashboard del proyecto.'}
              </p>
            </div>

            <nav aria-label="Navegación contextual del acceso" className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1 text-sm font-bold">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setErrors({});
                  setShowPassword(false);
                }}
                className={`rounded-xl px-3 py-2 transition-all ${!isRegistering ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Ingresar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(true);
                  setErrors({});
                  setShowPassword(false);
                }}
                className={`rounded-xl px-3 py-2 transition-all ${isRegistering ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Registrarse
              </button>
            </nav>

            {hasAnyError && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                Hay campos que necesitan corrección. Revisa los mensajes debajo de cada entrada.
              </div>
            )}

            <form onSubmit={handleAuth} noValidate className="space-y-4">
              {isRegistering && (
                <div className="rounded-2xl bg-slate-50 p-3">
                  <label htmlFor="nombre" className="block text-sm font-bold text-slate-700">Nombre y apellido</label>
                  <input
                    id="nombre"
                    type="text"
                    required
                    autoComplete="name"
                    aria-invalid={Boolean(errors.nombre)}
                    aria-describedby={errors.nombre ? 'nombre-error' : 'nombre-help'}
                    className={`${inputBaseClass} mt-2 ${errors.nombre ? errorClass : 'border-slate-200'}`}
                    value={nombre}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      setNombre(nextValue);
                      clearFieldErrorIfValid('nombre', validateNombre(nextValue));
                    }}
                    placeholder="Ej. Gisselle Pérez"
                  />
                  <p id="nombre-help" className="mt-2 text-xs text-slate-500">Usa nombre y apellido para identificar tu participación.</p>
                  {errors.nombre && <p id="nombre-error" className="mt-2 text-sm font-semibold text-red-600">{errors.nombre}</p>}
                </div>
              )}

              <div className="rounded-2xl bg-slate-50 p-3">
                <label htmlFor="email" className="block text-sm font-bold text-slate-700">Correo electrónico</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : 'email-help'}
                  className={`${inputBaseClass} mt-2 ${errors.email ? errorClass : 'border-slate-200'}`}
                  value={email}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    setEmail(nextValue);
                    clearFieldErrorIfValid('email', validateEmail(nextValue));
                  }}
                  placeholder="tu@email.com"
                />
                <p id="email-help" className="mt-2 text-xs text-slate-500">
                  {trimmedEmail && EMAIL_REGEX.test(trimmedEmail) ? 'Formato correcto.' : 'Ejemplo: usuario@correo.com'}
                </p>
                {errors.email && <p id="email-error" className="mt-2 text-sm font-semibold text-red-600">{errors.email}</p>}
              </div>

              <div className="rounded-2xl bg-slate-50 p-3">
                <label htmlFor="password" className="block text-sm font-bold text-slate-700">Contraseña</label>
                <div className="relative mt-2">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete={isRegistering ? 'new-password' : 'current-password'}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'password-error' : isRegistering ? 'password-rules' : 'password-help'}
                    className={`${inputBaseClass} pr-12 ${errors.password ? errorClass : 'border-slate-200'}`}
                    value={password}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      setPassword(nextValue);
                      clearFieldErrorIfValid('password', validatePassword(nextValue));
                    }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 transition-colors hover:text-blue-700"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                        <path d="M3 3l18 18" />
                        <path d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58" />
                        <path d="M9.88 5.09A10.94 10.94 0 0112 5c5.52 0 9.5 5 10.5 7a20.29 20.29 0 01-4.04 5.38" />
                        <path d="M6.1 6.1C3.69 7.68 2 10 1.5 12c1 2 4.98 7 10.5 7a11.4 11.4 0 004.3-.83" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {!isRegistering && <p id="password-help" className="mt-2 text-xs text-slate-500">Puedes mostrar la contraseña para evitar errores de escritura.</p>}

                {isRegistering && (
                  <div id="password-rules" className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                    <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-600">
                      <span>Seguridad de contraseña</span>
                      <span>{completedRequirements}/4</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${(completedRequirements / passwordRequirements.length) * 100}%` }} />
                    </div>
                    <ul className="mt-3 grid gap-1 text-xs text-slate-600">
                      {passwordRequirements.map((item) => (
                        <li key={item.label} className="flex items-center gap-2">
                          <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${item.isValid ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                            {item.isValid ? '✓' : '•'}
                          </span>
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {errors.password && <p id="password-error" className="mt-2 text-sm font-semibold text-red-600">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading || cooldownActive}
                className="w-full rounded-2xl bg-blue-600 py-3.5 text-base font-black text-white shadow-xl shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="mr-3 h-5 w-5 animate-spin text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </span>
                ) : cooldownActive ? 'Espera un momento' : isRegistering ? 'Crear cuenta segura' : 'Entrar al dashboard'}
              </button>
            </form>

            <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-center text-sm text-blue-800">
              {isRegistering ? '¿Ya tienes una cuenta?' : '¿Primera vez en la plataforma?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setErrors({});
                  setShowPassword(false);
                }}
                className="font-black underline decoration-2 underline-offset-4 hover:text-blue-950"
              >
                {isRegistering ? 'Inicia sesión aquí' : 'Crea tu cuenta aquí'}
              </button>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}