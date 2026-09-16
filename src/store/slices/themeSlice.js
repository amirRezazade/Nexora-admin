import { createSlice } from '@reduxjs/toolkit';

/** 'light' | 'dark' | 'system' — resolved to an actual class by ThemeProvider. */
const slice = createSlice({
  name: 'theme',
  initialState: { preference: 'light', resolved: 'light' },
  reducers: {
    setPreference(s, a) { s.preference = a.payload; },
    setResolved(s, a) { s.resolved = a.payload; },
  },
});

export const { setPreference, setResolved } = slice.actions;
export default slice.reducer;
