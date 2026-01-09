import React from 'react';
import { Navigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { currentUser, loading } = useAuth();
    const { userid } = useParams<{ userid?: string }>();
    const location = useLocation();

    // Show loading spinner while checking auth state
    if (loading) {
        return <LoadingSpinner fullScreen message="Loading..." />;
    }

    // Redirect to login if not authenticated
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // If route has :userid parameter, validate it matches current user
    if (userid && userid !== currentUser.uid) {
        // Extract the base path (e.g., /FoodHunter from /FoodHunter/:userid)
        const basePath = location.pathname.split('/').slice(0, -1).join('/');
        // Redirect to correct user-specific route
        return <Navigate to={`${basePath}/${currentUser.uid}`} replace />;
    }

    // Render protected content if authenticated and userid is valid
    return <>{children}</>;
};

export default ProtectedRoute;
