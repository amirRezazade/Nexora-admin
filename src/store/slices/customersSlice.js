import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, qs } from '@/lib/api';

export const fetchCustomers = createAsyncThunk('customers/fetch', async (_, { getState, rejectWithValue }) => {
  const { filters, sort, page, pageSize } = getState().customers;
  try {
    return await api(`/api/customers${qs({ ...filters, sort: sort.key, dir: sort.dir, page, pageSize })}`);
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

const slice = createSlice({
  name: 'customers',
  initialState: {
    items: [], total: 0, totalPages: 1, summary: null,
    status: 'idle', error: null,
    filters: { q: '', status: [], segment: [] },
    sort: { key: 'totalSpent', dir: 'desc' },
    page: 1, pageSize: 10,
  },
  reducers: {
    setFilter(s, a) { s.filters[a.payload.key] = a.payload.value; s.page = 1; },
    clearFilters(s) { s.filters = { q: '', status: [], segment: [] }; s.page = 1; },
    setSort(s, a) {
      if (s.sort.key === a.payload) s.sort.dir = s.sort.dir === 'asc' ? 'desc' : 'asc';
      else s.sort = { key: a.payload, dir: 'asc' };
      s.page = 1;
    },
    setPage(s, a) { s.page = a.payload; },
    setPageSize(s, a) { s.pageSize = a.payload; s.page = 1; },
  },
  extraReducers: (b) => {
    b.addCase(fetchCustomers.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(fetchCustomers.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.items = a.payload.data; s.total = a.payload.total;
        s.totalPages = a.payload.totalPages; s.summary = a.payload.summary;
      })
      .addCase(fetchCustomers.rejected, (s, a) => {
        s.status = 'failed'; s.error = a.payload || 'We couldn’t load your customers.';
      });
  },
});

export const { setFilter, clearFilters, setSort, setPage, setPageSize } = slice.actions;
export default slice.reducer;
