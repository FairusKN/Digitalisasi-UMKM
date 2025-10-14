import type { Product } from '../../types';

type ReceiptItem = { product: Product; quantity: number };

type Receipt = {
  customerName: string;
  items: ReceiptItem[];
  total: number;
  paymentMethod?: string;
  paidAmount?: number;
  takeaway?: boolean;
  note?: string;
  createdAt?: string;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount);
};

const getPaymentMethodDisplay = (method?: string) => {
  switch (method?.toLowerCase()) {
    case 'cash':
      return 'Cash';
    case 'bank':
    case 'debit':
      return 'Kartu Debit';
    case 'qris':
      return 'QRIS';
    default:
      return 'Cash';
  }
};

export default function PrintReceipt({ receipt, cashierName }: { receipt: Receipt; cashierName?: string }) {
  if (!receipt) return null;

  return (
    <div>
      <div className="text-base font-semibold text-crimson flex items-center gap-2">
        <span className="inline-block">👤</span>
        Customer: <span className="font-bold text-gray-800">{receipt.customerName}</span>
      </div>

      {cashierName && (
        <div className="mt-3 text-xs text-gray-500 text-left">Dilayani oleh: <span className="font-medium text-gray-700">{cashierName}</span></div>
      )}

      <div className="text-xs text-gray-500 mt-1">{receipt.items.length} item(s)</div>

      <div className="mt-3">
        <table className="w-full text-sm">
          <tbody>
            {receipt.items.map((item, idx) => (
              <tr key={idx} className="border-b last:border-b-0">
                <td className="py-1 pr-2 text-gray-700 whitespace-nowrap">{item.quantity}x <span className="font-medium">{item.product.name}</span></td>
                <td className="py-1 text-right font-semibold text-crimson whitespace-nowrap">{formatCurrency(item.product.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-3 border-t flex items-center justify-between mt-3">
        <span className="font-bold text-crimson text-base flex items-center gap-1">
          <span className="inline-block">💰</span> Total
        </span>
        <span className="font-bold text-crimson text-base">{formatCurrency(receipt.total)}</span>
      </div>

      {receipt.paymentMethod && (
        <div className="flex flex-col text-xs pt-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Metode:</span>
            <span className="font-semibold text-gray-700">{getPaymentMethodDisplay(receipt.paymentMethod)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-gray-500">Jenis Pesanan:</span>
            <span className="font-semibold text-gray-700">{receipt.takeaway ? 'Takeaway' : 'Makan di tempat'}</span>
          </div>
        </div>
      )}

      {receipt.paymentMethod === 'cash' && (
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-gray-500">Dibayar:</span>
          <span className="font-semibold text-gray-700">{formatCurrency(receipt.paidAmount || 0)}</span>
        </div>
      )}

      {receipt.paymentMethod === 'cash' && (
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-green-600 font-semibold">Kembalian:</span>
          <span className="font-semibold text-green-600">{formatCurrency((receipt.paidAmount || 0) - (receipt.total || 0))}</span>
        </div>
      )}

      {receipt.note && (
        <div className="mt-2 bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded text-xs text-yellow-800">
          <span className="font-semibold mr-1">📝 Catatan:</span>{receipt.note}
        </div>
      )}

      <div className="pt-4 text-center text-xs text-gray-400">
        <div className="font-semibold text-crimson">Terima Kasih Atas Kunjungan Anda! 🙏</div>
        <div>Selamat Menikmati Hidangan Anda</div>
        <div>Sampai Jumpa Kembali! 😊</div>
      </div>
    </div>
  );
}
