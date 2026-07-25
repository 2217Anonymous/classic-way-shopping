"use client";

import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Container from "@/components/ui/Container";
import QuantityInput from "@/components/ui/QuantityInput";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  removeCartItem,
  updateCartQty,
  selectCartItems,
  selectCartTotal,
  clearCartRemote,
  clearCart,
} from "@/store/slices/cartSlice";
import { formatPrice } from "@/lib/utils";

export default function CartPageContent() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);

  const handleClear = () => {
    void dispatch(clearCartRemote());
    dispatch(clearCart());
  };

  return (
    <>
      <Breadcrumb title="Cart" items={[{ label: "Cart" }]} />
      <Container className="pb-16">
        {items.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-bb-border rounded-xl">
            <i className="ri-shopping-cart-line text-5xl text-bb-muted mb-4" />
            <p className="text-bb-muted mb-4">Your cart is empty.</p>
            <Link href="/shop/left-sidebar-col-3" className="bb-btn bb-btn-1">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto border border-bb-border rounded-xl mb-8">
              <table className="w-full text-sm">
                <thead className="bg-bb-soft border-b border-bb-border">
                  <tr>
                    <th className="text-left p-4 font-medium">Product</th>
                    <th className="text-left p-4 font-medium hidden sm:table-cell">Price</th>
                    <th className="text-left p-4 font-medium">Quantity</th>
                    <th className="text-left p-4 font-medium">Subtotal</th>
                    <th className="p-4 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={`${item.id}-${item.selectedSize ?? ""}`} className="border-b border-bb-border last:border-0">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-bb-soft shrink-0">
                            <Image src={item.image} alt={item.title} fill className="object-cover" sizes="64px" />
                          </div>
                          <div>
                            <Link href={`/product/${item.slug}`} className="font-medium hover:text-bb-primary">
                              {item.title}
                            </Link>
                            {item.selectedSize && (
                              <p className="text-xs text-bb-muted mt-1">Size: {item.selectedSize}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">{formatPrice(item.price)}</td>
                      <td className="p-4">
                        <QuantityInput
                          value={item.quantity}
                          onChange={(qty) =>
                            void dispatch(
                              updateCartQty({
                                id: item.id,
                                quantity: qty,
                                selectedSize: item.selectedSize,
                                cartItemId: item.cartItemId,
                              })
                            )
                          }
                        />
                      </td>
                      <td className="p-4 font-medium">{formatPrice(item.price * item.quantity)}</td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() =>
                            void dispatch(
                              removeCartItem({
                                id: item.id,
                                selectedSize: item.selectedSize,
                                cartItemId: item.cartItemId,
                              })
                            )
                          }
                          className="text-bb-muted hover:text-bb-danger transition-colors"
                          aria-label="Remove item"
                        >
                          <i className="ri-close-line text-lg" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <button type="button" onClick={handleClear} className="bb-btn bb-btn-2">
                Clear Cart
              </button>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                <p className="text-lg font-semibold">
                  Total: <span className="text-bb-primary">{formatPrice(total)}</span>
                </p>
                <Link href="/checkout" className="bb-btn bb-btn-1 w-full sm:w-auto text-center">
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </Container>
    </>
  );
}
