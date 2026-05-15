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
  const [nombre, setNombre] = useState(''); // Para el registro inicial
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<AuthErrors>({});
  const [cooldownActive, setCooldownActive] = useState(false);
  const submitLockRef = useRef(false);
  const navigate = useNavigate();

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
      return 'Ingresa un correo electrónico válido.';
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
      return;
    }

    setLoading(true);
    submitLockRef.current = true;

    const emailKey = email.trim().toLowerCase();
    const blockedKey = `ihc-blocked-email-${emailKey}`;

    try {
      if (isRegistering) {
        // If this email is blocked from recent 429, avoid calling signup again
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

        // Clear any stored cooldowns for this email on success
        try { window.localStorage.removeItem(blockedKey); } catch (_) {}
        try { window.localStorage.removeItem(SIGNUP_COOLDOWN_KEY); } catch (_) {}

        toast.success('Registro exitoso. Revisa tu email para confirmar.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;

        try { window.localStorage.removeItem(blockedKey); } catch (_) {}
        try { window.localStorage.removeItem(SIGNUP_COOLDOWN_KEY); } catch (_) {}

        toast.success('Inicio de sesión exitoso.');
        setTimeout(() => navigate('/dashboard', { replace: true }), 800);
      }
    } catch (err: any) {
      // debug log
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Toaster position="top-center" />
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">IHC Testing Tool</h1>
          <p className="text-gray-500 mt-2">Ingresa para gestionar tus pruebas de usabilidad</p>
        </div>

        <form onSubmit={handleAuth} noValidate className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-sm font-semibold text-gray-700">Nombre y apellido</label>
              <input
                type="text"
                required
                autoComplete="name"
                className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={nombre}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setNombre(nextValue);
                  clearFieldErrorIfValid('nombre', validateNombre(nextValue));
                }}
                placeholder="Ej. Gisselle Pérez"
              />
              {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              required
              autoComplete="email"
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={email}
              onChange={(e) => {
                const nextValue = e.target.value;
                setEmail(nextValue);
                clearFieldErrorIfValid('email', validateEmail(nextValue));
              }}
              placeholder="tu@email.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Contraseña</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                className="w-full px-4 py-2 pr-11 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
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
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || cooldownActive}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </span>
            ) : cooldownActive ? 'Espera un momento' : isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrors({});
              setShowPassword(false);
            }}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}