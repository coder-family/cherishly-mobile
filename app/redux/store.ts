import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: [
          "videoUpload/uploadVideo/pending",
          "videoUpload/uploadVideo/fulfilled",
          "videoUpload/uploadVideo/rejected",
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["payload.onProgress"],
        // Ignore these paths in the state
        ignoredPaths: ["videoUpload.uploadQueue"],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
