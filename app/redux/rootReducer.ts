import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import childReducer from './slices/childSlice';
import familyReducer from './slices/familySlice';
import healthReducer from './slices/healthSlice';
import memoryReducer from './slices/memorySlice';
import notificationReducer from './slices/notificationSlice';
import promptResponseReducer from './slices/promptResponseSlice';
import promptReducer from './slices/promptSlice';
import userReducer from './slices/userSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  children: childReducer,
  family: familyReducer,
  health: healthReducer,
  user: userReducer,
  memories: memoryReducer,
  notifications: notificationReducer,
  prompts: promptReducer,
  promptResponses: promptResponseReducer,
});

export default rootReducer;
