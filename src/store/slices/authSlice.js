import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabaseClient';

const DEMO = { email: 'amir.rezazadeh@nexora.com', password: 'nexora2026' };

function mapUser(sessionUser, profile) {
  const name =
    sessionUser?.user_metadata?.name ||
    profile?.name ||
    sessionUser?.email ||
    'User';
  const roles = [profile?.role, sessionUser?.user_metadata?.role];
  const role = roles.includes('admin') ? 'Store Owner' : roles.find(Boolean) || 'Staff';
  return {
    id: sessionUser.id,
    name,
    email: sessionUser.email,
    role,
    initials: name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
    joinedAt: sessionUser.created_at,
  };
}

export const hydrateAuth = createAsyncThunk('auth/hydrate', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
  return mapUser(session.user, profile);
});

export const signIn = createAsyncThunk('auth/signIn', async ({ email, password }, { rejectWithValue }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) {
    if (error.message?.toLowerCase().includes('confirm')) {
      return rejectWithValue('This account’s email is not confirmed yet. Run auth-setup.sql in Supabase.');
    }
    return rejectWithValue('That email and password combination doesn’t match our records.');
  }
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
  return mapUser(data.user, profile);
});

export const requestReset = createAsyncThunk('auth/requestReset', async (email, { rejectWithValue }) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return rejectWithValue(error.message);
  return email;
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async (password, { rejectWithValue }) => {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return rejectWithValue(error.message);
  return true;
});

export const signOut = createAsyncThunk('auth/signOut', async (scope = 'local') => {
  await supabase.auth.signOut({ scope });
});

const slice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    bootstrapped: false,
    signingOut: false,
    status: 'idle',
    error: null,
    resetEmail: null,
  },
  reducers: {
    clearError(state) {
      state.error = null;
    },
    updateProfile(state, action) {
      if (state.user) state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (b) => {
    b.addCase(hydrateAuth.fulfilled, (s, a) => {
      s.bootstrapped = true;
      /* A sign-in may have completed while hydration was in flight — never
         let a stale null result clobber the fresh authenticated state. */
      if (!a.payload && s.isAuthenticated) return;
      s.user = a.payload;
      s.isAuthenticated = Boolean(a.payload);
    })
      .addCase(hydrateAuth.rejected, (s) => {
        s.bootstrapped = true;
        s.user = null;
        s.isAuthenticated = false;
      })
      .addCase(signIn.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(signIn.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.user = a.payload;
        s.isAuthenticated = true;
      })
      .addCase(signIn.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload; })
      .addCase(signOut.pending, (s) => { s.signingOut = true; })
      .addCase(signOut.fulfilled, (s) => {
        s.user = null;
        s.isAuthenticated = false;
        s.signingOut = false;
        s.status = 'idle';
      })
      /* The local session is cleared by supabase-js even when the network call
         fails — always settle to logged-out so the UI can never get stuck. */
      .addCase(signOut.rejected, (s) => {
        s.user = null;
        s.isAuthenticated = false;
        s.signingOut = false;
        s.status = 'idle';
      })
      .addCase(requestReset.pending, (s) => { s.status = 'loading'; })
      .addCase(requestReset.fulfilled, (s, a) => { s.status = 'succeeded'; s.resetEmail = a.payload; })
      .addCase(resetPassword.pending, (s) => { s.status = 'loading'; })
      .addCase(resetPassword.fulfilled, (s) => { s.status = 'succeeded'; });
  },
});

export const { clearError, updateProfile } = slice.actions;
export const DEMO_CREDENTIALS = DEMO;
export default slice.reducer;
