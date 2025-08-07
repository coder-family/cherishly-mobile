# Backend Permission Fix for Family Group Access

## Vấn đề hiện tại

Khi user được mời vào family group và chấp nhận lời mời, họ vẫn không thể xem responses của children trong nhóm đó vì logic permission trong `getChildResponses` chỉ kiểm tra:

1. User có phải là admin không
2. User có phải là parent của child đó không (thông qua `createdBy`)

**Thiếu logic kiểm tra family group membership!**

## Giải pháp

Cần cập nhật logic trong `getChildResponses` để kiểm tra family group membership:

### Code cần sửa trong `controllers/responsesController.js`:

```javascript
// Get all responses for a child
exports.getChildResponses = asyncHandler(async (req, res) => {
  const { childId } = req.params;
  const {
    page = 1,
    limit = 10,
    status,
    device,
    startDate,
    endDate,
  } = req.query;
  const currentUser = req.user;

  // Check permissions
  const isAdmin = currentUser.role === "admin";

  // If user is not admin, verify they have access to the child
  if (!isAdmin) {
    if (currentUser.role === "parent") {
      // First, check if user is the parent of the child
      const childExists = await Child.findOne({
        _id: childId,
        createdBy: currentUser._id,
        isDeleted: false,
      });

      if (childExists) {
        // User is the parent, allow access
      } else {
        // User is not the parent, check if they're in the same family group
        const child = await Child.findOne({
          _id: childId,
          isDeleted: false,
        }).populate("familyGroupId");

        if (!child || !child.familyGroupId) {
          return sendError(
            res,
            StatusCodes.FORBIDDEN,
            "Child not found or not in any family group"
          );
        }

        // Check if user is a member of the child's family group
        const FamilyGroup = require("../models/FamilyGroup");
        const group = await FamilyGroup.findOne({
          _id: child.familyGroupId._id,
          "members.userId": currentUser._id,
          isDeleted: false,
        });

        if (!group) {
          return sendError(
            res,
            StatusCodes.FORBIDDEN,
            "You do not have permission to view responses for this child"
          );
        }
      }
    } else {
      return sendError(
        res,
        StatusCodes.FORBIDDEN,
        "You do not have permission to view child responses"
      );
    }
  }

  const query = { child: childId, isDeleted: false };
  if (status) query.status = status;
  if (device) query["metadata.device"] = device;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const responses = await PromptResponse.find(query)
    .populate("promptId", "question category frequency")
    .populate("child", "name")
    .populate("feedback.reviewedBy", "name")
    .sort({ date: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await PromptResponse.countDocuments(query);

  sendResponse(res, StatusCodes.OK, {
    responses,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalResponses: count,
  });
});
```

## Cập nhật Utils/Ownership

### Cần sửa trong `utils/ownership.js`:

```javascript
const Child = require("../models/Child");
const FamilyGroup = require("../models/FamilyGroup");

/**
 * Check if user owns the child (is the parent)
 */
const checkChildOwnership = async (childId, userId) => {
  try {
    const child = await Child.findOne({
      _id: childId,
      createdBy: userId,
      isDeleted: false,
    });

    if (!child) {
      return {
        error: "You do not have permission to access this child's records",
      };
    }

    return { success: true, child };
  } catch (error) {
    return { error: "Error checking child ownership" };
  }
};

/**
 * Check if user has permission to access child (owner or family group member)
 */
const checkChildPermission = async (childId, userId) => {
  try {
    // First check if user is the parent
    const ownershipResult = await checkChildOwnership(childId, userId);
    if (ownershipResult.success) {
      return { success: true, child: ownershipResult.child };
    }

    // If not the parent, check if user is in the same family group
    const child = await Child.findOne({
      _id: childId,
      isDeleted: false,
    }).populate("familyGroupId");

    if (!child || !child.familyGroupId) {
      return { error: "Child not found or not in any family group" };
    }

    // Check if user is a member of the child's family group
    const group = await FamilyGroup.findOne({
      _id: child.familyGroupId._id,
      "members.userId": userId,
      isDeleted: false,
    });

    if (!group) {
      return {
        error: "You do not have permission to access this child's records",
      };
    }

    return { success: true, child };
  } catch (error) {
    return { error: "Error checking child permission" };
  }
};

module.exports = {
  checkChildOwnership,
  checkChildPermission,
};
```

## Cập nhật Health Records Controller

### Thay thế trong `controllers/healthRecordsController.js`:

```javascript
// Thay thế dòng này:
const permissionCheck = await checkChildPermission(
  child,
  req.user._id.toString()
);

// Bằng logic trực tiếp:
const isAdmin = req.user.role === "admin";

if (!isAdmin) {
  if (req.user.role === "parent") {
    // First, check if user is the parent of the child
    const childExists = await Child.findOne({
      _id: child,
      createdBy: req.user._id,
      isDeleted: false,
    });

    if (!childExists) {
      // User is not the parent, check if they're in the same family group
      const childDoc = await Child.findOne({
        _id: child,
        isDeleted: false,
      }).populate("familyGroupId");

      if (!childDoc || !childDoc.familyGroupId) {
        return sendError(
          res,
          StatusCodes.FORBIDDEN,
          "Child not found or not in any family group"
        );
      }

      // Check if user is a member of the child's family group
      const FamilyGroup = require("../models/FamilyGroup");
      const group = await FamilyGroup.findOne({
        _id: childDoc.familyGroupId._id,
        "members.userId": req.user._id,
        isDeleted: false,
      });

      if (!group) {
        return sendError(
          res,
          StatusCodes.FORBIDDEN,
          "You do not have permission to access this child's records"
        );
      }
    }
  } else {
    return sendError(
      res,
      StatusCodes.FORBIDDEN,
      "You do not have permission to access child records"
    );
  }
}
```

## Cập nhật Growth Records Controller

### Tương tự cho `controllers/growthRecordsController.js`:

```javascript
// Thay thế checkChildOwnership bằng logic tương tự như trên
```

## Các bước thực hiện:

1. **Cập nhật Responses Controller** với logic trên
2. **Cập nhật Utils/Ownership** với logic mới
3. **Cập nhật Health Records Controller**
4. **Cập nhật Growth Records Controller**
5. **Kiểm tra Child model** có field `familyGroupId` không
6. **Test với các trường hợp:**
   - User là parent của child
   - User là member của family group
   - User không có quyền truy cập

## Lưu ý:

- Logic này sẽ cho phép user xem responses của child nếu:
  - User là admin
  - User là parent của child
  - User là member của family group mà child thuộc về
- Cần đảm bảo Child model có field `familyGroupId` để track child thuộc về family group nào

## Test cases:

1. **Parent của child** → Có thể xem responses
2. **Member của family group** → Có thể xem responses
3. **User không liên quan** → Không thể xem responses (403)
4. **Child không trong family group** → Chỉ parent mới xem được
