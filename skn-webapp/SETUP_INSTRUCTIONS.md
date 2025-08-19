# 🚀 PayFast Integration Fix - Setup Instructions

## ✅ Issues Fixed

1. **Signature Generation Issue**: Updated signature generation algorithm to match PayFast requirements
2. **Merchant Credentials**: Updated default credentials to match your provided values
3. **Passphrase Configuration**: Fixed passphrase handling in signature generation
4. **Next.js Warnings**: Moved viewport configuration from metadata to separate export
5. **Webhook Endpoint**: Created proper webhook handler for PayFast notifications

## 🔧 Environment Variables Setup

**IMPORTANT**: You need to create a `.env.local` file in the `skn-webapp` directory with the following content:

```bash
# PayFast Configuration - Your provided credentials
NEXT_PUBLIC_PAYFAST_SANDBOX_MERCHANT_ID=10041284
NEXT_PUBLIC_PAYFAST_SANDBOX_MERCHANT_KEY=d97y80gn9i39n
NEXT_PUBLIC_PAYFAST_SANDBOX_PASS_PHRASE=MySecret1234

# Production PayFast (fill these when going live)
NEXT_PUBLIC_PAYFAST_MERCHANT_ID=
NEXT_PUBLIC_PAYFAST_MERCHANT_KEY=
NEXT_PUBLIC_PAYFAST_PASS_PHRASE=

# PayFast URLs
NEXT_PUBLIC_PAYFAST_RETURN_URL=http://localhost:3000/payment/success
NEXT_PUBLIC_PAYFAST_CANCEL_URL=http://localhost:3000/payment/cancel
NEXT_PUBLIC_PAYFAST_NOTIFY_URL=http://localhost:3000/api/payment/webhook
```

## 📝 Steps to Apply Fix

1. **Create Environment File**:
   ```bash
   cd skn-webapp
   touch .env.local
   ```

2. **Add Environment Variables**:
   Copy the environment variables above into your `.env.local` file.

3. **Restart Development Server**:
   ```bash
   npm run dev
   ```

## 🔍 What Was Fixed

### 1. Signature Generation Algorithm
- **Issue**: PayFast was rejecting signatures due to incorrect encoding
- **Fix**: Updated URL encoding to match PayFast's specific requirements
- **Changes**: Modified `generateSignature()` method in `payfast.ts`

### 2. Merchant Credentials
- **Issue**: Using default sandbox credentials instead of your provided ones
- **Fix**: Updated default values to your credentials (Merchant ID: 10041284)
- **Changes**: Updated `PAYFAST_CONFIG.SANDBOX` in `payfast.ts`

### 3. Passphrase Handling
- **Issue**: Passphrase encoding was causing signature mismatches
- **Fix**: Don't URL encode the passphrase when appending to signature string
- **Changes**: Modified passphrase handling in signature generation

### 4. Next.js Viewport Warning
- **Issue**: Viewport in metadata export is deprecated in Next.js 15
- **Fix**: Moved viewport to separate export in `layout.tsx`
- **Changes**: Separated `viewport` from `metadata` export

### 5. Webhook Endpoint
- **Issue**: Missing proper webhook handler
- **Fix**: Created `/api/payment/webhook/route.ts` with proper handling
- **Features**: Handles payment status updates, logging, and validation

## 🧪 Testing the Fix

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Check console logs** - you should see:
   ```
   === PayFast Configuration ===
   Merchant ID: 10041284
   Merchant Key: d97y80gn9i39n
   Passphrase: ***
   Passphrase length: 12
   Passphrase loaded: true
   Environment: SANDBOX
   =====================================
   ```

3. **Test payment flow**:
   - Go to `/payment`
   - Select a payment method
   - Check that the signature generation logs show correct values
   - Submit payment to PayFast

4. **Verify signature generation**:
   - Look for "Generated signature" in console
   - Should be 32-character MD5 hash
   - No more "400 Bad Request" errors from PayFast

## 🚨 Important Notes

1. **Environment Variables**: The `.env.local` file is crucial - without it, the system will use default credentials
2. **Restart Required**: After creating `.env.local`, restart your development server
3. **Signature Validation**: PayFast is very strict about signature format - the fix addresses this
4. **Webhook Testing**: Use tools like ngrok for local webhook testing with PayFast

## 🔧 Troubleshooting

### If you still get signature errors:
1. Check that `.env.local` exists and has correct values
2. Restart the development server
3. Clear browser cache
4. Check console logs for signature generation details

### If environment variables aren't loading:
1. Ensure `.env.local` is in the `skn-webapp` directory (not root)
2. Restart the development server completely
3. Check that variable names match exactly (including NEXT_PUBLIC_ prefix)

## 📞 Next Steps

1. **Create the `.env.local` file** with your credentials
2. **Restart the development server**
3. **Test the payment flow**
4. **Monitor console logs** for any remaining issues

The signature generation issue should now be resolved, and PayFast should accept your payment requests without the "400 Bad Request" error.
