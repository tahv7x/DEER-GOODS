import {type Request,type Response,type NextFunction} from 'express';
import supabase from '../config/db.js';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: string;
            };
        }
    }
}

export const authenticate = async(req:Request,res:Response,next:NextFunction) => {
    try{
        const authHeader = req.header('Authorization'); 

        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({message: 'Accès refusé. Aucun token fourni.'});
        } 
        const token = authHeader.split(' ')[1];
        const {data:{user},error} = await supabase.auth.getUser(token);
        if(error || !user){
            return res.status(401).json({message :'Token invalide ou expiré. Veuillez vous reconnecter.' });
        }
        const { data: userProfile } = await supabase
            .from('User')
            .select('role')
            .eq('id', user.id)
            .single();

        req.user = {
            id: user.id,
            role: userProfile?.role || 'CUSTOMER'
        };
        next();
    }catch(error){
        console.error("Erreur d'authetification : ",error);
        res.status(500).json({message: 'Erreur du serveur'});
    }
};

export const isAdmin = async(req:Request,res:Response,next:NextFunction) => {
    if(req.user && req.user.role === 'ADMIN'){
        next();
    }else{
        res.status(403).json({ message: 'Accès interdit. Cette action est réservée aux administrateurs.' });
    }
};