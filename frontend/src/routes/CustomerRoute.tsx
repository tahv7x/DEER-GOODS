import React from 'react';
import {Navigate, Outlet} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const CustomerRoute : React.FC = () => {
    const {user} = useAuth();

    if(!user){
        return <Navigate to="/login" replace />;
    }
    if(user.role === 'ADMIN'){
        return <Navigate to="/admin" replace/>;
    }
    return <Outlet/>;
}