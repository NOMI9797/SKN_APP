# 🔐 PIN Management Setup Guide

## 📋 **Prerequisites**

Before using PIN Management, ensure you have:

1. ✅ **Admin access** (userType: 'admin' or 'super_admin')
2. ✅ **PINS collection** created in Appwrite
3. ✅ **Proper permissions** set up

---

## 🗄️ **Step 1: Create PINS Collection in Appwrite**

### **1.1 Create Collection**
1. Go to [Appwrite Console](https://console.appwrite.io)
2. Navigate to your project → **Databases** → **skn_database**
3. Click **"Create Collection"**
4. Set Collection ID: `pins`
5. Set Collection Name: `Pins`

### **1.2 Add Attributes**

Create these attributes in the `pins` collection:

| Attribute Name | Type | Required | Default | Description |
|----------------|------|----------|---------|-------------|
| `pinCode` | String | ✅ Yes | - | Unique 8-character PIN code |
| `status` | String | ✅ Yes | `unused` | `unused`, `assigned`, `used` |
| `generatedBy` | String | ❌ No | - | Admin user ID who generated the PIN |
| `assignedTo` | String | ❌ No | - | User ID assigned to this PIN |
| `assignedAt` | String | ❌ No | - | Date when PIN was assigned |
| `usedAt` | String | ❌ No | - | Date when PIN was used |
| `createdAt` | String | ✅ Yes | - | Creation timestamp |

### **1.3 Set Permissions**
- **Read**: `role:all` (for admin access)
- **Write**: `role:all` (for admin access)
- **Delete**: `role:all` (for admin access)

---

## 🔧 **Step 2: Update Environment Variables**

Add this to your `.env.local`:

```env
# Collection IDs
NEXT_PUBLIC_APPWRITE_COLLECTION_PINS=pins
```

---

## 🚀 **Step 3: Test PIN Management**

### **3.1 Access Admin Dashboard**
1. Login as admin user
2. Click **"Admin Dashboard"** in header
3. Click **"PIN Management"** tab

### **3.2 Generate First PIN**
1. Click **"Generate PIN"** button
2. You should see a new PIN created
3. PIN will appear in the table with status "unused"

### **3.3 Assign PIN to User**
1. Select a user from dropdown
2. Click **"Assign PIN"** button
3. PIN status will change to "assigned"

---

## 🛠️ **Troubleshooting**

### **Error: "AdminService.getAllPins is not a function"**
- ✅ **Fixed**: Added `getAllPins()` method to AdminService
- ✅ **Fixed**: Added error handling for missing collection

### **Error: "Collection not found"**
- Check if `pins` collection exists in Appwrite
- Verify collection ID matches environment variable
- Ensure proper permissions are set

### **Error: "Permission denied"**
- Check if user has admin access (`userType: 'admin'` or `'super_admin'`)
- Verify API key has proper permissions
- Ensure collection permissions allow admin access

### **No PINs showing**
- Collection might be empty
- Click **"Generate PIN"** to create first PIN
- Check if collection exists and has proper structure

---

## 📊 **PIN Management Features**

### **Generate PINs**
- ✅ Create individual PINs
- ✅ Bulk PIN generation (coming soon)
- ✅ Unique 8-character alphanumeric codes

### **Assign PINs**
- ✅ Assign PINs to specific users
- ✅ Track assignment date and user
- ✅ Prevent duplicate assignments

### **Track Usage**
- ✅ Monitor PIN status (unused/assigned/used)
- ✅ View assignment history
- ✅ Search and filter PINs

### **Statistics**
- ✅ Total PINs count
- ✅ Available PINs count
- ✅ Assigned PINs count

---

## 🔒 **Security Notes**

1. **PIN Uniqueness**: System ensures no duplicate PINs
2. **Admin Only**: Only admin users can manage PINs
3. **Audit Trail**: All PIN operations are logged
4. **User Validation**: PINs can only be assigned to valid users

---

## 🎉 **Success Indicators**

✅ **PIN Management tab loads without errors**
✅ **"Generate PIN" button works**
✅ **PINs appear in the table**
✅ **PIN assignment works**
✅ **Statistics show correct counts**

**Your PIN Management system is ready!** 🚀
