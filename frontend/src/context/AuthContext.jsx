import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authTokens, setAuthTokens] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const tokens = localStorage.getItem('authTokens');
        if (tokens) {
            setAuthTokens(JSON.parse(tokens));
            setUser(jwtDecode(JSON.parse(tokens).access));
        }
        setLoading(false);
    }, []);

    const loginUser = async (e) => {
        e.preventDefault();
        setLoading(true);

        const response = await fetch('http://127.0.0.1:8000/api/token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: e.target.username.value, password: e.target.password.value }),
        });

        const data = await response.json();
        setLoading(false);

        if (response.ok) {
            localStorage.setItem('authTokens', JSON.stringify(data));
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            navigate('/home'); // Redirect after successful login
        } else {
            // Handle errors appropriately
            return { error: data.detail || 'Invalid username or password' };
        }
    };

    const logoutUser = () => {
        localStorage.removeItem('authTokens');
        setAuthTokens(null);
        setUser(null);
        navigate('/login');
    };

    const updateToken = async () => {
        if (!authTokens?.refresh) {
            logoutUser();  // If no refresh token, log out the user
            return;
        }

        const response = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: authTokens.refresh })
        });

        const data = await response.json();

        if (response.status === 200) {
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            localStorage.setItem('authTokens', JSON.stringify(data));
        } else {
            logoutUser();  // Log out the user if refresh fails
        }

        setLoading(false); // Ensure loading is set to false
    };

    let contextData = {
        user,
        authTokens,
        loginUser,
        logoutUser,
    };

    useEffect(() => {
        if (loading) {
            return; // Don't call updateToken if still loading
        }

        const REFRESH_INTERVAL = 1000 * 60 * 4; // 4 minutes
        const interval = setInterval(() => {
            if (authTokens) {
                updateToken();
            }
        }, REFRESH_INTERVAL);

        return () => clearInterval(interval);
    }, [authTokens, loading]);


    return (
        <AuthContext.Provider value={{ user, authTokens, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};
