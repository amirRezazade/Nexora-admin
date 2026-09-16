import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, qs } from '@/lib/api';

export const DEFAULT_COLUMNS = {
  product: true,
  sku: true,
  category: true,
  price: true,
  stock: true,
  status: true,
  updated: false,
  supplier: false,
};

const initialFilters = {
  q: '',
  category: [],
  status: [],
  stock: [],
  minPrice: '',
  maxPrice: '',
  addedAfter: '',
};

export const fetchProducts = createAsyncThunk(
  'products/fetch',
  async (_, { getState, rejectWithValue }) => {
    const { filters, sort, page, pageSize, simulateError } = getState().products;
    try {
      return await api(
        `/api/products${qs({
          ...filters,
          sort: sort.key,
          dir: sort.dir,
          page,
          pageSize,
          fail: simulateError ? 1 : undefined,
        })}`
      );
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const bulkUpdateProducts = createAsyncThunk(
  'products/bulk',
  async ({ ids, action, value }, { dispatch }) => {
    const res = await api('/api/products', { method: 'PATCH', body: { ids, action, value } });
    await dispatch(fetchProducts());
    return res;
  }
);

export const deleteProduct = createAsyncThunk('products/delete', async (id, { dispatch }) => {
  await api(`/api/products/${id}`, { method: 'DELETE' });
  await dispatch(fetchProducts());
  return id;
});

export const duplicateProduct = createAsyncThunk('products/duplicate', async (id, { dispatch }) => {
  const res = await api(`/api/products/${id}`, { method: 'POST' });
  await dispatch(fetchProducts());
  return res.data;
});

const slice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    total: 0,
    totalPages: 1,
    summary: null,
    status: 'idle', // idle | loading | succeeded | failed
    error: null,
    filters: initialFilters,
    sort: { key: 'updatedAt', dir: 'desc' },
    page: 1,
    pageSize: 10,
    selected: [],
    columns: DEFAULT_COLUMNS,
    simulateError: false,
  },
  reducers: {
    setFilter(state, action) {
      const { key, value } = action.payload;
      state.filters[key] = value;
      state.page = 1;
      state.selected = [];
    },
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
      state.selected = [];
    },
    clearFilters(state) {
      state.filters = { ...initialFilters, q: state.filters.q };
      state.page = 1;
    },
    clearAllFilters(state) {
      state.filters = initialFilters;
      state.page = 1;
    },
    setSort(state, action) {
      const key = action.payload;
      if (state.sort.key === key) {
        state.sort.dir = state.sort.dir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sort = { key, dir: 'asc' };
      }
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
      const pageIds = state.items.map((i) => i.id);
      const allSelected = pageIds.every((id) => state.selected.includes(id));
      state.selected = allSelected
        ? state.selected.filter((id) => !pageIds.includes(id))
        : [...new Set([...state.selected, ...pageIds])];
    },
    clearSelection(state) {
      state.selected = [];
    },
    toggleColumn(state, action) {
      state.columns[action.payload] = !state.columns[action.payload];
    },
    resetColumns(state) {
      state.columns = { ...DEFAULT_COLUMNS };
    },
    setSimulateError(state, action) {
      state.simulateError = action.payload;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchProducts.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.summary = action.payload.summary;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'We couldn’t load your products.';
      })
      .addCase(bulkUpdateProducts.fulfilled, (state) => {
        state.selected = [];
      });
  },
});

export const {
  setFilter, setFilters, clearFilters, clearAllFilters, setSort, setPage, setPageSize,
  toggleRow, toggleAllRows, clearSelection, toggleColumn, resetColumns, setSimulateError,
} = slice.actions;

/** Active filters rendered as removable chips above the table. */
export const selectActiveFilterChips = (state) => {
  const { filters } = state.products;
  const chips = [];
  filters.category.forEach((v) => chips.push({ key: 'category', value: v, type: 'category' }));
  filters.status.forEach((v) => chips.push({ key: 'status', value: v, type: 'status' }));
  filters.stock.forEach((v) => chips.push({ key: 'stock', value: v, type: 'stock' }));
  if (filters.minPrice || filters.maxPrice) {
    chips.push({
      key: 'price',
      value: `${filters.minPrice || '0'}–${filters.maxPrice || '∞'}`,
      type: 'price',
    });
  }
  if (filters.addedAfter) chips.push({ key: 'addedAfter', value: filters.addedAfter, type: 'date' });
  return chips;
};

export const selectFilterCount = (state) => selectActiveFilterChips(state).length;

export default slice.reducer;
