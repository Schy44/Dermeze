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

    // Refresh tokens 1 minute before expiry
    useEffect(() => {
        const interval = setInterval(() => {
            if (authTokens && !isTokenExpired(authTokens.access)) {
                updateToken();
            }
        }, 1000 * 60); // Every 1 minute

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, [authTokens]);

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
            } catch (error) {
                console.error('Error parsing tokens:', error);
                localStorage.removeItem('authTokens');
            }
        }
        setLoading(false);
    }, []);

    const loginUser = async ({ username, password }) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/token/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('authTokens', JSON.stringify(data));
                setAuthTokens(data);
                setUser(jwtDecode(data.access));
                navigate('/home');
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login failed:', error);
            setError('Unable to connect to the server. Please try again later.');
        } finally {
            setLoading(false);
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

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('authTokens', JSON.stringify(data));
                setAuthTokens(data);
                setUser(jwtDecode(data.access));
            } else {
                console.error('Failed to refresh token:', response.statusText);
                logoutUser();
            }
        } catch (error) {
            console.error('Unexpected error during token refresh:', error);
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
                error,
            }}
        >
            {loading ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
};

export const isTokenExpired = (token) => {
    try {
        const { exp } = jwtDecode(token);
        return Date.now() >= exp * 1000;
    } catch (error) {
        console.error('Error decoding token:', error);
        return true;
    }
};

export default AuthContext;
