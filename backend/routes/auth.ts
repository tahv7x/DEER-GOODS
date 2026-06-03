import express ,{type Request,type Response} from 'express';
import supabase from '../config/db.js';
import {upload} from '../middlewares/uploadMiddleware.js';
const router = express.Router();

router.post('/register', async(req:Request,res:Response) => {
    try{
        const {name,email,password,phone} = req.body;

        const{data,error} = await supabase.auth.signUp({
            email,
            password,
            options:{
                data:{
                    name,
                    phone
                }
            }
        });
        if(error) return res.status(400).json({message:error.message});
        res.status(201).json({message:'Inscription réussie.', user:data.user});
    }catch(error){
        console.error("Erreur Register :",error);
        res.status(500).json({message : 'Erreur du serveur'});
    }
});

router.post('/login',async(req:Request,res:Response) => {
    try{
        const {email,password} = req.body;

        const{data,error} = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if(error) return res.status(400).json({ message:'Email ou mot de passe incorrect.'});

        res.json({
            message: 'Connexion réussie.',
            token: data.session.access_token,
            user: data.user
        });
    }catch(error){
        console.error("Erreur Login :",error);
        res.status(500).json({message:'Erreur interne du serveur' })
    }
});

router.post('/forgot-password', async(req:Request,res:Response) => {
    try{
        const {email} = req.body;

        const {error} = await supabase.auth.resetPasswordForEmail(
            email,
            {redirectTo: 'http://localhost:3000/reset-password'}
        );

        if(error) return res.status(400).json({message : error.message});
        res.json({message : 'Un email réinitialisation vous a été envoyé.'});
    }catch(error){
        console.error("Erreur Mots de pass Oublier : ",error);
        res.status(500).json({message: 'Erreur serveur'});
    }
});

router.post('/reset-password', async(req:Request,res:Response) => {
    try{
        const {password,token} = req.body;
        if(!password || !token){
            return res.status(400).json({message:"Token ou mot de passe manquant."})
        }
        const {data,error:sessionError} = await supabase.auth.getUser(token);
        if(sessionError || !data.user){
            return res.status(401).json({ message: "Le lien est invalide ou a expiré." });
        }
        const{error: updateError} = await supabase.auth.admin.updateUserById(data.user.id,{
            password:password
        });
        if(updateError) throw updateError;
        res.json({message: "Mot de pass mis a jour avec succès."});
    }catch(error : any){
        console.error("Erreur Reset Password : ",error);
        res.status(500).json({message: "Erreur serveur"});
    }
});
router.put('/profile',upload.single('avatar'),async(req:Request,res:Response) => {
    try{
        const {name,phone} = req.body;
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Non autorisé, token manquant ou invalide." });
        }
        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return res.status(401).json({ message: "Session expirée ou utilisateur non trouvé." });
        }
        let avatarUrl = user.user_metadata?.avatar_url || null;

        if(req.file){
            const fileName = `${user.id}-avatar.png`;

            const{error: uploadError} = await supabase
            .storage
            .from('avatars')
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert:true
            });

            if(uploadError) throw uploadError;

            const publicUrlData = supabase.storage.from('avatars').getPublicUrl(fileName);
            avatarUrl = publicUrlData.data.publicUrl;
        }

        const { data: updatedAuthData, error: updateAuthError } = await supabase.auth.admin.updateUserById(user.id, {
            user_metadata: {
                name: name || user.user_metadata?.name,
                phone: phone || user.user_metadata?.phone, 
                avatar_url: avatarUrl
            }
        });
        if(updateAuthError) throw updateAuthError;
        if(name){
            const{error: dbError} = await supabase
                .from('User')
                .update({name,phone})
                .eq('id',user.id);
            if(dbError){
                console.error("Erreur maj public.User:", dbError);
            }
        }

        res.json({
            message: "Profil mis à jour avec succès.",
            user: updatedAuthData.user
        });
    }catch(err:any){
        console.error("Erreur Update Profile : ",err);
        res.status(500).json({message: "Erreur serveur"});
    }
});
export default router;