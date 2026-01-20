from flask import Blueprint, request, jsonify
import razorpay
import os
from dotenv import load_dotenv
import hmac
import hashlib

# Load environment variables
load_dotenv()

# Create blueprint
payment_bp = Blueprint('payment', __name__, url_prefix='/api/payment')

# Initialize Razorpay client
razorpay_client = razorpay.Client(
    auth=(
        os.getenv('RAZORPAY_KEY_ID', 'rzp_test_RKhGt5NotbNpXQ'),
        os.getenv('RAZORPAY_KEY_SECRET', 'Ie2lyGpJnEYRZbBNsBRIEJg2')
    )
)

@payment_bp.route('/create-order', methods=['POST'])
def create_order():
    """Create a Razorpay order for credit purchase"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['amount', 'currency', 'credits', 'user_id']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        amount = int(data['amount'])  # Amount in paise
        currency = data['currency']
        credits = int(data['credits'])
        user_id = data['user_id']
        
        # Create Razorpay order
        order_data = {
            'amount': amount * 100,  # Convert to paise
            'currency': currency,
            'receipt': f'order_rcptid_{user_id}_{credits}',
            'notes': {
                'user_id': user_id,
                'credits': credits,
                'package_type': f'{credits}_credits'
            }
        }
        
        order = razorpay_client.order.create(data=order_data)
        
        return jsonify({
            'order_id': order['id'],
            'amount': order['amount'],
            'currency': order['currency'],
            'status': order['status']
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Order creation failed: {str(e)}"}), 500

@payment_bp.route('/verify-payment', methods=['POST'])
def verify_payment():
    """Verify Razorpay payment signature"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Verify payment signature
        generated_signature = hmac.new(
            os.getenv('RAZORPAY_KEY_SECRET', 'Ie2lyGpJnEYRZbBNsBRIEJg2').encode('utf-8'),
            f"{data['razorpay_order_id']}|{data['razorpay_payment_id']}".encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        if generated_signature == data['razorpay_signature']:
            # Payment is valid
            payment_details = razorpay_client.payment.fetch(data['razorpay_payment_id'])
            
            return jsonify({
                'valid': True,
                'payment_details': {
                    'id': payment_details['id'],
                    'order_id': payment_details['order_id'],
                    'status': payment_details['status'],
                    'amount': payment_details['amount'],
                    'currency': payment_details['currency'],
                    'method': payment_details['method'],
                    'created_at': payment_details['created_at']
                }
            }), 200
        else:
            return jsonify({
                'valid': False,
                'error': 'Invalid payment signature'
            }), 400
            
    except Exception as e:
        return jsonify({"error": f"Payment verification failed: {str(e)}"}), 500

@payment_bp.route('/webhook', methods=['POST'])
def webhook():
    """Handle Razorpay webhooks"""
    try:
        # Get the webhook payload and signature
        payload = request.get_data()
        signature = request.headers.get('X-Razorpay-Signature')
        
        if not signature:
            return jsonify({"error": "Missing signature"}), 400
        
        # Verify webhook signature
        webhook_secret = os.getenv('RAZORPAY_WEBHOOK_SECRET', '')
        if webhook_secret:
            expected_signature = hmac.new(
                webhook_secret.encode('utf-8'),
                payload,
                hashlib.sha256
            ).hexdigest()
            
            if not hmac.compare_digest(signature, expected_signature):
                return jsonify({"error": "Invalid signature"}), 400
        
        # Process webhook event
        event = request.get_json()
        event_type = event.get('event')
        
        if event_type == 'payment.captured':
            # Handle successful payment
            payment_data = event['payload']['payment']['entity']
            # Add your business logic here to update user credits
            print(f"Payment captured: {payment_data['id']}")
            
        elif event_type == 'payment.failed':
            # Handle failed payment
            payment_data = event['payload']['payment']['entity']
            print(f"Payment failed: {payment_data['id']}")
        
        return jsonify({"status": "success"}), 200
        
    except Exception as e:
        return jsonify({"error": f"Webhook processing failed: {str(e)}"}), 500

@payment_bp.route('/refund', methods=['POST'])
def create_refund():
    """Create a refund for a payment"""
    try:
        data = request.get_json()
        
        if 'payment_id' not in data:
            return jsonify({"error": "Payment ID is required"}), 400
        
        payment_id = data['payment_id']
        amount = data.get('amount')  # Optional, full refund if not specified
        
        refund_data = {}
        if amount:
            refund_data['amount'] = int(amount) * 100  # Convert to paise
        
        refund = razorpay_client.payment.refund(payment_id, refund_data)
        
        return jsonify({
            'refund_id': refund['id'],
            'payment_id': refund['payment_id'],
            'amount': refund['amount'],
            'status': refund['status']
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Refund creation failed: {str(e)}"}), 500

@payment_bp.route('/payment-details/<payment_id>', methods=['GET'])
def get_payment_details(payment_id):
    """Get payment details by payment ID"""
    try:
        payment = razorpay_client.payment.fetch(payment_id)
        
        return jsonify({
            'id': payment['id'],
            'order_id': payment['order_id'],
            'status': payment['status'],
            'amount': payment['amount'],
            'currency': payment['currency'],
            'method': payment['method'],
            'created_at': payment['created_at'],
            'description': payment.get('description', ''),
            'notes': payment.get('notes', {})
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to fetch payment details: {str(e)}"}), 500
