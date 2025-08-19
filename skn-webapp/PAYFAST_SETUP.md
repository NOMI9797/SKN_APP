# PayFast Integration Setup Guide

## 🚀 Overview

This guide explains how to set up PayFast payment integration for SKN with JazzCash and EasyPaisa payment methods.

## 🔧 Configuration

### 1. Dependencies

Install the required crypto library for MD5 signature generation:

```bash
npm install crypto-js @types/crypto-js
```

### 2. Environment Variables

Add these to your `.env.local` file:

```bash
# PayFast Configuration
NEXT_PUBLIC_PAYFAST_SANDBOX_MERCHANT_ID=10000100
NEXT_PUBLIC_PAYFAST_SANDBOX_MERCHANT_KEY=46f0cd694581a
NEXT_PUBLIC_PAYFAST_SANDBOX_PASS_PHRASE=jtKNOGTbFmFaUZV

# Production PayFast (fill these when going live)
NEXT_PUBLIC_PAYFAST_MERCHANT_ID=
NEXT_PUBLIC_PAYFAST_MERCHANT_KEY=
NEXT_PUBLIC_PAYFAST_PASS_PHRASE=

# PayFast URLs
NEXT_PUBLIC_PAYFAST_RETURN_URL=http://localhost:3000/payment/success
NEXT_PUBLIC_PAYFAST_CANCEL_URL=http://localhost:3000/payment/cancel
NEXT_PUBLIC_PAYFAST_NOTIFY_URL=http://localhost:3000/api/payment/webhook
```

### 2. PayFast Subscription Types

PayFast requires specific integer values for `subscription_type`:

- **`1`** = Once-off payment (what we use for registration fee)
- **`2`** = Subscription payment
- **`3`** = Token payment

**Important**: The `subscription_type` field must be an integer, not a string.

### 3. Required Fields for Once-off Payments

When using `subscription_type: 1`, PayFast requires these additional fields:

- **`frequency: 3`** = Payment frequency (must be at least 3 for PayFast)
- **`cycles: 1`** = Number of payment cycles (1 for once-off)
- **`m_payment_id`** = Unique merchant payment identifier
- **`name_first`** and **`name_last`** = Customer name fields

### 4. Sandbox Testing

#### **Sandbox Credentials (Development)**
- **Merchant ID**: `10000100`
- **Merchant Key**: `46f0cd694581a`
- **Pass Phrase**: `jtKNOGTbFmFaUZV`
- **Base URL**: `https://sandbox.payfast.co.za`

#### **Test Payment Methods**
- **JazzCash**: Use test mobile numbers
- **EasyPaisa**: Use test wallet credentials

## 🧪 Testing in Development

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test Payment Flow
1. **Register/Login** to your account
2. **Go to Dashboard** - you'll see the payment banner
3. **Click "Pay Now"** - redirects to `/payment`
4. **Select Payment Method** (JazzCash or EasyPaisa)
5. **Agree to Terms** and click "Pay 850 PKR via [Method]"
6. **Redirected to PayFast** sandbox payment page
7. **Complete test payment** using sandbox credentials
8. **Return to success page** at `/payment/success`

### 3. Test Scenarios
- ✅ **Successful Payment**: Complete payment flow
- ❌ **Cancelled Payment**: Cancel during payment process
- 🔄 **Failed Payment**: Test error handling

### 4. Signature Testing

To verify signature generation, compare with PayFast's official test data:

```javascript
// Test data from PayFast documentation
const testData = {
  merchant_id: '10000100',
  merchant_key: '46f0cd694581a',
  amount: '100.00',
  item_name: 'Test Item',
  subscription_type: 1,
  frequency: 3,
  cycles: 1,
  m_payment_id: 'TEST_123',
  name_first: 'Test',
  name_last: 'User'
};

// Expected signature format: 32-character MD5 hash
```

### 5. Debug Console Output

## 🌐 Production Setup

### 1. Get Live Credentials
1. **Sign up** at [PayFast](https://www.payfast.co.za)
2. **Complete verification** process
3. **Get live credentials** from merchant dashboard
4. **Update environment variables** with live values

### 2. Update Environment Variables
```bash
# Replace sandbox with live values
NEXT_PUBLIC_PAYFAST_MERCHANT_ID=your_live_merchant_id
NEXT_PUBLIC_PAYFAST_MERCHANT_KEY=your_live_merchant_key
NEXT_PUBLIC_PAYFAST_PASS_PHRASE=your_live_passphrase

# Update URLs for production
NEXT_PUBLIC_PAYFAST_RETURN_URL=https://yourdomain.com/payment/success
NEXT_PUBLIC_PAYFAST_CANCEL_URL=https://yourdomain.com/payment/cancel
NEXT_PUBLIC_PAYFAST_NOTIFY_URL=https://yourdomain.com/api/payment/webhook
```

### 3. SSL Certificate
- **Production requires HTTPS**
- **Valid SSL certificate** is mandatory
- **Webhook endpoints** must be publicly accessible

## 🔐 Security Features

### 1. Signature Validation
- **MD5 hash verification** for payment responses
- **Passphrase protection** for additional security
- **Custom field tracking** for user identification

### 2. Signature Generation Process

PayFast signature generation follows these exact steps:

1. **Include Only Non-Empty Fields**: Remove any key with an empty value
2. **Sort Alphabetically**: Sort remaining fields by key name (A → Z)
3. **URL-Encode Values**: Use `encodeURIComponent()` for proper encoding
4. **Build Query String**: Create `key=value&key=value` format
5. **Append Passphrase**: Add `&passphrase=YOUR_PASSPHRASE` if set
6. **Generate MD5**: Create 32-character MD5 hash of final string

**Important Rules:**
- ❌ **Never include** the `signature` field when generating a new one
- ❌ **Never include** fields with empty values
- ✅ **Always sort** fields alphabetically by key
- ✅ **Always use** exactly 2 decimal places for amount (e.g., `100.00`)
- ✅ **Always URL-encode** values properly

**Example:**
```javascript
// Input data
{
  "amount": "100.00",
  "item_name": "Book",
  "email_address": "", // Empty - will be excluded
  "custom_str1": "user123"
}

// 1. Filter non-empty fields
{
  "amount": "100.00",
  "item_name": "Book", 
  "custom_str1": "user123"
}

// 2. Sort alphabetically
// 3. Build query string
"amount=100.00&custom_str1=user123&item_name=Book"

// 4. Append passphrase
"amount=100.00&custom_str1=user123&item_name=Book&passphrase=secret123"

// 5. Generate MD5 hash
"a5d41402abc4b2a76b9719d911017c592"
```

### 3. Data Protection
- **No sensitive data stored** in your database
- **Payment details handled** by PayFast securely
- **Custom fields only** for tracking purposes

## 📱 Payment Methods

### 1. JazzCash
- **Mobile wallet** payment
- **SMS verification** required
- **Instant processing**

### 2. EasyPaisa
- **Mobile wallet** payment
- **PIN verification** required
- **Real-time updates**

## 🔄 Webhook Implementation

### 1. Create Webhook Endpoint
```typescript
// pages/api/payment/webhook.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const paymentData = req.body;
    
    // Validate payment signature
    // Update user payment status
    // Send confirmation email
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}
```

### 2. Webhook Security
- **IP whitelisting** (PayFast IPs only)
- **Signature validation** for each request
- **Idempotency handling** for duplicate requests

## 🚨 Error Handling

### 1. Common Issues
- **Invalid merchant credentials**
- **Network connectivity problems**
- **Payment method restrictions**
- **Amount validation errors**

### 2. User Experience
- **Clear error messages** for users
- **Retry mechanisms** for failed payments
- **Support contact** information
- **Payment status tracking**

## 📊 Monitoring & Analytics

### 1. Payment Tracking
- **Payment success rates**
- **Method preference** analysis
- **Error pattern** identification
- **Revenue reporting**

### 2. Logging
- **Payment attempts** logging
- **Error tracking** and alerting
- **Performance monitoring**
- **Security audit** trails

## 🔧 Troubleshooting

### 1. Payment Not Processing
- ✅ Check merchant credentials
- ✅ Verify environment variables
- ✅ Confirm SSL certificate (production)
- ✅ Check network connectivity

### 2. Common PayFast Errors

#### **"frequency: The frequency field is required when subscription type is 1"**
- **Solution**: Ensure `frequency: 3` and `cycles: 1` are included
- **Required fields**: `subscription_type: 1`, `frequency: 3`, `cycles: 1`

#### **"signature: Generated signature does not match submitted signature"**
- **Solution**: Check signature generation process
- **Debug steps**:
  1. Verify excluded fields are not in signature calculation
  2. Check field sorting is alphabetical
  3. Ensure passphrase is correct
  4. Verify all values are properly encoded
- **Common causes**: Wrong field exclusion, incorrect sorting, missing passphrase

#### **"signature: The signature must be 32 characters"**
- **Solution**: Use proper MD5 hash generation (crypto-js library)
- **Format**: 32-character hexadecimal string

#### **"subscription_type: The subscription type must be an integer"**
- **Solution**: Use `subscription_type: 1` (integer), not `'once-off'` (string)

#### **"Invalid merchant credentials"**
- **Solution**: Verify `MERCHANT_ID` and `MERCHANT_KEY` in environment variables

### 3. Webhook Not Receiving
- ✅ Verify endpoint URL
- ✅ Check server accessibility
- ✅ Validate IP whitelisting
- ✅ Test endpoint manually

### 3. Test Mode Issues
- ✅ Confirm sandbox environment
- ✅ Use test payment methods
- ✅ Check sandbox credentials
- ✅ Verify return URLs

## 📞 Support

### 1. PayFast Support
- **Email**: support@payfast.co.za
- **Phone**: +27 21 300 0000
- **Documentation**: [PayFast Docs](https://developers.payfast.co.za/)

### 2. Development Issues
- **Check console logs** for errors
- **Verify environment** configuration
- **Test with sandbox** credentials first
- **Review network** requests in browser

## 🎯 Next Steps

1. **Test sandbox integration** thoroughly
2. **Implement webhook handling** for payment confirmations
3. **Add payment status** updates to user dashboard
4. **Set up monitoring** and error tracking
5. **Prepare production** deployment checklist

---

**Note**: This integration uses PayFast's standard payment flow. For advanced features like subscriptions or recurring payments, additional configuration may be required. 