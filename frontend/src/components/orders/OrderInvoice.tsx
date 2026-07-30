"use client";

import Image from "next/image";
import type { ApiOrder } from "@/services/types";
import { formatPrice } from "@/lib/utils";
import { mediaUrl } from "@/lib/api";

function money(value: number | string) {
  return formatPrice(Number(value));
}

function paymentLabel(method: string) {
  if (method.toLowerCase() === "cod") return "Cash on Delivery";
  if (method.toLowerCase() === "razorpay") return "Razorpay";
  return method;
}

type Props = {
  order: ApiOrder;
};

export default function OrderInvoice({ order }: Props) {
  const invoiceDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="order-invoice-print" id="order-invoice-print">
      <header className="invoice-header">
        <div>
          <p className="invoice-brand">Classic Way</p>
          <p className="invoice-tagline">Fashion Store</p>
        </div>
        <div className="invoice-meta">
          <p className="invoice-title">Tax Invoice</p>
          <p>Invoice #: CW-INV-{order.order_number}</p>
          <p>Order #: {order.order_number}</p>
          <p>Date: {invoiceDate}</p>
          <p className="capitalize">Status: {order.status.replace(/_/g, " ")}</p>
        </div>
      </header>

      <section className="invoice-parties">
        <div>
          <h3>Bill / Ship To</h3>
          <p className="font-medium">{order.shipping_name || "Customer"}</p>
          {order.shipping_phone && <p>{order.shipping_phone}</p>}
          {order.shipping_line1 && <p>{order.shipping_line1}</p>}
          {order.shipping_line2 && <p>{order.shipping_line2}</p>}
          <p>
            {[order.shipping_city, order.shipping_state, order.shipping_postal_code]
              .filter(Boolean)
              .join(", ")}
          </p>
          {order.shipping_country && <p>{order.shipping_country}</p>}
        </div>
        <div>
          <h3>From</h3>
          <p className="font-medium">Classic Way</p>
          <p>Quality fashion &amp; everyday essentials</p>
          <p>Payment: {paymentLabel(order.payment_method)}</p>
          {order.coupon_code && <p>Coupon: {order.coupon_code}</p>}
        </div>
      </section>

      <table className="invoice-items">
        <thead>
          <tr>
            <th>Item</th>
            <th className="num">Qty</th>
            <th className="num">Price</th>
            <th className="num">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id}>
              <td>
                <div className="invoice-item-row">
                  <span className="invoice-thumb">
                    <Image
                      src={mediaUrl(item.product_image)}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </span>
                  <span>{item.name}</span>
                </div>
              </td>
              <td className="num">{item.quantity}</td>
              <td className="num">{money(item.unit_price)}</td>
              <td className="num">{money(item.line_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="invoice-totals">
        <div className="invoice-totals-box">
          <div>
            <span>Subtotal</span>
            <span>{money(order.subtotal)}</span>
          </div>
          <div>
            <span>Shipping</span>
            <span>
              {Number(order.shipping_amount) === 0 ? "Free" : money(order.shipping_amount)}
            </span>
          </div>
          {Number(order.tax_amount) > 0 && (
            <div>
              <span>Tax</span>
              <span>{money(order.tax_amount)}</span>
            </div>
          )}
          {Number(order.discount_amount) > 0 && (
            <div>
              <span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}</span>
              <span>−{money(order.discount_amount)}</span>
            </div>
          )}
          <div className="invoice-grand">
            <span>Total ({order.currency})</span>
            <span>{money(order.total)}</span>
          </div>
        </div>
      </section>

      {order.notes && (
        <p className="invoice-notes">
          <strong>Notes:</strong> {order.notes}
        </p>
      )}

      <footer className="invoice-footer">
        Thank you for shopping with Classic Way.
      </footer>
    </div>
  );
}
