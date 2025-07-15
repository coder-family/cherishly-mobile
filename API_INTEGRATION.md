# API Integration Guide

This document explains how the Growing Together mobile app has been updated to use actual API calls instead of mock data.

## Overview

The app has been migrated from using mock data to real API calls for:
- Children management (CRUD operations)
- Family group management (CRUD operations)
- User profile updates

## New Services

### Child Service (`app/services/childService.ts`)

Handles all child-related API operations:

```typescript
// Get all children for the current user
const children = await getChildren();

// Get a specific child
const child = await getChild(childId);

// Create a new child
const newChild = await createChild({
  name: 'Emma',
  birthdate: '2022-05-10',
  bio: 'Loves to smile!'
});

// Update a child
const updatedChild = await updateChild(childId, {
  name: 'Emma Grace',
  bio: 'Updated bio'
});

// Delete a child
await deleteChild(childId);
```

### Family Service (`app/services/familyService.ts`)

Handles all family group-related API operations:

```typescript
// Get all family groups for the current user
const groups = await getFamilyGroups();

// Get a specific family group
const group = await getFamilyGroup(groupId);

// Create a new family group
const newGroup = await createFamilyGroup({
  name: 'Smith Family',
  description: 'Our family group'
});

// Join a family group
await joinFamilyGroup(groupId, inviteCode);

// Leave a family group
await leaveFamilyGroup(groupId);
```

## Redux State Management

### Child Slice (`app/redux/slices/childSlice.ts`)

Manages children state with async thunks:

- `fetchChildren()` - Load all children
- `fetchChild(childId)` - Load specific child
- `createChild(data)` - Create new child
- `updateChild({ childId, data })` - Update child
- `deleteChild(childId)` - Delete child

### Family Slice (`app/redux/slices/familySlice.ts`)

Manages family groups state with async thunks:

- `fetchFamilyGroups()` - Load all family groups
- `fetchFamilyGroup(groupId)` - Load specific group
- `createFamilyGroup(data)` - Create new group
- `updateFamilyGroup({ groupId, data })` - Update group
- `deleteFamilyGroup(groupId)` - Delete group
- `joinFamilyGroup({ groupId, inviteCode })` - Join group
- `leaveFamilyGroup(groupId)` - Leave group

## Updated Home Screen

The home screen (`app/tabs/home.tsx`) now:

1. **Fetches real data** on component mount
2. **Shows loading states** while fetching data
3. **Handles errors** gracefully with retry functionality
4. **Uses Redux state** instead of mock data
5. **Provides navigation** to child and family group screens

### Key Features:

- **Loading Spinner**: Shows while fetching data
- **Error Handling**: Displays error messages with retry option
- **Dynamic Content**: Shows different UI based on data availability
- **Navigation**: Buttons navigate to appropriate screens

## API Endpoints

The app expects the following API endpoints:

### Children
- `GET /children` - Get all children
- `GET /children/:id` - Get specific child
- `POST /children` - Create child
- `PATCH /children/:id` - Update child
- `DELETE /children/:id` - Delete child

### Family Groups
- `GET /family-groups` - Get all family groups
- `GET /family-groups/:id` - Get specific family group
- `POST /family-groups` - Create family group
- `PATCH /family-groups/:id` - Update family group
- `DELETE /family-groups/:id` - Delete family group
- `POST /family-groups/:id/join` - Join family group
- `POST /family-groups/:id/leave` - Leave family group
- `POST /family-groups/:id/invite` - Invite to family group

## Error Handling

The app includes comprehensive error handling:

1. **API Errors**: Caught and displayed to users
2. **Network Errors**: Handled with retry functionality
3. **Loading States**: Prevent user confusion during API calls
4. **User Feedback**: Success/error messages for all operations

## Testing

To test the API integration:

1. **Start the development server**: `npm start`
2. **Ensure your API is running** and accessible
3. **Check the API_BASE_URL** in your environment variables
4. **Test the app flow**:
   - Login/register
   - View home screen (should show loading then content)
   - Try adding/editing children
   - Try creating/joining family groups

## Environment Variables

Make sure your `.env` file includes:

```bash
API_BASE_URL=https://your-api-url.com
```

## Next Steps

The following screens still need to be created to complete the integration:

1. **Add Child Screen** (`/children/add`)
2. **Child Profile Screen** (`/children/[childId]/profile`)
3. **Family Group Creation Screen** (`/family/create`)
4. **Family Group Detail Screen** (`/family/[groupId]`)

These screens should use the same Redux patterns and API services established in this integration. 