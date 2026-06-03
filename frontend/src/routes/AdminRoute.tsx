import React from 'react';
import {Navigate, Outlet} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminRoute: React.FC = () => {
    const{user, loading} = useAuth();

    if(loading){
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FDFCF9' }}>
                <style>{`
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                `}</style>
                <div style={{ width: 30, height: 30, border: '2px solid #E5E0D8', borderTopColor: '#C4631C', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if(!user){
        return <Navigate to="/login" replace />;
    }
    
    if(user.role !== 'ADMIN'){
        return <Navigate to="/" replace />;
    }
    return <Outlet/>;
};