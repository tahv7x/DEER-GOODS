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

        // N-9raw tsawer l-9dam ila kano (Wakha f l-Ajout kaykouno khawyin, drnaha l-i7tiyat)
        if (existingImages) {
            try {
                imageUrls = JSON.parse(existingImages);
            } catch (e) {
                console.error("Error parsing existing images", e);
            }
        }

        // L-Upload dyal tsawer jdad
        if (files && files.length > 0) {
            const uploadPromises = files.map(async (file) => {
                const fileName = `${Date.now()}-${file.originalname.replace(/\s/g,'_')}`;
                
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

        // L-Insert f Base de données
        const { data: newProduct, error: dbError } = await supabase
            .from('Product')
            .insert([{
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock, 10),
                categoryId,
                imageUrls // Sifetna l-Array d tsawer
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

        // 1. N-jebdou l-produit 9bel man-ms7ouh bach n-3erfou tsawer dyalo
        const { data: product, error: fetchError } = await supabase
            .from('Product')
            .select('imageUrls')
            .eq('id', id)
            .single();

        if (fetchError || !product) {
            return res.status(404).json({ message: "Produit introuvable." });
        }

        // 2. N-ms7ou t-tsawer mn Supabase Storage
        if (product.imageUrls && product.imageUrls.length > 0) {
            // L-URL kat-koun twila, 7na khassna gha s-smiya d l-fichier l-khrania
            const pathsToRemove = product.imageUrls.map((url: string) => {
                const parts = url.split('/products/'); // Kan-9ssmou l-url 3la smiyt l-bucket
                return parts[parts.length - 1]; // Kan-hezzo ghir l-js2 l-kher (fileName)
            });

            const { error: storageError } = await supabase
                .storage
                .from('products')
                .remove(pathsToRemove); // Supabase kay-9bel array dyal smiyat bach yms7hom f de9a

            if (storageError) {
                console.error("Erreur (Storage) lors de la suppression des images :", storageError);
                // Wakha t-w9e3 erreur f l-msi7 d tswira (matalan deja mmsou7a), kan-kmlou l-msi7 d l-produit
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