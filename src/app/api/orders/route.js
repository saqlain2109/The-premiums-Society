import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { generateOrderNumber } from '@/lib/utils';

export async function GET(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
        { city: { contains: search } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' }, // Chronological newest first
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      deliveryAddress,
      city,
      postalCode,
      notes,
      items = [],
    } = body;

    // Validation
    if (!customerName || !customerName.trim()) {
      return NextResponse.json({ error: 'Customer Name is required.' }, { status: 400 });
    }
    if (!customerPhone || !customerPhone.trim()) {
      return NextResponse.json({ error: 'Customer Mobile / WhatsApp number is required.' }, { status: 400 });
    }
    if (!deliveryAddress || !deliveryAddress.trim()) {
      return NextResponse.json({ error: 'Delivery Address is required.' }, { status: 400 });
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty. Please add items before placing order.' }, { status: 400 });
    }

    const cleanCity = (city && city.trim()) || '';

    // Fetch store settings for shipping charges & phone
    const settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } });
    const targetPhone = (settings?.defaultRecipient === 'secondary' && settings?.secondaryPhone)
      ? settings.secondaryPhone
      : (settings?.primaryPhone || '+919920517851');

    // Clean target WhatsApp number (digits only for wa.me URL)
    const cleanPhoneDigits = targetPhone.replace(/[^0-9]/g, '');

    // Transaction to validate stock, decrement variant quantities, and create order
    const result = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const verifiedItems = [];

      for (const item of items) {
        const { variantId, quantity, productId } = item;
        const requestedQty = parseInt(quantity, 10) || 1;

        if (!variantId) {
          throw new Error(`Variant selection missing for item "${item.productName || 'Unknown'}"`);
        }

        const variant = await tx.productVariant.findUnique({
          where: { id: variantId },
          include: { product: true },
        });

        if (!variant) {
          throw new Error(`The selected size/colour for "${item.productName}" is no longer available.`);
        }

        if (variant.product.status !== 'PUBLISHED') {
          throw new Error(`Product "${variant.product.name}" is currently unavailable.`);
        }

        if (variant.stock < requestedQty) {
          throw new Error(`Insufficient stock for "${variant.product.name}" (${variant.colour} - ${variant.size}). Only ${variant.stock} left in stock.`);
        }

        // Decrement stock
        await tx.productVariant.update({
          where: { id: variantId },
          data: { stock: variant.stock - requestedQty },
        });

        const effectivePrice = variant.price !== null ? variant.price : variant.product.sellingPrice;
        const lineTotal = effectivePrice * requestedQty;
        subtotal += lineTotal;

        verifiedItems.push({
          productId: variant.product.id,
          productName: variant.product.name,
          productImage: variant.product.mainImage,
          sku: variant.sku || variant.product.sku,
          colour: variant.colour,
          size: variant.size,
          quantity: requestedQty,
          unitPrice: effectivePrice,
          totalPrice: lineTotal,
        });
      }

      // Calculate shipping
      const freeThreshold = settings?.freeShippingThreshold || 2000;
      const baseShipping = settings?.shippingCharge || 100;
      const shippingCharge = subtotal >= freeThreshold ? 0 : baseShipping;
      const total = subtotal + shippingCharge;

      // Unique Order Number
      const orderNumber = generateOrderNumber();

      const order = await tx.order.create({
        data: {
          orderNumber,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          deliveryAddress: deliveryAddress.trim(),
          city: cleanCity,
          postalCode: postalCode?.trim() || null,
          notes: notes?.trim() || null,
          subtotal,
          shippingCharge,
          total,
          status: 'PENDING',
          items: {
            create: verifiedItems,
          },
        },
        include: { items: true },
      });

      return { order, subtotal, shippingCharge, total };
    });

    const currencySym = settings?.currencySymbol || '₹';

    // Format professional WhatsApp direct order message
    let waMessage = `*NEW ORDER - THE PREMIUMS SOCIETY*\n`;
    waMessage += `==========================\n`;
    waMessage += `*Order ID:* ${result.order.orderNumber}\n`;
    waMessage += `*Date:* ${new Date().toLocaleDateString('en-GB')}\n\n`;
    waMessage += `*CUSTOMER DETAILS:*\n`;
    waMessage += `Name: ${result.order.customerName}\n`;
    waMessage += `Phone: ${result.order.customerPhone}\n`;
    waMessage += `Delivery Address: ${result.order.deliveryAddress}`;
    if (result.order.city && result.order.city.trim()) {
      waMessage += `, ${result.order.city}`;
    }
    if (result.order.postalCode) {
      waMessage += ` (PIN: ${result.order.postalCode})`;
    }
    waMessage += `\n`;
    if (result.order.notes) {
      waMessage += `Special Notes: ${result.order.notes}\n`;
    }
    waMessage += `\n*ORDER ITEMS:*\n`;
    result.order.items.forEach((item, idx) => {
      waMessage += `${idx + 1}. *${item.productName}*\n`;
      waMessage += `   Variant: ${item.colour} | Size: ${item.size}\n`;
      waMessage += `   Qty: ${item.quantity} x ${currencySym}${item.unitPrice} = ${currencySym}${item.totalPrice}\n`;
    });
    waMessage += `--------------------------\n`;
    waMessage += `*Subtotal:* ${currencySym}${result.subtotal}\n`;
    waMessage += `*Delivery Fee:* ${result.shippingCharge === 0 ? 'FREE' : `${currencySym}${result.shippingCharge}`}\n`;
    waMessage += `*Total Amount:* *${currencySym}${result.total}*\n`;
    waMessage += `==========================\n`;
    waMessage += `Please confirm my order and share delivery schedule. Thank you!`;

    const encodedMessage = encodeURIComponent(waMessage);
    const whatsappUrl = `https://wa.me/${cleanPhoneDigits}?text=${encodedMessage}`;

    return NextResponse.json({
      success: true,
      order: result.order,
      whatsappUrl,
      whatsappMessage: waMessage,
    }, { status: 201 });
  } catch (error) {
    console.error('Checkout order error:', error);
    return NextResponse.json({ error: error.message || 'Failed to place order.' }, { status: 400 });
  }
}
