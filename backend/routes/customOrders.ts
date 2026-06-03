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

        // Khedamin b req.file li jaya mn la config dyalk
        if (req.file) {
            const fileExt = req.file.originalname.split('.').pop();
            const fileName = `${userId}-${Date.now()}.${fileExt}`;
            const filePath = `custom-orders/${fileName}`;

            // Upload l'Supabase Storage f bucket 'images'
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, req.file.buffer, {
                    contentType: req.file.mimetype,
                });

            if (uploadError) throw uploadError;

            // Récupération dyal l'URL public
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

// 2. CLIENT : Ychouf les demandes dyalo
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

// 3. ADMIN : Ychouf ga3 les demandes dyal l'klyan
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

// 4. ADMIN : Yjaweb l'klyan w y3tih taman (Quote)
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
// 5. CLIENT / ADMIN : Tbeddel l'état w T-généri Commande 79i9iya
router.put('/:id/status', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // 1. Njbdou CustomOrder bash nakhdo l'budget w userId
        const { data: customOrder, error: fetchError } = await supabase
            .from('CustomOrder')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !customOrder) throw new Error("Custom order introuvable");

        // 2. LA MAGIE ✨: Ila l'klyan 9bel (ACCEPTED), n-kriyiw commande officielle !
        if (status === 'ACCEPTED' && customOrder.status !== 'ACCEPTED') {
            
            // a. N9elbou 3la produit m-khbi smyto "Bespoke Custom Piece"
            let { data: bespokeProduct } = await supabase
                .from('Product')
                .select('id')
                .eq('name', 'Bespoke Custom Piece')
                .single();

            // b. Ila makansh had l'produit, n-kriyiwh f l'khalafiya
            if (!bespokeProduct) {
                const { data: category } = await supabase.from('Category').select('id').limit(1).single();
                
                const { data: newProd, error: prodErr } = await supabase.from('Product').insert([{
                    id: crypto.randomUUID(),
                    name: 'Bespoke Custom Piece',
                    description: 'Commande sur-mesure validée par le client.',
                    price: 0,
                    stock: 9999, // Stock infini
                    categoryId: category?.id
                }]).select().single();
                
                if (prodErr) throw prodErr;
                bespokeProduct = newProd;
            }

            // 🚨 HADI HIYA LI SAKKTAT TYPESCRIPT 🚨
            if (!bespokeProduct) {
                throw new Error("Impossible de trouver ou créer le produit Bespoke.");
            }

            // c. Njbdou num d'téléphone dyal l'client
            const { data: userData } = await supabase
                .from('User')
                .select('phone')
                .eq('id', customOrder.userId)
                .single();

            // d. KRIYI L'COMMANDE (Order)
            const orderId = crypto.randomUUID();
            const { error: orderError } = await supabase.from('Order').insert([{
                id: orderId,
                userId: customOrder.userId,
                totalAmount: customOrder.estimatedPrice,
                paymentMethod: 'COD', // Par défaut
                status: 'PENDING',
                phone: userData?.phone || null,
                shippingAddress: 'À confirmer via WhatsApp' 
            }]);

            if (orderError) throw orderError;

            // e. Lsse9 dak l'produit (OrderItem) m3a l'Commande
            const { error: itemError } = await supabase.from('OrderItem').insert([{
                id: crypto.randomUUID(),
                orderId: orderId,
                productId: bespokeProduct.id, // Daba TypeScript merta7 100%
                quantity: 1,
                priceAtPurchase: customOrder.estimatedPrice
            }]);

            if (itemError) throw itemError;
        }

        // 3. N-updatiw status dyal l'CustomOrder bash ytwta9 (Save)
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