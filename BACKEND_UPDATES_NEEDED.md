# Backend Updates Needed for Invitation Functionality

## Overview

The frontend has been updated to show pending invitations in a dedicated "Join Group" screen instead of the home screen. This provides a better user experience by organizing invitation management in one place.

**IMPORTANT**: The backend MUST include the `token` field in the `getMyInvitations` response to enable direct acceptance of invitations in the app.

## 1. Update `getMyInvitations` endpoint

The current `getMyInvitations` function needs to include the `token` field in the response so that frontend can use it for accepting/declining invitations.

### Current Response:

```javascript
{
  _id: inv._id,
  groupId: group._id,
  groupName: group.name,
  groupAvatar: group.avatar,
  email: inv.email,
  role: inv.role,
  status: inv.status,
  expiresAt: inv.expiresAt,
  invitedBy,
  isExpired: new Date() > inv.expiresAt
}
```

### Updated Response:

```javascript
{
  _id: inv._id,
  groupId: group._id,
  groupName: group.name,
  groupAvatar: group.avatar,
  email: inv.email,
  role: inv.role,
  status: inv.status,
  expiresAt: inv.expiresAt,
  invitedBy,
  isExpired: new Date() > inv.expiresAt,
  token: inv.token // Add this field - CRITICAL for direct acceptance
}
```

### Backend Code Update:

```javascript
exports.getMyInvitations = asyncHandler(async (req, res) => {
  const user = req.user;

  // Find all groups that have invitations sent to this user's email
  const groups = await FamilyGroup.find({
    "invitations.email": user.email.toLowerCase(),
    isDeleted: false,
  }).populate("members.userId", "firstName lastName");

  const myInvitations = [];

  groups.forEach((group) => {
    const invitations = group.invitations.filter(
      (inv) => inv.email.toLowerCase() === user.email.toLowerCase()
    );

    invitations.forEach((inv) => {
      // Find the admin who sent the invitation
      const adminMember = group.members.find((m) => m.role === "admin");
      const invitedBy = adminMember?.userId?.firstName
        ? `${adminMember.userId.firstName} ${adminMember.userId.lastName}`
        : "Group Admin";

      myInvitations.push({
        _id: inv._id,
        groupId: group._id,
        groupName: group.name,
        groupAvatar: group.avatar,
        email: inv.email,
        role: inv.role,
        status: inv.status,
        expiresAt: inv.expiresAt,
        invitedBy,
        isExpired: new Date() > inv.expiresAt,
        token: inv.token, // ADD THIS LINE
      });
    });
  });

  // Sort by creation date (newest first)
  myInvitations.sort((a, b) => new Date(b.expiresAt) - new Date(a.expiresAt));

  return sendResponse(
    res,
    StatusCodes.OK,
    {
      invitations: myInvitations,
      total: myInvitations.length,
    },
    "User invitations retrieved successfully"
  );
});
```

## 2. Update `declineInvitation` endpoint

The current `declineInvitation` function uses token parameter, but it should use invitationId for better security and consistency.

### Current:

```javascript
exports.declineInvitation = asyncHandler(async (req, res) => {
  const { token } = req.body;
  // ... rest of the function
});
```

### Updated:

```javascript
exports.declineInvitation = asyncHandler(async (req, res) => {
  const { invitationId } = req.params;
  const user = req.user;

  // Find the invitation by ID
  const group = await FamilyGroup.findOne({
    "invitations._id": invitationId,
    "invitations.status": "pending",
    "invitations.expiresAt": { $gt: Date.now() },
    isDeleted: false,
  });

  if (!group) {
    return sendError(
      res,
      StatusCodes.BAD_REQUEST,
      "Invalid or expired invitation"
    );
  }

  const invitation = group.invitations.find(
    (inv) => inv._id.toString() === invitationId
  );
  if (!invitation) {
    return sendError(res, StatusCodes.NOT_FOUND, "Invitation not found");
  }

  // Check if the invitation was sent to this user's email
  if (!safeCompare(invitation.email.toLowerCase(), user.email.toLowerCase())) {
    return sendError(
      res,
      StatusCodes.FORBIDDEN,
      "Invitation was sent to a different email"
    );
  }

  // Mark invitation as declined
  invitation.status = "declined";
  await group.save();

  return sendResponse(
    res,
    StatusCodes.OK,
    null,
    "Invitation declined successfully"
  );
});
```

## 3. Add new route

Add this route to your family group routes:

```javascript
router.post(
  "/invitations/:invitationId/decline",
  auth,
  familyGroupController.declineInvitation
);
```

## 4. Update routes

Make sure these routes are added to your Express router:

```javascript
// Get user's pending invitations
router.get("/my-invitations", auth, familyGroupController.getMyInvitations);

// Decline invitation
router.post(
  "/invitations/:invitationId/decline",
  auth,
  familyGroupController.declineInvitation
);
```

## Frontend Changes Made

### New Join Group Screen (`/family/join-group`)

- Shows pending invitations at the top
- Provides input field for invitation token
- Includes "Create Family Group" button
- Shows "How to Invite" help section

### Updated Navigation

- "Join Group" button in home screen now navigates to `/family/join-group`
- "Create or Join Family Group" button also navigates to `/family/join-group`

### MyInvitationsSection Component

- Displays pending invitations with Accept/Decline buttons
- Shows group name, invited by, role, and expiry date
- **Direct acceptance**: Accept button now calls `acceptInvitation(token)` API
- **Direct decline**: Decline button calls `declineInvitation(invitationId)` API
- Handles accept/decline actions with proper error handling

## Summary

These updates will enable:

1. Users to see their pending invitations in a dedicated "Join Group" screen
2. **Direct acceptance**: Users can accept invitations directly from the app (using token)
3. **Direct decline**: Users can decline invitations directly from the app (using invitationId)
4. Better organization of invitation management
5. Better security by using invitationId instead of token for decline operations

**CRITICAL**: Without the `token` field in the `getMyInvitations` response, users will still need to use email links to accept invitations.
