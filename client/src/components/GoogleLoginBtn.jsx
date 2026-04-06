import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GoogleLoginBtn = () => {
    const navigate = useNavigate();
    const [error, setError] = React.useState('');

    const handleSuccess = async (response) => {
        try {
            setError('');
            const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const { data } = await axios.post(`${API_BASE}/auth/google-login`, {
                tokenId: response.credential
            });
            localStorage.setItem('userInfo', JSON.stringify(data));
            window.location.href = '/dashboard'; // Force redirect to dashboard
        } catch (err) {
            console.error('Google Login Error:', err);
            setError(err.response?.data?.message || 'Authentication failed');
        }
    };

    return (
        <div className="w-full flex flex-col items-center mt-6 gap-4">
            {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg">
                    {error}
                </div>
            )}
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => setError('Google sign-in failed')}
                useOneTap
                theme="filled_blue"
                shape="pill"
            />
        </div>
    );
};

export default GoogleLoginBtn;
