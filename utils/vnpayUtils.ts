import { supabase } from '~/lib/supabase';

export interface CreatePaymentParams {
  orderId: string;
  amount: number;
  orderInfo: string;
  returnUrl: string;
  userId: string;
  bankCode?: string;
}

export interface PaymentStatus {
  orderId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  vnpayResponse?: any;
}

/**
 * Create a payment request using VNPay
 */
export async function createVNPayPayment(params: CreatePaymentParams) {
  try {
    const { data, error } = await supabase.functions.invoke(
      'vnpay-create-payment',
      {
        body: params,
      }
    );

    if (error) {
      throw new Error(`Payment creation failed: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error creating VNPay payment:', error);
    throw error;
  }
}

/**
 * Get payment status by order ID
 */
export async function getPaymentStatus(
  orderId: string
): Promise<PaymentStatus | null> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error || !data) {
      console.error('Error fetching payment status:', error);
      return null;
    }

    return {
      orderId: data.order_id,
      status: data.status,
      amount: parseFloat(data.amount),
      vnpayResponse: data.vnpay_response,
    };
  } catch (error) {
    console.error('Error getting payment status:', error);
    return null;
  }
}

/**
 * Query VNPay for transaction status
 */
export async function queryVNPayTransaction(
  orderId: string,
  transDate: string
) {
  try {
    const { data, error } = await supabase.functions.invoke('vnpay-query', {
      body: {
        orderId,
        transDate,
      },
    });

    if (error) {
      throw new Error(`Transaction query failed: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error querying VNPay transaction:', error);
    throw error;
  }
}

/**
 * Process refund for a payment
 */
export async function refundVNPayPayment(
  orderId: string,
  transactionDate: string,
  amount: number,
  message?: string
) {
  try {
    const { data, error } = await supabase.functions.invoke('vnpay-refund', {
      body: {
        orderId,
        transactionDate,
        amount,
        message,
      },
    });

    if (error) {
      throw new Error(`Refund failed: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error processing VNPay refund:', error);
    throw error;
  }
}

/**
 * Get VNPay response message based on response code
 */
export function getVNPayResponseMessage(responseCode: string): string {
  const messages: { [key: string]: string } = {
    '00': 'Giao dịch thành công',
    '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
    '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
    '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
    '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
    '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
    '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
    '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
    '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
    '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
    '75': 'Ngân hàng thanh toán đang bảo trì.',
    '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
    '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)',
  };

  return messages[responseCode] || 'Không xác định được trạng thái giao dịch';
}
