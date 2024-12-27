import { createContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authTokens, setAuthTokens] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const tokens = localStorage.getItem('authTokens');
        if (tokens) {
            try {
                const parsedTokens = JSON.parse(tokens);
                if (!isTokenExpired(parsedTokens.access)) {
                    setAuthTokens(parsedTokens);
                    setUser(jwtDecode(parsedTokens.access));
                } else {
                    localStorage.removeItem('authTokens');
                }
            } catch (err) {
                console.error('Error parsing tokens:', err);
                localStorage.removeItem('authTokens');
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (authTokens && !isTokenExpired(authTokens.access)) {
                updateToken();
            }
        }, 1000 * 60); // Refresh tokens every minute if valid

        return () => clearInterval(interval);
    }, [authTokens]);

    const loginUser = async ({ username, password }) => {
        setError(null);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/token/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Invalid credentials');
            }

            localStorage.setItem('authTokens', JSON.stringify(data));
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            navigate('/home');
        } catch (err) {
            console.error('Login error:', err.message);
            setError(err.message);
        }
    };

    const logoutUser = () => {
        localStorage.removeItem('authTokens');
        setAuthTokens(null);
        setUser(null);
        navigate('/login');
    };

    const updateToken = async () => {
        try {
            if (!authTokens?.refresh || isTokenExpired(authTokens.refresh)) {
                logoutUser();
                return;
            }

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: authTokens.refresh }),
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const data = await response.json();
            localStorage.setItem('authTokens', JSON.stringify(data));
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
        } catch (err) {
            console.error('Token refresh error:', err.message);
            logoutUser();
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                authTokens,
                loginUser,
                logoutUser,
                updateToken,
                fetchWithAuth, // Include fetchWithAuth in context
                error,
            }}
        >
            {loading ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
};

export const fetchWithAuth = async (url, options = {}, authTokens, updateToken) => {
    if (!authTokens || !authTokens.access) {
        throw new Error('Authorization token is missing');
    }

    if (isTokenExpired(authTokens.access)) {
        await updateToken();
    }

    const headers = {
        ...options.headers,
        Authorization: `Bearer ${authTokens.access}`,
        'Content-Type': 'application/json',
    };

    try {
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (err) {
        console.error(`Error fetching data from ${url}:`, err.message);
        throw new Error(err.message);
    }
};

export const isTokenExpired = (token) => {
    try {
        const { exp } = jwtDecode(token);
        return Date.now() >= exp * 1000;
    } catch (err) {
        console.error('Error decoding token:', err.message);
        return true;
    }
};

export default AuthContext;
