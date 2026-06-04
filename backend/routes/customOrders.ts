import express, { type Request, type Response } from 'express';
import supabase from '../config/db.js';
import { authenticate, isAdmin } from '../middlewares/authMidlleware.js';
import { upload } from '../middlewares/uploadMiddleware.js'; 
import crypto from 'crypto';

const router = express.Router();

router.post('/', authenticate, upload.single('image'), async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { description } = req.body;
        let imageUrl = null;

        if (!description) {
            return res.status(400).json({ message: "La description est obligatoire." });
        }

        if (req.file) {
            const fileExt = req.file.originalname.split('.').pop();
            const fileName = `${userId}-${Date.now()}.${fileExt}`;
            const filePath = `custom-orders/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, req.file.buffer, {
                    contentType: req.file.mimetype,
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            imageUrl = publicUrl;
        }

        const customOrderId = crypto.randomUUID();

        const { data, error } = await supabase
            .from('CustomOrder')
            .insert([{
                id: customOrderId,
                userId,
                description,
                imageUrl, 
                status: 'PENDING'
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: "Demande envoyée avec succès.", customOrder: data });
    } catch (error) {
        console.error("Erreur Create Custom Order:", error);
        res.status(500).json({ message: "Erreur lors de la création de la demande." });
    }
});

router.get('/my-requests', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { data: requests, error } = await supabase
            .from('CustomOrder')
            .select('*')
            .eq('userId', userId)
            .order('createdAt', { ascending: false });

        if (error) throw error;
        res.json(requests);
    } catch (error) {
        console.error("Erreur Fetch My Custom Orders:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des demandes." });
    }
});

router.get('/admin', authenticate, isAdmin, async (req: Request, res: Response) => {
    try {
        const { data: requests, error } = await supabase
            .from('CustomOrder')
            .select('*, User(email, name)')
            .order('createdAt', { ascending: false });

        if (error) throw error;
        res.json(requests);
    } catch (error) {
        console.error("Erreur Admin Fetch Custom Orders:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des demandes." });
    }
});

router.put('/:id/quote', authenticate, isAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { estimatedPrice } = req.body;

        if (!estimatedPrice) {
            return res.status(400).json({ message: "Le prix estimé est obligatoire." });
        }

        const { data: updatedRequest, error } = await supabase
            .from('CustomOrder')
            .update({ 
                estimatedPrice: parseFloat(estimatedPrice),
                status: 'QUOTED'
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json({ message: "Prix envoyé au client.", request: updatedRequest });
    } catch (error) {
        console.error("Erreur Quote Custom Order:", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour du prix." });
    }
});

router.put('/:id/status', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const { data: customOrder, error: fetchError } = await supabase
            .from('CustomOrder')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !customOrder) throw new Error("Custom order introuvable");

        if (status === 'ACCEPTED' && customOrder.status !== 'ACCEPTED') {
            
            const { data: userData } = await supabase
                .from('User')
                .select('name, phone')
                .eq('id', customOrder.userId)
                .single();

            const clientName = userData?.name || 'Client';
            const dynamicProductName = `${clientName} Commande`;

            let { data: customCategory } = await supabase
                .from('Category')
                .select('id')
                .eq('name', 'Custom Orders')
                .single();

            if (!customCategory) {
                const { data: newCat, error: catErr } = await supabase
                    .from('Category')
                    .insert([{ 
                        id: crypto.randomUUID(), 
                        name: 'Custom Orders', 
                        description: 'Catégorie cachée pour les commandes sur-mesure' 
                    }])
                    .select()
                    .single();
                if (catErr) throw catErr;
                customCategory = newCat;
            }

            if (!customCategory) {
                throw new Error("Erreur critique: Catégorie introuvable");
            }

            const productImages = customOrder.imageUrl ? [customOrder.imageUrl] : [];

            const { data: bespokeProduct, error: prodErr } = await supabase
                .from('Product')
                .insert([{
                    id: crypto.randomUUID(),
                    name: dynamicProductName,
                    description: `Commande sur-mesure validée par ${clientName}.`,
                    price: 0,
                    stock: 1,
                    categoryId: customCategory.id,
                    imageUrls: productImages
                }])
                .select()
                .single();
                
            if (prodErr) throw prodErr;

            const orderId = crypto.randomUUID();
            const { error: orderError } = await supabase.from('Order').insert([{
                id: orderId,
                userId: customOrder.userId,
                totalAmount: customOrder.estimatedPrice,
                paymentMethod: 'COD',
                status: 'PENDING',
                phone: userData?.phone || null,
                shippingAddress: 'À confirmer via WhatsApp' 
            }]);

            if (orderError) throw orderError;

            const { error: itemError } = await supabase.from('OrderItem').insert([{
                id: crypto.randomUUID(),
                orderId: orderId,
                productId: bespokeProduct.id, 
                quantity: 1,
                priceAtPurchase: customOrder.estimatedPrice
            }]);

            if (itemError) throw itemError;
        }

        const { data: updatedData, error } = await supabase
            .from('CustomOrder')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        
        res.json({ message: "Statut mis à jour avec succès.", request: updatedData });
    } catch (error) {
        console.error("Erreur Update Status Custom Order:", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour du statut." });
    }
});

export default router;