import { createClient, type Session, type User } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Supabase client configuration
// Read VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from environment.
// Fallback to a safe mock URL if not yet configured, preventing startup crashes.
// ---------------------------------------------------------------------------
const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || '';
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

export const isSupabaseConfigured = Boolean(
  envUrl &&
  envKey &&
  envUrl.startsWith('http') &&
  !envUrl.includes('your-project-ref') &&
  !envKey.includes('your-supabase-anon'),
);

const defaultUrl = isSupabaseConfigured ? envUrl : 'https://placeholder-project.supabase.co';
const defaultKey = isSupabaseConfigured ? envKey : 'placeholder-anon-key';

export const supabase = createClient(defaultUrl, defaultKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Re-export types
export type { Session, User };

// ---------------------------------------------------------------------------
// User helper utilities (bridges Supabase User properties)
// ---------------------------------------------------------------------------
export function getUserDisplayName(user: User | null | undefined): string {
  if (!user) return '';
  const meta = user.user_metadata;
  return String(
    meta?.full_name ||
    meta?.name ||
    meta?.user_name ||
    user.email?.split('@')[0] ||
    '',
  );
}

export function isUserEmailVerified(user: User | null | undefined): boolean {
  if (!user) return false;
  return Boolean(user.email_confirmed_at || (user as { confirmed_at?: string }).confirmed_at);
}

// ---------------------------------------------------------------------------
// Google Forms OAuth token (kept strictly in memory, never in storage)
// ---------------------------------------------------------------------------
export const GOOGLE_FORMS_SCOPES = [
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.responses.readonly',
];

let cachedWorkspaceToken: string | null = null;

export function getWorkspaceAccessToken(): string | null {
  return cachedWorkspaceToken;
}

export function clearWorkspaceAccessToken(): void {
  cachedWorkspaceToken = null;
}

// ---------------------------------------------------------------------------
// Local / Demo auth state when Supabase credentials are not yet configured
// ---------------------------------------------------------------------------
const DEMO_USER_KEY = 'partha_demo_session_user';
const authListeners = new Set<(user: User | null) => void>();

function getLocalDemoUser(): User | null {
  try {
    const raw = localStorage.getItem(DEMO_USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function setLocalDemoUser(user: User | null) {
  try {
    if (user) {
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(DEMO_USER_KEY);
    }
  } catch {
    // ignore storage errors
  }
  authListeners.forEach((fn) => fn(user));
}

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

/** Subscribe to auth state changes */
export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  authListeners.add(callback);

  if (!isSupabaseConfigured) {
    const current = getLocalDemoUser();
    callback(current);
    return () => {
      authListeners.delete(callback);
    };
  }

  void supabase.auth.getSession().then(({ data }) => {
    if (!data.session) {
      cachedWorkspaceToken = null;
    }
    callback(data.session?.user ?? null);
  });

  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!session) {
      cachedWorkspaceToken = null;
    }
    callback(session?.user ?? null);
  });

  return () => {
    authListeners.delete(callback);
    listener.subscription.unsubscribe();
  };
}

/** Sign in with Google OAuth */
export async function signInWithGoogle(): Promise<void> {
  if (!isSupabaseConfigured) {
    const mockEmail = localStorage.getItem('partha_pending_role') === 'admin'
      ? 'rajendramadival7@gmail.com'
      : 'student.klsvdit@gmail.com';
    const mockUser: User = {
      id: 'usr_google_demo_' + Date.now(),
      app_metadata: { provider: 'google', providers: ['google'] },
      user_metadata: { full_name: 'KLS VDIT User', name: 'KLS VDIT User' },
      aud: 'authenticated',
      email: mockEmail,
      email_confirmed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as User;
    setLocalDemoUser(mockUser);
    return;
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: { prompt: 'select_account' },
    },
  });
  if (error) throw error;
}

/** Request Google Forms permissions */
export async function requestGoogleFormsPermission(): Promise<string> {
  if (!isSupabaseConfigured) {
    cachedWorkspaceToken = 'mock_google_forms_access_token_' + Date.now();
    return cachedWorkspaceToken;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      scopes: GOOGLE_FORMS_SCOPES.join(' '),
    },
  });
  if (error) throw error;

  const session = data as unknown as Session | null;
  const token = (session as { provider_token?: string } | null)?.provider_token ?? null;
  if (token) {
    cachedWorkspaceToken = token;
    return token;
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const providerToken = (sessionData.session as unknown as { provider_token?: string } | null)
    ?.provider_token ?? null;
  if (providerToken) {
    cachedWorkspaceToken = providerToken;
    return providerToken;
  }

  return 'google_forms_token_connected';
}

/** Sign in with email + password */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  if (!isSupabaseConfigured) {
    const cleanEmail = email.trim();
    const mockUser: User = {
      id: 'usr_local_' + Math.abs(cleanEmail.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)),
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: { full_name: cleanEmail.split('@')[0] },
      aud: 'authenticated',
      email: cleanEmail,
      email_confirmed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as User;
    setLocalDemoUser(mockUser);
    return mockUser;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  if (!data.user) throw new Error('Sign-in succeeded but no user returned.');
  return data.user;
}

/** Register a new user with email + password */
export async function registerWithEmail(email: string, password: string): Promise<User> {
  if (!isSupabaseConfigured) {
    const cleanEmail = email.trim();
    const mockUser: User = {
      id: 'usr_local_' + Date.now(),
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: { full_name: cleanEmail.split('@')[0] },
      aud: 'authenticated',
      email: cleanEmail,
      email_confirmed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as User;
    setLocalDemoUser(mockUser);
    return mockUser;
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw error;
  if (!data.user) throw new Error('Registration succeeded but no user returned.');
  return data.user;
}

/** Sign out */
export async function signOutFromSupabase(): Promise<void> {
  cachedWorkspaceToken = null;
  setLocalDemoUser(null);
  if (isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
}

// ---------------------------------------------------------------------------
// Error formatting
// ---------------------------------------------------------------------------
export function formatSupabaseAuthError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error ?? '');

  if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'Incorrect email or password. Check your credentials or use Continue with Google.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'Please confirm your email address before signing in. Check your inbox.';
  }
  if (msg.includes('User already registered')) {
    return 'An account with this email already exists. Switch to Login to sign in.';
  }
  if (msg.includes('Password should be at least')) {
    return 'Password should be at least 6 characters long.';
  }
  if (msg.includes('Unable to validate email address')) {
    return 'Please enter a valid email address.';
  }
  if (msg.includes('Signups not allowed for this instance')) {
    return 'Sign-ups are currently disabled. Contact the administrator.';
  }
  if (msg.includes('oauth') || msg.includes('OAuth')) {
    return 'Google sign-in failed. Please try again.';
  }
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('NetworkError')) {
    return 'Network error while connecting to the server. Check your internet connection.';
  }

  return msg || 'Unable to authenticate.';
}

export function isEmailPasswordDisabledError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error ?? '');
  return (
    msg.includes('Signups not allowed') ||
    msg.includes('Email logins are disabled')
  );
}

// ---------------------------------------------------------------------------
// Supabase error wrapper
// ---------------------------------------------------------------------------
export interface SupabaseErrorInfo {
  error: string;
  operationType: string;
  path: string | null;
  authInfo: { userId?: string | null; email?: string | null };
}

export function handleSupabaseError(
  error: unknown,
  operationType: string,
  path: string | null,
): never {
  const errInfo: SupabaseErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {},
  };
  console.error('Supabase Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
