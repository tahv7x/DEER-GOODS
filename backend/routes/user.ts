import express,{type Request,type Response} from 'express';
import supabase from '../config/db.js';
import {authenticate,isAdmin} from '../middlewares/authMidlleware.js';

const router = express.Router();

router.get('/', authenticate,isAdmin, async(req: Request, res: Response) => {
    try{
        const {data: users, error} = await supabase
            .from('User')
            .select('*')
            .order('createdAt',{ascending: false});
        if(error) throw error;

        res.json(users);
    }catch(error){
        console.error("Erreur Fetch Users : ",error);
        res.status(500).json({message: "Erreur lors de la récupération des utilisateurs."});
    }
});

router.put('/:id/role',authenticate,isAdmin,async(req:Request, res: Response) => {
    try{
        const {id} = req.params;
        const{role} = req.body;

        if(!role || !['ADMIN','CUSTOMER'].includes(role)){
            return res.status(400).json({message : "Role Invalide"});
        }

        if(req.user?.id === id && role === 'CUSTOMER'){
            return res.status(400).json({message : "Vous ne pouvez pas révoquer votre propre accès Admin."});
        }
        const{ data : updatedUser, error} = await supabase
            .from('User')
            .update({role})
            .eq('id',id)
            .select()
            .single();
        if(error) throw error;

        res.json({
            message: "Rôle mis à jour avec succès.",
            user:updatedUser
        });
    } catch(error){
        console.error("Erreur Update Role : ",error);
        res.status(500).json({message: "Erreur lors de la mise à jour du rôle."});
    }
});
export default router;