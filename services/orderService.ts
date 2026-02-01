import { supabase } from './supabase';
import { Order } from '../types';

export const saveOrderToSupabase = async (order: Order) => {
    try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // 1. Insert into orders table
        const { error: orderError } = await supabase
            .from('orders')
            .insert({
                id: order.id,
                user_id: user.id, // Privacy: Link to user
                customer_name: order.customerName,
                shipping_number: order.shippingNumber,
                shipping_company: order.shippingCompany,
                date: order.date,
                delivery_date: order.deliveryDate || null,
                city: order.city,
                total: order.total,
                product_summary: order.productSummary,
                phone_number: order.phoneNumber,
                status: order.status || 'Pendiente',
                payment_status: order.paymentStatus || 'Pendiente de pago',
                address: order.address || null,
                notes: order.notes || null
            });

        if (orderError) {
            console.error('Error saving order to Supabase:', orderError);
            throw orderError;
        }

        // 2. Insert items if they exist
        if (order.items && order.items.length > 0) {
            const itemsToInsert = order.items.map(item => ({
                order_id: order.id,
                user_id: user.id, // Privacy: Link to user
                product_id: item.productId,
                product_name: item.productName,
                quantity: item.quantity,
                unit_price: item.unitPrice
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(itemsToInsert);

            if (itemsError) {
                console.error('Error saving order items to Supabase:', itemsError);
                // We might want to rollback here or at least log it
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Unexpected error saving order:', error);
        return { success: false, error };
    }
};

export const saveOrdersToSupabase = async (orders: Order[]) => {
    const results = await Promise.all(orders.map(order => saveOrderToSupabase(order)));
    const failed = results.filter(r => !r.success);

    if (failed.length > 0) {
        console.error(`${failed.length} orders failed to save.`);
        return { success: false, failedCount: failed.length };
    }
    return { success: true };
};
