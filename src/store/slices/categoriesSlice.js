import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, qs } from '@/lib/api';

export const fetchCategories = createAsyncThunk('categories/fetch', async (_, { getState, rejectWithValue }) => {
  const { filters, sort, page, pageSize } = getState().categories;
  try {
    return await api(`/api/categories${qs({ ...filters, sort: sort.key, dir: sort.dir, page, pageSize })}`);
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const createCategory = createAsyncThunk('categories/create', async (body, { dispatch, rejectWithValue }) => {
  try {
    const res = await api('/api/categories', { method: 'POST', body });
    await dispatch(fetchCategories());
    return res.data;
  } catch (e) {
    return rejectWithValue(e.errors || { name: e.message });
  }
});

export const updateCategory = createAsyncThunk('categories/update', async ({ id, ...body }, { dispatch, rejectWithValue }) => {
  try {
    const res = await api(`/api/categories/${id}`, { method: 'PUT', body });
    await dispatch(fetchCategories());
    return res.data;
  } catch (e) {
    return rejectWithValue(e.errors || { name: e.message });
  }
});

export const deleteCategory = createAsyncThunk('categories/delete', async (id, { dispatch, rejectWithValue }) => {
  try {
    await api(`/api/categories/${id}`, { method: 'DELETE' });
    await dispatch(fetchCategories());
    return id;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

const slice = createSlice({
  name: 'categories',
  initialState: {
    items: [], all: [], total: 0, totalPages: 1, status: 'idle', error: null,
    filters: { q: '', status: [] }, sort: { key: 'name', dir: 'asc' }, page: 1, pageSize: 10,
  },
  reducers: {
    setFilter(s, a) { s.filters[a.payload.key] = a.payload.value; s.page = 1; },
    setSort(s, a) {
      if (s.sort.key === a.payload) s.sort.dir = s.sort.dir === 'asc' ? 'desc' : 'asc';
      else s.sort = { key: a.payload, dir: 'asc' };
    },
    setPage(s, a) { s.page = a.payload; },
  },
  extraReducers: (b) => {
    b.addCase(fetchCategories.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(fetchCategories.fulfilled, (s, a) => {
        s.status = 'succeeded'; s.items = a.payload.data; s.all = a.payload.all;
        s.total = a.payload.total; s.totalPages = a.payload.totalPages;
      })
      .addCase(fetchCategories.rejected, (s, a) => {
        s.status = 'failed'; s.error = a.payload || 'We couldn’t load your categories.';
      });
  },
});

export const { setFilter, setSort, setPage } = slice.actions;
export const selectCategoryName = (state, id) =>
  state.categories.all.find((c) => c.id === id)?.name || 'Uncategorised';
export default slice.reducer;
