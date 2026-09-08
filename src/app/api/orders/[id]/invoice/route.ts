import { auth, hasApiPermission } from "@/lib/auth/auth";
import { canDownloadInvoice } from "@/lib/orders/status";
import { buildTaxInvoiceHtml } from "@/lib/orders/build-tax-invoice";
import { getOrderForInvoice } from "@/lib/db/orders";
import type { Order } from "@/types/order";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.supabaseId ?? session.user.id;

  const order = await getOrderForInvoice(id);
  if (!order) {
    return new Response("Order not found", { status: 404 });
  }

  const typedOrder = order as Order;

  if (typedOrder.user_id !== userId && !hasApiPermission(session, "orders")) {
    return new Response("Forbidden", { status: 403 });
  }

  if (!canDownloadInvoice(typedOrder)) {
    return new Response(
      "Invoice is available only after payment is completed and the order is delivered.",
      { status: 403 }
    );
  }

  const origin = new URL(request.url).origin;
  const html = buildTaxInvoiceHtml(typedOrder, origin);

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
