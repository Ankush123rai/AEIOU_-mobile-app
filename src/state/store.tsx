import React, { PropsWithChildren } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
// import authReducer from './slices/authSlice';
// import progressReducer from './slices/progressSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    // auth: authReducer,
    // progress: progressReducer,
    user: userReducer,
  },
});

export function StoreProvider({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
