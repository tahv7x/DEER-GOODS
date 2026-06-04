import express, {type Request,type Response} from 'express';
import supabase from '../config/db.js';
import {authenticate,isAdmin} from '../middlewares/authMidlleware.js';
import {upload} from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const { data: products, error } = await supabase
            .from('Product')
            .select('*, Category(name)'); 

        if (error) throw error;

        res.json(products);
    } catch (error) {
        console.error("Erreur Fetch Products:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des produits." });
    }
});
router.get('/:id',async(req:Request,res:Response) => {
    try{
        const{id} = req.params;
        const {data:product,error} = await supabase
            .from('Product')
            .select('*,Category(name)')
            .eq('id',id)
            .single();
        if(error) throw error;
        if(!product) return res.status(404).json({message: "Produit non trouvé."});

        res.json(product);
    }catch(err: any){
        console.error("Erreur fetch Prodduit : ", err)
        res.status(500).json({message: "Erreur serveur"});
    }
});
router.post('/', authenticate, isAdmin, upload.array('images', 5), async(req: Request, res: Response) => {
    try {
        const { name, description, price, categoryId, stock, existingImages } = req.body;
        const files = req.files as Express.Multer.File[];
        
        if (!name || !price || !categoryId || !stock) {
            return res.status(400).json({ message : "Le nom, le prix, la categorie et le stock sont obligatoires." })
        }
        
        let imageUrls: string[] = [];
        if (existingImages) {
            try {
                imageUrls = JSON.parse(existingImages);
            } catch (e) {
                console.error("Error parsing existing images", e);
            }
        }

        if (files && files.length > 0) {
            const uploadPromises = files.map(async (file) => {
                const fileExt = file.originalname.split('.').pop();
                const randomStr = Math.random().toString(36).substring(2, 9);
                const fileName = `${Date.now()}-${randomStr}.${fileExt}`;                
                const { data: uploadData, error: uploadError } = await supabase
                    .storage
                    .from('products')
                    .upload(fileName, file.buffer, {
                        contentType: file.mimetype,
                });

                if (uploadError) {
                    console.error("Erreur upload image", uploadError);
                    throw new Error("Erreur lors de l'upload de l'image");
                }

                const { data: publicUrlData } = supabase.storage
                    .from('products')
                    .getPublicUrl(fileName);
                
                return publicUrlData.publicUrl;
            });
            
            const newUrls = await Promise.all(uploadPromises);
            imageUrls = [...imageUrls, ...newUrls]; // N-jm3ohom
        }

        const { data: newProduct, error: dbError } = await supabase
            .from('Product')
            .insert([{
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock, 10),
                categoryId,
                imageUrls
            }])
            .select()
            .single();

        if (dbError) throw dbError;

        res.status(201).json({
            message: "Produit ajouté avec succès.",
            product: newProduct
        });
    } catch(error) {
        console.error("Erreur Creation du Produit : ", error);
        res.status(500).json({ message: "Erreur lors de l'ajout du produit." });
    }
});
router.put('/:id',authenticate,isAdmin,upload.array('images',5),async(req:Request,res:Response)=>{
    try{
        const {id} = req.params;
        const{name,description,price,categoryId,stock,existingImages} = req.body;
        const files = req.files as Express.Multer.File[];

        let imageUrls: string[] = [];
        if(existingImages){
            imageUrls = JSON.parse(existingImages);
        }
        if (files && files.length > 0) {
            const uploadPromises = files.map(async (file) => {
                const fileName = `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;
                const { error: uploadError } = await supabase
                    .storage
                    .from('products')
                    .upload(fileName, file.buffer, 
                        { 
                            contentType: file.mimetype 
                        });
                if (uploadError) throw new Error("Erreur upload image");
                const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(fileName);
                return publicUrlData.publicUrl;
            });
            const newUrls = await Promise.all(uploadPromises);
            imageUrls = [...imageUrls, ...newUrls]; 
        }

        const{ data : updatedProduct, error} = await supabase
            .from('Product')
            .update({
                name,
                description,
                price: price ? parseFloat(price) : undefined,
                stock: stock ? parseInt(stock,10) : undefined,
                categoryId,
                imageUrls
            })
            .eq('id',id)
            .select()
        if(error) throw error;
        if(!updatedProduct || updatedProduct.length === 0){
            return res.status(404).json({message : "Produit non trouvé."})
        }
        res.json({
            message : "Produit modifié avec succès.",
            product: updatedProduct[0]
        })
    }catch(error){
        console.error("Error Update Product" , error);
        res.status(500).json({message: "Erreur lors de la modification du produit."});
    }
});

router.delete('/:id', authenticate, isAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { data: product, error: fetchError } = await supabase
            .from('Product')
            .select('imageUrls')
            .eq('id', id)
            .single();

        if (fetchError || !product) {
            return res.status(404).json({ message: "Produit introuvable." });
        }

        if (product.imageUrls && product.imageUrls.length > 0) {
            const pathsToRemove = product.imageUrls.map((url: string) => {
                const parts = url.split('/products/'); 
                return parts[parts.length - 1]; 
            });

            const { error: storageError } = await supabase
                .storage
                .from('products')
                .remove(pathsToRemove); 

            if (storageError) {
                console.error("Erreur (Storage) lors de la suppression des images :", storageError);
            }
        }
        const { error: deleteError } = await supabase
            .from('Product')
            .delete()
            .eq('id', id);

        if (deleteError) {
            if (deleteError.code === '23503') {
                return res.status(400).json({ message: "Ce produit a déjà été commandé, impossible de le supprimer." });
            }
            throw deleteError;
        }

        res.json({ message: "Produit et ses images supprimés avec succès." });
    } catch (error) {
        console.error("Erreur Delete Product : ", error);
        res.status(500).json({ message: "Erreur lors de la suppression du produit." });
    }
});
export default router;