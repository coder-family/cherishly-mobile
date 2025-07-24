import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import childReducer from './slices/childSlice';
import familyReducer from './slices/familySlice';
import healthReducer from './slices/healthSlice';
import memoryReducer from './slices/memorySlice';
import userReducer from './slices/userSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  children: childReducer,
  family: familyReducer,
  health: healthReducer,
  user: userReducer,
  memories: memoryReducer,
});

export default rootReducer;
