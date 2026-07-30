import OrderDetailPageContent from "@/components/pages/OrderDetailPageContent";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailPageContent orderId={id} />;
}
