"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/firestore";
import { useRouter, usePathname } from "next/navigation";

// ── Session Timeouts ─────────────────────────────────────────────────────────
// 30 minutes of idle inactivity
export const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
// 4 hours maximum continuous session lifespan
export const MAX_SESSION_AGE_MS = 4 * 60 * 60 * 1000;
// Show warning dialog 2 minutes (120s) before logout
export const WARNING_BEFORE_TIMEOUT_MS = 2 * 60 * 1000;
// Check interval
const CHECK_INTERVAL_MS = 5 * 1000;
// Minimum interval between localStorage activity writes
const THROTTLE_ACTIVITY_MS = 3 * 1000;

// LocalStorage Keys
const STORAGE_LAST_ACTIVITY = "luteame_last_activity";
const STORAGE_SESSION_START = "luteame_session_start";
const STORAGE_SESSION_UID   = "luteame_session_uid";
const STORAGE_LOGOUT_EVENT  = "luteame_session_logout";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  logout: (reason?: "manual" | "inactivity" | "session_expired") => Promise<void>;
  recordActivity: () => void;
  stayLoggedIn: () => void;
  showInactivityWarning: boolean;
  countdownSeconds: number;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAdmin: false,
  logout: async () => {},
  recordActivity: () => {},
  stayLoggedIn: () => {},
  showInactivityWarning: false,
  countdownSeconds: 0,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]                             = useState<User | null>(null);
  const [loading, setLoading]                       = useState(true);
  const [isAdmin, setIsAdmin]                       = useState(false);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [countdownSeconds, setCountdownSeconds]     = useState(120);

  const router = useRouter();
  const pathname = usePathname();
  const lastWriteTimeRef = useRef<number>(0);
  const isLoggingOutRef  = useRef<boolean>(false);

  // ── Logout helper ──────────────────────────────────────────────────────────
  const logout = useCallback(
    async (reason: "manual" | "inactivity" | "session_expired" = "manual") => {
      if (isLoggingOutRef.current) return;
      isLoggingOutRef.current = true;

      try {
        localStorage.removeItem(STORAGE_LAST_ACTIVITY);
        localStorage.removeItem(STORAGE_SESSION_START);
        localStorage.removeItem(STORAGE_SESSION_UID);
        localStorage.setItem(STORAGE_LOGOUT_EVENT, Date.now().toString());

        setShowInactivityWarning(false);
        setUser(null);
        setIsAdmin(false);

        await signOut(auth);

        if (reason === "inactivity" || reason === "session_expired") {
          router.push(`/login?reason=${reason}`);
        }
      } catch (err) {
        console.error("Error signing out:", err);
      } finally {
        isLoggingOutRef.current = false;
      }
    },
    [router]
  );

  // ── Record User Activity ───────────────────────────────────────────────────
  const recordActivity = useCallback(() => {
    if (!user) return;
    const now = Date.now();
    if (now - lastWriteTimeRef.current < THROTTLE_ACTIVITY_MS) return;

    lastWriteTimeRef.current = now;
    localStorage.setItem(STORAGE_LAST_ACTIVITY, now.toString());

    if (showInactivityWarning) {
      setShowInactivityWarning(false);
    }
  }, [user, showInactivityWarning]);

  // ── Stay Logged In (from warning modal) ─────────────────────────────────────
  const stayLoggedIn = useCallback(() => {
    const now = Date.now();
    localStorage.setItem(STORAGE_LAST_ACTIVITY, now.toString());
    lastWriteTimeRef.current = now;
    setShowInactivityWarning(false);
  }, []);

  // ── Validate Session Timestamps ────────────────────────────────────────────
  const isSessionValid = useCallback((uid: string): { valid: boolean; reason?: "inactivity" | "session_expired" } => {
    const lastActivityStr = localStorage.getItem(STORAGE_LAST_ACTIVITY);
    const sessionStartStr = localStorage.getItem(STORAGE_SESSION_START);
    const storedUid       = localStorage.getItem(STORAGE_SESSION_UID);

    const now = Date.now();

    // If there are no timestamps or stored for a different user, start fresh if just logged in
    if (!lastActivityStr || !sessionStartStr || storedUid !== uid) {
      // If we don't have session markers recorded yet, initialize them
      return { valid: true };
    }

    const lastActivity = Number(lastActivityStr);
    const sessionStart = Number(sessionStartStr);

    if (isNaN(lastActivity) || isNaN(sessionStart)) {
      return { valid: false, reason: "inactivity" };
    }

    // Check inactivity timeout (e.g. 30 min)
    if (now - lastActivity > INACTIVITY_TIMEOUT_MS) {
      return { valid: false, reason: "inactivity" };
    }

    // Check absolute max session age (e.g. 4 hours)
    if (now - sessionStart > MAX_SESSION_AGE_MS) {
      return { valid: false, reason: "session_expired" };
    }

    return { valid: true };
  }, []);

  // ── 1. Listen to Firebase Auth state changes ───────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Validate if session is still valid (in case browser opened after hours)
        const validity = isSessionValid(firebaseUser.uid);
        if (!validity.valid) {
          console.warn(`[Luteame Auth] Sesión expirada por ${validity.reason}. Cerrando sesión automáticamente...`);
          await logout(validity.reason);
          setLoading(false);
          return;
        }

        // Initialize session timestamps if not present or new login
        const now = Date.now();
        if (!localStorage.getItem(STORAGE_LAST_ACTIVITY)) {
          localStorage.setItem(STORAGE_LAST_ACTIVITY, now.toString());
        }
        if (!localStorage.getItem(STORAGE_SESSION_START)) {
          localStorage.setItem(STORAGE_SESSION_START, now.toString());
        }
        localStorage.setItem(STORAGE_SESSION_UID, firebaseUser.uid);

        setUser(firebaseUser);

        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setIsAdmin(profile?.rol === "admin");
        } catch {
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem(STORAGE_LAST_ACTIVITY);
        localStorage.removeItem(STORAGE_SESSION_START);
        localStorage.removeItem(STORAGE_SESSION_UID);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [isSessionValid, logout]);

  // ── 2. Activity listeners on window ────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ];

    const handleUserActivity = () => {
      recordActivity();
    };

    events.forEach((eventName) => {
      window.addEventListener(eventName, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, handleUserActivity);
      });
    };
  }, [user, recordActivity]);

  // ── 3. Visibility Change & Focus Checker (tab switch / wake up) ────────────
  useEffect(() => {
    if (!user) return;

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        const validity = isSessionValid(user.uid);
        if (!validity.valid) {
          logout(validity.reason);
        } else {
          recordActivity();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
    };
  }, [user, isSessionValid, logout, recordActivity]);

  // ── 4. Multi-tab synchronization ───────────────────────────────────────────
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_LOGOUT_EVENT && user) {
        // Another tab logged out
        setUser(null);
        setIsAdmin(false);
        setShowInactivityWarning(false);
        signOut(auth);
      } else if (e.key === STORAGE_LAST_ACTIVITY && e.newValue) {
        // Another tab had activity
        if (showInactivityWarning) {
          setShowInactivityWarning(false);
        }
      }
    };

    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, [user, showInactivityWarning]);

  // ── 5. Periodic Timer (Checks idle time & manages warning modal) ───────────
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const lastActivityStr = localStorage.getItem(STORAGE_LAST_ACTIVITY);
      const sessionStartStr = localStorage.getItem(STORAGE_SESSION_START);

      const now = Date.now();
      const lastActivity = lastActivityStr ? Number(lastActivityStr) : now;
      const sessionStart = sessionStartStr ? Number(sessionStartStr) : now;

      const idleTime    = now - lastActivity;
      const sessionAge  = now - sessionStart;

      // Absolute max session reached
      if (sessionAge >= MAX_SESSION_AGE_MS) {
        logout("session_expired");
        return;
      }

      // Idle inactivity reached
      if (idleTime >= INACTIVITY_TIMEOUT_MS) {
        logout("inactivity");
        return;
      }

      // Warning threshold (last 2 minutes before inactivity logout)
      const warningThreshold = INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_TIMEOUT_MS;
      if (idleTime >= warningThreshold) {
        const remainingMs  = INACTIVITY_TIMEOUT_MS - idleTime;
        const remainingSec = Math.max(1, Math.round(remainingMs / 1000));
        setCountdownSeconds(remainingSec);
        setShowInactivityWarning(true);
      } else {
        if (showInactivityWarning) {
          setShowInactivityWarning(false);
        }
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [user, logout, showInactivityWarning]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        logout,
        recordActivity,
        stayLoggedIn,
        showInactivityWarning,
        countdownSeconds,
      }}
    >
      {children}

      {/* ── Inactivity Warning Modal ── */}
      {user && showInactivityWarning && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md p-6 md:p-8 rounded-2xl border border-primary/40 shadow-2xl bg-surface-container-highest/95 backdrop-blur-xl flex flex-col items-center text-center animate-scale-in"
            style={{ boxShadow: "0 0 50px rgba(167,0,254,0.3)" }}
          >
            <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mb-4 text-primary animate-pulse">
              <span className="material-symbols-outlined text-3xl">timer</span>
            </div>

            <h3 className="font-poppins text-headline-sm text-white font-bold mb-2">
              ¿Sigues ahí?
            </h3>

            <p className="font-montserrat text-body-md text-on-surface-variant mb-4 leading-relaxed">
              Tu sesión se cerrará automáticamente por inactividad en:
            </p>

            <div className="text-4xl font-extrabold text-primary font-poppins mb-6 tracking-wider">
              {Math.floor(countdownSeconds / 60)}:{(countdownSeconds % 60).toString().padStart(2, "0")}
            </div>

            <p className="font-montserrat text-body-sm text-on-surface-variant/80 mb-6">
              Por tu seguridad y la de tus pedidos, requerimos actividad reciente en la cuenta.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={stayLoggedIn}
                className="btn-primary flex-1 py-3 justify-center text-sm font-bold shadow-lg"
              >
                <span className="material-symbols-outlined text-base">check_circle</span>
                Continuar Conectado
              </button>
              <button
                onClick={() => logout("manual")}
                className="btn-secondary flex-1 py-3 justify-center text-sm border-outline-variant hover:border-error/50 hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                Salir Ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
