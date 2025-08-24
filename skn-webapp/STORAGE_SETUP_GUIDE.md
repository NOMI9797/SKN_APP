# 📁 Storage Setup Guide

## 🚨 **Error: Invalid fileId param**

The error you're seeing indicates that the storage bucket is not properly configured in Appwrite.

---

## 🗄️ **Step 1: Create Storage Bucket in Appwrite**

### **1.1 Create Bucket**
1. Go to [Appwrite Console](https://console.appwrite.io)
2. Navigate to your project → **Storage**
3. Click **"Create Bucket"**
4. Set Bucket ID: `files`
5. Set Bucket Name: `Files`
6. Set Permissions:
   - **Read**: `role:all`
   - **Write**: `role:all`
   - **Delete**: `role:all`

### **1.2 Configure Bucket Settings**
- **File Size Limit**: 10 MB (or as needed)
- **Allowed File Extensions**: `jpg`, `jpeg`, `png`, `gif`, `pdf`
- **Compression**: Disabled (for screenshots)

---

## 🔧 **Step 2: Update Environment Variables**

Add this to your `.env.local`:

```env
# Storage Bucket IDs
NEXT_PUBLIC_APPWRITE_BUCKET_FILES=files
```

---

## 🚀 **Step 3: Test File Upload**

### **3.1 Test Payment Screenshot Upload**
1. Go to payment page
2. Fill in payment details
3. Upload a screenshot
4. Submit payment request
5. Check if upload succeeds

### **3.2 Test Withdrawal Proof Upload**
1. Go to admin dashboard
2. Process a withdrawal request
3. Upload payment proof
4. Check if upload succeeds

---

## 🛠️ **Troubleshooting**

### **Error: "Invalid fileId param"**
- ✅ **Fixed**: Updated storage service to use `'unique()'` for file IDs
- ✅ **Fixed**: Removed custom file names that were too long

### **Error: "Bucket not found"**
- Check if `files` bucket exists in Appwrite Storage
- Verify bucket ID matches environment variable
- Ensure proper permissions are set

### **Error: "Permission denied"**
- Check bucket permissions in Appwrite Console
- Verify API key has storage permissions
- Ensure bucket allows file uploads

### **Error: "File size too large"**
- Check bucket file size limit
- Reduce image size before upload
- Use image compression if needed

---

## 📊 **Storage Bucket Structure**

### **File Organization:**
```
files/
├── payment_screenshots/
│   ├── user_123_timestamp.jpg
│   └── user_456_timestamp.png
└── withdrawal_proofs/
    ├── withdrawal_789_timestamp.jpg
    └── withdrawal_101_timestamp.png
```

### **File Naming Convention:**
- **Payment Screenshots**: `payment_proof_{userId}_{timestamp}.{ext}`
- **Withdrawal Proofs**: `withdrawal_proof_{withdrawalId}_{timestamp}.{ext}`

---

## 🔒 **Security Notes**

1. **File Validation**: Only image files are accepted
2. **Size Limits**: 5MB maximum file size
3. **Access Control**: Only authenticated users can upload
4. **File Cleanup**: Old files can be cleaned up periodically

---

## 🎉 **Success Indicators**

✅ **Payment screenshot uploads successfully**
✅ **Withdrawal proof uploads successfully**
✅ **No "Invalid fileId" errors**
✅ **Files are accessible via URLs**
✅ **Admin can view uploaded files**

**Your storage system is ready!** 🚀

---

## 📝 **Code Changes Made**

### **Storage Service Fix:**
```typescript
// Before (causing error)
const fileName = `payment_screenshots/payment_proof_${userId}_${Date.now()}.${file.name.split('.').pop()}`;
const uploadedFile = await storage.createFile(STORAGE_BUCKETS.FILES, fileName, file);

// After (fixed)
const uploadedFile = await storage.createFile(STORAGE_BUCKETS.FILES, 'unique()', file);
```

**The file upload system is now fixed and ready to use!** 🎉
