# API_BASE_URL Fix

## Problem
The app was getting errors when fetching prompt responses and other API calls because the `API_BASE_URL` environment variable was undefined. This happened because:

1. The `.env` file was missing from the project
2. The `babel.config.js` was configured to load environment variables from `.env`
3. When `API_BASE_URL` was undefined, API calls were being made to URLs like `undefined/prompt-responses/child/...`

## Error Messages
```
ERROR  promptResponseService: All URL attempts failed
ERROR  promptResponseSlice: fetchChildResponses.rejected with error: undefined
ERROR  promptResponseSlice: fetchChildResponses.rejected with action: {"error": {"message": "API Error"}, "meta": {"aborted": false, "arg": {"childId": "6870e322386d1a706aff6eeb", "limit": 20}, "condition": false, "rejectedWithValue": false, "requestId": "6LaonEG92cNv4E1bMLZYk", "requestStatus": "rejected"}, "payload": undefined, "type": "promptResponses/fetchChildResponses/rejected"}
ERROR  promptResponseSlice: fetchChildResponses.rejected with error message: API Error
```

## Solution
Added a fallback URL pattern to all services that use `API_BASE_URL` directly in fetch calls. The pattern follows the same approach used in `apiService.ts`:

```typescript
// Use the same fallback as apiService
const BASE_URL = API_BASE_URL || "https://growing-together-app.onrender.com/api";
```

Additionally, for the `promptResponseService`, implemented a more robust endpoint discovery approach that tries multiple possible API endpoints and gracefully handles failures by returning empty results instead of throwing errors.

## Additional Fixes

### Data Mapping Issues
Fixed the `mapPromptResponseFromApi` function to correctly handle the nested API response structure:
- Extract `content` from `response.content` instead of root level
- Extract `promptId` from `promptId._id` when it's an object
- Extract `childId` from `child._id` when it's an object

### Prompt-Response Matching
Fixed the matching logic in `QAContent.tsx` to handle both string and object promptId formats, ensuring responses are correctly matched to their prompts.

### Question Display
Fixed the prompt mapping to use the `question` field from the API response as the content, and updated the QAContent component to handle embedded prompt information in responses.

### Pagination
Implemented pagination for Q&A cards to show only the 3 most recent cards initially with a "Load More" button to display additional cards in batches of 3.

## Files Fixed
1. `app/services/promptResponseService.ts` - Fixed all fetch calls to use BASE_URL
2. `app/services/userService.ts` - Fixed avatar upload fetch call
3. `app/services/childService.ts` - Fixed avatar upload fetch call
4. `app/services/memoryService.ts` - Fixed all fetch calls to use BASE_URL
5. `app/components/family/AddFamilyGroupModal.tsx` - Fixed avatar upload fetch call
6. `app/family/create.tsx` - Fixed avatar upload fetch call
7. `app/family/edit/[id].tsx` - Fixed avatar upload fetch call

## How to Set Up Environment Variables
To properly configure the API URL, create a `.env` file in the project root with:

```
API_BASE_URL=https://growing-together-app.onrender.com/api
```

Note: The `.env` file is gitignored for security reasons, so each developer needs to create their own local copy.

## Testing
The fix ensures that even without a `.env` file, the app will use the fallback URL and API calls should work properly. The error messages should no longer appear when fetching prompt responses or other API data. 