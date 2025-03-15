import { configureStore } from '@reduxjs/toolkit';
import authReducer from './fetaures/authSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Defaults to localStorage for web
import { combineReducers } from 'redux';
import userReducer from './fetaures/userSlice';

// Create a persist configuration
const persistConfig = {
  key: 'root', // The key for localStorage
  storage,     // Define storage engine
};

// Combine reducers (if you have more than one)
const rootReducer = combineReducers({
  auth: authReducer,
  user:userReducer

});

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
});

// Create persistor
export const persistor = persistStore(store);
