import { NextRequest, NextResponse } from 'next/server';
import { payfastPayment } from '../../../../lib/payfast';

export async function POST(request: NextRequest) {
  try {
    // Get the payment data from PayFast
    const paymentData = await request.formData();
    const data: Record<string, string> = {};
    
    // Convert FormData to object
    paymentData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log('=== PayFast Webhook Received ===');
    console.log('Payment data:', data);
    console.log('Payment status:', data.payment_status);
    console.log('Payment ID:', data.pf_payment_id);
    console.log('Merchant Payment ID:', data.m_payment_id);
    console.log('Amount:', data.amount_gross);
    console.log('Custom fields:', {
      custom_str1: data.custom_str1, // User ID
      custom_str2: data.custom_str2, // Payment method
      custom_str3: data.custom_str3, // Referral code
    });
    console.log('=====================================');

    // Basic validation
    if (!data.payment_status || !data.pf_payment_id) {
      console.error('Invalid payment data received');
      return NextResponse.json({ error: 'Invalid payment data' }, { status: 400 });
    }

    // Validate payment signature (optional but recommended)
    // You should implement proper signature validation here
    
    // Process payment based on status
    switch (data.payment_status.toLowerCase()) {
      case 'complete':
        console.log('✅ Payment completed successfully');
        // TODO: Update user payment status in database
        // TODO: Send confirmation email
        // TODO: Activate user account features
        break;
        
      case 'pending':
        console.log('⏳ Payment is pending');
        // TODO: Update payment status to pending
        break;
        
      case 'failed':
        console.log('❌ Payment failed');
        // TODO: Handle failed payment
        break;
        
      default:
        console.log('🔄 Payment status:', data.payment_status);
        break;
    }

    // Return success response to PayFast
    return NextResponse.json({ status: 'success' }, { status: 200 });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({ 
    message: 'PayFast webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}
