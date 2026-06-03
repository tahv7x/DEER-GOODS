import express , {type Request, type Response} from 'express';
import supabase from '../config/db.js';
import {authenticate,isAdmin} from '../middlewares/authMidlleware.js';


const router = express.Router();

router.get('/', async(req:Request, res:Response) => {
    try{
        const {data : categories, error} = await supabase
            .from('Category')
            .select('*');
        if(error)throw error;

        res.json(categories);
    }catch(error){
        console.error("Erreur Fetch Categories:", error);
        res.status(500).json({message: "Erreur lors de la récupération des catégories."});
    }
});

router.post('/',authenticate,isAdmin,async(req:Request,res:Response)=>{
    try{
        const {name, description} = req.body;

        if(!name){
            return res.status(400).json({message: "Le nom de la catégorie est obligatoire."});
        }

        const {data:newCategory,error}=await supabase
            .from('Category')
            .insert([{name,description}])
            .select()
            .single();
        
            if(error) throw error;

            res.status(201).json({
                message:"Catégorie ajoutée avec succès.",
                category: newCategory
            });
    }catch(error){
        console.error("Erreur créer catégorie : ",error);
        res.status(500).json({message:"Erreur lors de l'ajout de la catégorie."});
    }
});

router.put('/:id',authenticate,isAdmin,async(req:Request,res:Response) => {
    try{
        const {id} = req.params;
        const{name,description} = req.body;

        const{data: updatedCategory,error} = await supabase
            .from('Category')
            .update({name,description})
            .eq('id',id)
            .select()
            .single();
        if(error) throw error;

        res.json({
            message:"Catégorie modifiée avec succès.",
            category: updatedCategory
        });
    }catch(error){
        console.error("Erreur de modifier catégorie : ",error);
        res.status(500).json({message: "Erreur lors de la modification de la catégorie."});
    }
});

router.delete('/:id',authenticate,isAdmin,async(req:Request,res:Response) => {
    try{
        const{id} = req.params;
        const{error} = await supabase
            .from('Category')
            .delete()
            .eq('id',id);
        if(error) throw error;
        res.json({message: "Catégorie supprimée avec succès."});
    }catch(error){
        console.error("Erreur de suppresion : ",error);
        res.status(500).json({message: "Erreur lors de la suppression de la catégorie."});
    }
});

export default router
