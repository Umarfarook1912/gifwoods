import { auth, hasApiPermission } from "@/lib/auth/auth";
import { formatPrice, formatDate, formatOrderId } from "@/lib/utils/formatters";
import { getPaymentStatus, canDownloadInvoice } from "@/lib/orders/status";
import type { Order } from "@/types/order";
import { NextResponse } from "next/server";
import { getOrderForInvoice } from "@/lib/db/orders";

export async function GET(
  _request: Request,
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

  const addr = typedOrder.shipping_address;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Invoice - ${formatOrderId(typedOrder.id)}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @media print {
          .no-print { display: none !important; }
          body { background-color: white !important; color: black !important; }
        }
      </style>
    </head>
    <body class="bg-gray-50 text-gray-800 font-sans min-h-screen py-10">
      <div class="max-w-4xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-8 sm:p-12">
        <div class="no-print mb-8 flex justify-between items-center bg-gray-100 p-4 rounded-lg">
          <span class="text-sm font-medium text-gray-600">Digital Invoice</span>
          <div class="flex gap-2">
            <button onclick="window.print()" class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black text-sm font-bold rounded-lg transition-colors">Print Invoice</button>
            <button onclick="window.close()" class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-semibold rounded-lg transition-colors">Close Window</button>
          </div>
        </div>
        <div class="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
          <div>
            <h1 class="text-3xl font-bold tracking-tight text-gray-900">GIFWOODS</h1>
            <p class="text-sm text-gray-500 mt-1">Premium Personalized Gifts & Decor</p>
            <div class="text-xs text-gray-400 mt-4 leading-relaxed">
              Gifwoods Inc.<br>123 Woodworkers Lane, Craftsville<br>Karnataka, India - 560001<br>support@gifwoods.in
            </div>
          </div>
          <div class="text-right">
            <span class="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-green-100 text-green-800">${typedOrder.status}</span>
            <p class="text-2xl font-semibold text-gray-900 mt-2">${formatOrderId(typedOrder.id)}</p>
            <p class="text-xs text-gray-400 mt-1">Date: ${formatDate(typedOrder.created_at)}</p>
            <p class="text-xs text-gray-400">Payment: ${getPaymentStatus(typedOrder)}</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 class="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Billed To</h2>
            <p class="font-semibold text-gray-800">${addr.name}</p>
            <p class="text-sm text-gray-500 mt-1 leading-relaxed">
              ${addr.line1}${addr.line2 ? `, ${addr.line2}` : ""}<br>
              ${addr.city}, ${addr.state} — ${addr.pincode}<br>${addr.country}
            </p>
            <p class="text-sm text-gray-500 mt-2">Phone: ${addr.phone}</p>
          </div>
          <div class="text-right">
            <h2 class="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Delivery Information</h2>
            <p class="text-sm text-gray-500">Shipped via Gifwoods Express</p>
            <p class="text-sm text-gray-500 mt-1">Order status: <span class="capitalize font-semibold">${typedOrder.status}</span></p>
          </div>
        </div>
        <table class="w-full text-left border-collapse mb-8">
          <thead>
            <tr class="border-b border-gray-200 text-xs font-bold uppercase text-gray-400 tracking-wider">
              <th class="py-3">Product</th>
              <th class="py-3 text-right">Price</th>
              <th class="py-3 text-center">Qty</th>
              <th class="py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            ${typedOrder.order_items?.map((item) => `
              <tr class="text-sm">
                <td class="py-4">
                  <span class="font-medium text-gray-800">${item.product?.name || "Product"}</span>
                  ${item.customization ? `<div class="text-xs text-yellow-600 mt-1">Custom: ${Object.entries(item.customization).map(([k, v]) => `${k}: ${v}`).join(", ")}</div>` : ""}
                </td>
                <td class="py-4 text-right">${formatPrice(item.unit_price)}</td>
                <td class="py-4 text-center">${item.quantity}</td>
                <td class="py-4 text-right font-medium">${formatPrice(item.unit_price * item.quantity)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div class="flex justify-end">
          <div class="w-64 space-y-3 text-sm text-gray-600">
            <div class="flex justify-between"><span>Subtotal</span><span class="font-medium text-gray-800">${formatPrice(typedOrder.subtotal)}</span></div>
            <div class="flex justify-between"><span>Shipping</span><span class="font-medium text-gray-800">${typedOrder.shipping_cost === 0 ? "Free" : formatPrice(typedOrder.shipping_cost)}</span></div>
            <div class="flex justify-between pt-3 border-t border-gray-200 text-base font-bold text-gray-900"><span>Total</span><span>${formatPrice(typedOrder.total)}</span></div>
          </div>
        </div>
        <div class="border-t border-gray-100 pt-8 mt-12 text-center text-xs text-gray-400 leading-relaxed">
          <p>Thank you for shopping at Gifwoods! We appreciate your business.</p>
          <p class="mt-1">For any queries regarding this invoice, please email support@gifwoods.in</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
