"use client";

import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Container from "@/components/ui/Container";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCompareItems, removeFromCompare, clearCompare } from "@/store/slices/compareSlice";
import { formatPrice } from "@/lib/utils";

export default function ComparePageContent() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCompareItems);

  return (
    <>
      <Breadcrumb title="Compare" items={[{ label: "Compare" }]} />
      <Container className="pb-16">
        {items.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-bb-border rounded-xl">
            <i className="ri-repeat-line text-5xl text-bb-muted mb-4" />
            <p className="text-bb-muted mb-4">No products to compare.</p>
            <Link href="/shop/left-sidebar-col-3" className="bb-btn bb-btn-1">
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-6">
              <button type="button" onClick={() => dispatch(clearCompare())} className="bb-btn bb-btn-2 text-sm">
                Clear Compare
              </button>
            </div>
            <div className="overflow-x-auto border border-bb-border rounded-xl">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-bb-border">
                    <th className="p-4 text-left font-medium bg-bb-soft w-32">Attribute</th>
                    {items.map((item) => (
                      <th key={item.id} className="p-4 text-center font-medium bg-bb-soft min-w-[180px]">
                        <div className="relative w-24 h-24 mx-auto rounded-lg overflow-hidden mb-3">
                          <Image src={item.image} alt={item.title} fill className="object-cover" sizes="96px" />
                        </div>
                        <Link href={`/product/${item.slug}`} className="hover:text-bb-primary line-clamp-2">
                          {item.title}
                        </Link>
                        <button
                          type="button"
                          onClick={() => dispatch(removeFromCompare(item.id))}
                          className="block mx-auto mt-2 text-xs text-bb-danger hover:underline"
                        >
                          Remove
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Price", render: (p: (typeof items)[0]) => formatPrice(p.price) },
                    { label: "Category", render: (p: (typeof items)[0]) => p.category },
                    { label: "Rating", render: (p: (typeof items)[0]) => `${p.rating}/5` },
                    { label: "Stock", render: (p: (typeof items)[0]) => `${p.stock} in stock` },
                    { label: "Unit", render: (p: (typeof items)[0]) => p.unit },
                  ].map((row) => (
                    <tr key={row.label} className="border-b border-bb-border">
                      <td className="p-4 font-medium bg-bb-soft/50">{row.label}</td>
                      {items.map((item) => (
                        <td key={item.id} className="p-4 text-center text-bb-muted">
                          {row.render(item)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Container>
    </>
  );
}
