# 🔥 URGENT: Backend Fix Required

## Problem

Backend is still checking invitation expiration, causing status 400 errors with message "Invalid or expired invitation".

## Error Evidence

```
POST /api/family-groups/accept-invitation HTTP/1.1" 400 57
Error: "Invalid or expired invitation"
```

## Immediate Backend Fixes Needed

### 1. Fix Accept Invitation Endpoint

**File:** `routes/family-groups.js` or similar
**Endpoint:** `POST /api/family-groups/accept-invitation`

```javascript
// ❌ CURRENT CODE (CAUSING ERROR):
app.post("/family-groups/accept-invitation", async (req, res) => {
  const { token } = req.body;

  const invitation = await Invitation.findOne({ token });

  // THIS IS THE PROBLEM - REMOVE THIS CHECK
  if (invitation.expiresAt < new Date()) {
    return res.status(400).json({
      message: "Invalid or expired invitation",
    });
  }

  // ... rest of code
});

// ✅ FIXED CODE:
app.post("/family-groups/accept-invitation", async (req, res) => {
  const { token } = req.body;

  const invitation = await Invitation.findOne({ token });

  if (!invitation) {
    return res.status(404).json({
      message: "Invitation not found",
    });
  }

  if (invitation.status !== "pending") {
    return res.status(400).json({
      message: "Invitation has already been processed",
    });
  }

  // ... rest of acceptance logic
});
```

### 2. Fix Decline Invitation Endpoint

**File:** `routes/family-groups.js` or similar  
**Endpoint:** `POST /api/family-groups/invitations/:id/decline`

```javascript
// ❌ CURRENT CODE (IF EXISTS):
app.post("/family-groups/invitations/:id/decline", async (req, res) => {
  const invitation = await Invitation.findById(req.params.id);

  // REMOVE THIS CHECK
  if (invitation.expiresAt < new Date()) {
    return res.status(400).json({
      message: "Invitation has expired",
    });
  }

  // ... rest of code
});

// ✅ FIXED CODE:
app.post("/family-groups/invitations/:id/decline", async (req, res) => {
  const invitation = await Invitation.findById(req.params.id);

  if (!invitation) {
    return res.status(404).json({
      message: "Invitation not found",
    });
  }

  if (invitation.status !== "pending") {
    return res.status(400).json({
      message: "Invitation has already been processed",
    });
  }

  // ... rest of decline logic
});
```

### 3. Update Invitation Creation

**File:** `routes/family-groups.js` or similar
**Endpoint:** `POST /api/family-groups/:id/invite`

```javascript
// ❌ CURRENT CODE:
const invitation = new Invitation({
  groupId: req.params.id,
  email: req.body.email,
  role: req.body.role,
  token: generateToken(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // REMOVE THIS
  invitedBy: req.user.id,
});

// ✅ FIXED CODE:
const invitation = new Invitation({
  groupId: req.params.id,
  email: req.body.email,
  role: req.body.role,
  token: generateToken(),
  invitedBy: req.user.id,
  // NO expiresAt field
});
```

### 4. Update Database Schema (Optional)

**File:** `models/Invitation.js` or similar

```javascript
// ❌ CURRENT SCHEMA:
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
    expiresAt: { type: Date, required: true }, // REMOVE THIS LINE
  },
  { timestamps: true }
);

// ✅ FIXED SCHEMA:
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
    // NO expiresAt field
  },
  { timestamps: true }
);
```

## Testing After Fix

1. **Test with expired invitation:**

   ```bash
   curl -X POST http://your-backend/api/family-groups/accept-invitation \
     -H "Content-Type: application/json" \
     -d '{"token":"expired-token-here"}'
   ```

   Should return 404 "Invitation not found" instead of 400 "Invalid or expired invitation"

2. **Test with valid invitation:**
   Should work normally without expiration check

## Quick Fix Checklist

- [ ] Remove `expiresAt` check from accept-invitation endpoint
- [ ] Remove `expiresAt` check from decline-invitation endpoint
- [ ] Remove `expiresAt` from invitation creation
- [ ] Update error messages to not mention "expired"
- [ ] Test with expired invitations
- [ ] Test with valid invitations

## Expected Results

After fix:

- ✅ Expired invitations return 404 "Invitation not found"
- ✅ Valid invitations work normally
- ✅ No more "Invalid or expired invitation" errors
- ✅ Frontend can accept/decline invitations without expiration issues
