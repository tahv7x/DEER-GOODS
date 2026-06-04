import express, { type Request, type Response } from 'express';
import supabase from '../config/db.js';
import { authenticate, isAdmin } from '../middlewares/authMidlleware.js';
import crypto from 'crypto';

const router = express.Router();

router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { items, totalAmount, paymentMethod, phone, shippingAddress } = req.body;
        
        if (!items || items.length === 0 || !totalAmount || !paymentMethod) {
            return res.status(400).json({ message: "Le panier, le montant et la méthode de paiement sont obligatoires." });
        }
        
        const orderId = crypto.randomUUID();
        const { data: order, error: orderError } = await supabase
            .from('Order')
            .insert([{
                id: orderId,
                userId,
                totalAmount: parseFloat(totalAmount),
                paymentMethod: paymentMethod,
                status: 'PENDING',
                phone: phone,
                shippingAddress: shippingAddress
            }])
            .select()
            .single();
            
        if (orderError) throw orderError;

        const orderItemsData = items.map((item: any) => ({
            id: crypto.randomUUID(),
            orderId: orderId,
            productId: item.productId || item.id,
            quantity: parseInt(item.quantity, 10),
            priceAtPurchase: parseFloat(item.price)
        }));
        
        const { error: itemsError } = await supabase
            .from('OrderItem')
            .insert(orderItemsData);
            
        if (itemsError) throw itemsError;

        for (const item of items) {
            const targetId = item.productId || item.id;

            const { data: product, error: fetchErr } = await supabase.from('Product').select('stock').eq('id', targetId).single();
            
            if (fetchErr) {
                console.error("ERREUR FETCH STOCK:", fetchErr);
            }

            if (product) {
                const newStock = Math.max(0, product.stock - parseInt(item.quantity, 10));
                
                const { error: updateErr } = await supabase.from('Product').update({ stock: newStock }).eq('id', targetId);
                
                if (updateErr) {
                    console.error("ERREUR UPDATE STOCK:", updateErr);
                }
            } else {
                console.log("Produit introuvable");
            }
        }

        res.status(201).json({
            message: "Commande effectuée avec succès.",
            orderId: orderId
        });
    } catch (error) {
        console.error("Erreur Commande : ", error);
        res.status(500).json({ message: "Erreur lors de la création de la commande." });
    }
});

router.get('/my-orders', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { data: orders, error } = await supabase
            .from('Order')
            .select('*,OrderItem(*,Product(*))')
            .eq('userId', userId)
            .order('createdAt', { ascending: false }); 
            
        if (error) throw error;
        res.json(orders);
    } catch (error) {
        console.error("Erreur Fetch Orders : ", error);
        res.status(500).json({ message: "Erreur lors de la récupération de vos commandes." });
    }
});

router.get('/admin', authenticate, isAdmin, async (req: Request, res: Response) => {
    try {
        const { data: orders, error } = await supabase
            .from('Order')
            .select('*, OrderItem(*, Product(*))'); 
            
        if (error) throw error;

        const userIds = [...new Set(orders.map(o => o.userId))];

        const { data: users } = await supabase
            .from('User')
            .select('id, email, name')
            .in('id', userIds);

        const ordersWithUsers = orders.map(order => {
            const userMatch = users?.find(u => u.id === order.userId);
            return {
                ...order,
                User: userMatch ? { email: userMatch.email, name: userMatch.name } : { email: 'Email introuvable' }
            };
        });

        res.json(ordersWithUsers);
    } catch (error) {
        console.error("Erreur Admin Fetch Orders:", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des commandes." });
    }
});

router.put('/:id/status', authenticate, isAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ message: "Le statut de la commande est obligatoire." });
        }

        const { data: order, error: fetchError } = await supabase
            .from('Order')
            .select('status, OrderItem(productId, quantity)')
            .eq('id', id)
            .single();

        if (fetchError || !order) {
            return res.status(404).json({ message: "Commande introuvable." });
        }

        if (['RETURNED', 'CANCELED'].includes(status) && !['RETURNED', 'CANCELED'].includes(order.status)) {
            for (const item of order.OrderItem as any[]) {
                const { data: product } = await supabase.from('Product').select('stock').eq('id', item.productId).single();
                if (product) {
                    await supabase.from('Product').update({ stock: product.stock + item.quantity }).eq('id', item.productId);
                }
            }
        } 
        else if (!['RETURNED', 'CANCELED'].includes(status) && ['RETURNED', 'CANCELED'].includes(order.status)) {
             for (const item of order.OrderItem as any[]) {
                const { data: product } = await supabase.from('Product').select('stock').eq('id', item.productId).single();
                if (product) {
                    const newStock = Math.max(0, product.stock - item.quantity);
                    await supabase.from('Product').update({ stock: newStock }).eq('id', item.productId);
                }
            }
        }

        const { data: updatedOrder, error } = await supabase
            .from('Order')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({ message: "Statut de la commande mis à jour avec succès.", order: updatedOrder });
    } catch (error) {
        console.error("Erreur Update Status : ", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour du statut de la commande." });
    }
});

router.put('/:id/cancel', authenticate, async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    
    const userPayload = (req as any).user;
    const userId = userPayload.id || userPayload.userId || userPayload.sub;

    const { data: order, error: fetchError } = await supabase
      .from('Order')
      .select('*, OrderItem(productId, quantity)')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    if (order.userId !== userId) {
      return res.status(403).json({ message: "Accès refusé. Cette commande ne vous appartient pas." });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: "Vous ne pouvez annuler qu'une commande en attente (PENDING)" });
    }

    for (const item of order.OrderItem as any[]) {
        const { data: product } = await supabase.from('Product').select('stock').eq('id', item.productId).single();
        if (product) {
            await supabase.from('Product').update({ stock: product.stock + item.quantity }).eq('id', item.productId);
        }
    }

    const { error: updateError } = await supabase
      .from('Order')
      .update({ status: 'CANCELED' })
      .eq('id', orderId);

    if (updateError) throw updateError;

    res.json({ message: "Commande annulée avec succès. Le stock a été restitué." });
  } catch (error) {
    console.error("Erreur Cancel Order:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;