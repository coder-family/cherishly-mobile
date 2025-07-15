import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import childReducer from './slices/childSlice';
import familyReducer from './slices/familySlice';
import userReducer from './slices/userSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  children: childReducer,
  family: familyReducer,
  user: userReducer,
});

export default rootReducer;
