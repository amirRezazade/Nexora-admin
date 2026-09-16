'use client';

import { configureStore } from '@reduxjs/toolkit';
import products from './slices/productsSlice';
import orders from './slices/ordersSlice';
import customers from './slices/customersSlice';
import categories from './slices/categoriesSlice';
import inventory from './slices/inventorySlice';
import notifications from './slices/notificationsSlice';
import auth from './slices/authSlice';
import ui from './slices/uiSlice';
import theme from './slices/themeSlice';

export const makeStore = () =>
  configureStore({
    reducer: { products, orders, customers, categories, inventory, notifications, auth, ui, theme },
    devTools: process.env.NODE_ENV !== 'production',
  });
