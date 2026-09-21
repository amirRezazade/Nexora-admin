import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async () =>
  api('/api/notifications')
);

export const markAllRead = createAsyncThunk('notifications/markAllRead', async () =>
  api('/api/notifications', { method: 'PATCH', body: { action: 'read_all' } })
);

export const toggleRead = createAsyncThunk('notifications/toggleRead', async (id) =>
  api('/api/notifications', { method: 'PATCH', body: { action: 'toggle', id } })
);

export const markRead = createAsyncThunk('notifications/markRead', async (id) =>
  api('/api/notifications', { method: 'PATCH', body: { action: 'read', id } })
);

const apply = (s, a) => {
  s.status = 'succeeded';
  s.items = a.payload.data;
  s.unread = a.payload.unread;
  if (a.payload.counts) s.counts = a.payload.counts;
};

const slice = createSlice({
  name: 'notifications',
  initialState: { items: [], counts: {}, unread: 0, status: 'idle', error: null, pendingId: null, markingAll: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchNotifications.pending, (s) => { s.status = s.items.length ? s.status : 'loading'; })
      .addCase(fetchNotifications.fulfilled, apply)
      .addCase(fetchNotifications.rejected, (s) => { s.status = 'failed'; s.error = 'We couldn’t load notifications.'; })
      .addCase(markAllRead.pending, (s) => { s.markingAll = true; })
      .addCase(markAllRead.fulfilled, (s, a) => { s.markingAll = false; apply(s, a); })
      .addCase(markAllRead.rejected, (s) => { s.markingAll = false; })
      .addCase(toggleRead.pending, (s, a) => { s.pendingId = a.meta.arg; })
      .addCase(toggleRead.fulfilled, (s, a) => { s.pendingId = null; apply(s, a); })
      .addCase(toggleRead.rejected, (s) => { s.pendingId = null; })
      .addCase(markRead.fulfilled, apply);
  },
});

export default slice.reducer;
