import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const HomePage = () => {
    const { authTokens, logoutUser } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getProfile();
    }, [authTokens]); // Depend on authTokens to refresh profile

    const getProfile = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/profile/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authTokens?.access}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }

            const data = await response.json();
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError(error.message);
            logoutUser(); // Logout on error
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Loading profile...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <p>You are logged in to the homepage!</p>
            {profile ? (
                <>
                    <p>Name: {profile.first_name} {profile.last_name}</p>
                    <p>Email: {profile.email}</p>
                </>
            ) : (
                <p>No profile data available.</p>
            )}
        </div>
    );
};

export default HomePage;
