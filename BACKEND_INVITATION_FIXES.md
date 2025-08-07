# Backend Changes for Invitation Expiration Removal

## Overview

To complete the removal of invitation expiration logic, the backend needs to be updated to stop checking expiration dates and allow invitations to be accepted/declined at any time.

## Required Backend Changes

### 1. Remove Expiration Checks

#### Accept Invitation Endpoint

```javascript
// Before (with expiration check)
app.post("/family-groups/accept-invitation", async (req, res) => {
  const { token } = req.body;

  // Find invitation
  const invitation = await Invitation.findOne({ token });

  // Check if expired
  if (invitation.expiresAt < new Date()) {
    return res.status(400).json({
      message: "Invalid or expired invitation",
    });
  }

  // Process acceptance...
});

// After (without expiration check)
app.post("/family-groups/accept-invitation", async (req, res) => {
  const { token } = req.body;

  // Find invitation
  const invitation = await Invitation.findOne({ token });

  if (!invitation) {
    return res.status(404).json({
      message: "Invitation not found",
    });
  }

  // Process acceptance without expiration check...
});
```

#### Decline Invitation Endpoint

```javascript
// Before (with expiration check)
app.post("/family-groups/invitations/:id/decline", async (req, res) => {
  const invitation = await Invitation.findById(req.params.id);

  if (invitation.expiresAt < new Date()) {
    return res.status(400).json({
      message: "Invitation has expired",
    });
  }

  // Process decline...
});

// After (without expiration check)
app.post("/family-groups/invitations/:id/decline", async (req, res) => {
  const invitation = await Invitation.findById(req.params.id);

  if (!invitation) {
    return res.status(404).json({
      message: "Invitation not found",
    });
  }

  // Process decline without expiration check...
});
```

### 2. Update Invitation Creation

#### Remove Expiration Date Setting

```javascript
// Before (with expiration)
const invitation = new Invitation({
  groupId: req.body.groupId,
  email: req.body.email,
  role: req.body.role,
  token: generateToken(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  invitedBy: req.user.id,
});

// After (without expiration)
const invitation = new Invitation({
  groupId: req.body.groupId,
  email: req.body.email,
  role: req.body.role,
  token: generateToken(),
  invitedBy: req.user.id,
});
```

### 3. Update Database Schema (Optional)

If you want to completely remove expiration logic:

```javascript
// Remove expiresAt field from Invitation schema
const invitationSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FamilyGroup",
      required: true,
    },
    email: { type: String, required: true },
    role: { type: String, enum: ["parent", "admin"], default: "parent" },
    token: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Remove: expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);
```

### 4. Update Response Interfaces

#### Get My Invitations

```javascript
// Remove isExpired calculation
app.get("/family-groups/my-invitations", async (req, res) => {
  const invitations = await Invitation.find({
    email: req.user.email,
    status: "pending",
  }).populate("groupId", "name avatar");

  const formattedInvitations = invitations.map((inv) => ({
    _id: inv._id,
    groupId: inv.groupId._id,
    groupName: inv.groupId.name,
    groupAvatar: inv.groupId.avatar,
    email: inv.email,
    role: inv.role,
    status: inv.status,
    invitedBy: inv.invitedBy,
    token: inv.token,
    // Remove: isExpired: inv.expiresAt < new Date()
  }));

  res.json({ invitations: formattedInvitations });
});
```

## Testing Checklist

After making these changes, test the following:

1. ✅ Create new invitation (should not have expiration date)
2. ✅ Accept invitation immediately after creation
3. ✅ Accept invitation after a long time (should work)
4. ✅ Decline invitation immediately after creation
5. ✅ Decline invitation after a long time (should work)
6. ✅ Resend invitation (should work regardless of time)
7. ✅ Cancel invitation (should work regardless of time)

## Migration Notes

- Existing invitations with expiration dates will still work if you keep the expiration field but don't check it
- For a complete migration, you can run a database migration to remove the `expiresAt` field from existing invitations
- Consider adding a migration script to update existing invitations

## Error Messages to Update

Update these error messages in your backend:

```javascript
// Remove these error messages:
-"Invalid or expired invitation" -
  "Invitation has expired" -
  "Invitation expired" -
  // Replace with:
  "Invitation not found" -
  "Invalid invitation token" -
  "You have already joined this group";
```
