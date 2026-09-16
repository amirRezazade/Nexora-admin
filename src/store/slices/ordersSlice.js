import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, qs } from '@/lib/api';

export const fetchOrders = createAsyncThunk('orders/fetch', async (_, { getState, rejectWithValue }) => {
  const { filters, sort, page, pageSize } = getState().orders;
  try {
    return await api(`/api/orders${qs({ ...filters, sort: sort.key, dir: sort.dir, page, pageSize })}`);
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, status }) => {
    const res = await api(`/api/orders/${id}`, { method: 'PATCH', body: { status } });
    return res.data;
  }
);

const slice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    total: 0,
    totalPages: 1,
    counts: {},
    status: 'idle',
    error: null,
    filters: { q: '', status: [], payment: [], from: '', to: '', minTotal: '' },
    sort: { key: 'placedAt', dir: 'desc' },
    page: 1,
    pageSize: 10,
    selected: [],
  },
  reducers: {
    setFilter(state, action) {
      const { key, value } = action.payload;
      state.filters[key] = value;
      state.page = 1;
      state.selected = [];
    },
    setStatusTab(state, action) {
      state.filters.status = action.payload === 'all' ? [] : [action.payload];
      state.page = 1;
      state.selected = [];
    },
    clearFilters(state) {
      state.filters = { q: '', status: state.filters.status, payment: [], from: '', to: '', minTotal: '' };
      state.page = 1;
    },
    setSort(state, action) {
      const key = action.payload;
      if (state.sort.key === key) state.sort.dir = state.sort.dir === 'asc' ? 'desc' : 'asc';
      else state.sort = { key, dir: 'asc' };
      state.page = 1;
    },
    setPage(state, action) {
      state.page = action.payload;
      state.selected = [];
    },
    setPageSize(state, action) {
      state.pageSize = action.payload;
      state.page = 1;
    },
    toggleRow(state, action) {
      const id = action.payload;
      state.selected = state.selected.includes(id)
        ? state.selected.filter((x) => x !== id)
        : [...state.selected, id];
    },
    toggleAllRows(state) {
      const ids = state.items.map((i) => i.id);
      const all = ids.every((id) => state.selected.includes(id));
      state.selected = all
        ? state.selected.filter((id) => !ids.includes(id))
        : [...new Set([...state.selected, ...ids])];
    },
    clearSelection(state) {
      state.selected = [];
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchOrders.pending, (s) => {
      s.status = 'loading';
      s.error = null;
    })
      .addCase(fetchOrders.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.items = a.payload.data;
        s.total = a.payload.total;
        s.totalPages = a.payload.totalPages;
        s.counts = a.payload.counts;
      })
      .addCase(fetchOrders.rejected, (s, a) => {
        s.status = 'failed';
        s.error = a.payload || 'We couldn’t load your orders.';
      })
      .addCase(updateOrderStatus.fulfilled, (s, a) => {
        s.items = s.items.map((o) => (o.id === a.payload.id ? a.payload : o));
      });
  },
});

export const {
  setFilter, setStatusTab, clearFilters, setSort, setPage, setPageSize,
  toggleRow, toggleAllRows, clearSelection,
} = slice.actions;
export default slice.reducer;
