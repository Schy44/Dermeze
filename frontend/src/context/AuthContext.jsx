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
        try {
            const tokens = localStorage.getItem('authTokens');
            if (tokens) {
                const parsedTokens = JSON.parse(tokens);
                console.log('Parsed Tokens:', parsedTokens);
                if (!isTokenExpired(parsedTokens.access)) {
                    setAuthTokens(parsedTokens);
                    setUser(jwtDecode(parsedTokens.access));
                } else {
                    localStorage.removeItem('authTokens');
                    setAuthTokens(null);
                    setUser(null);
                }
            } else {
                setAuthTokens(null);
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to parse tokens from localStorage:', error);
            setAuthTokens(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const loginUser = async ({ username, password }) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/token/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('authTokens', JSON.stringify(data));
                setAuthTokens(data);
                setUser(jwtDecode(data.access));
                navigate('/home');
            } else {
                setError(data.detail || 'Invalid credentials');
            }
        } catch (error) {
            setError('Login failed. Please try again.');
            console.error(error);
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
        if (!authTokens?.refresh || isTokenExpired(authTokens.refresh)) {
            logoutUser();  // Token is expired or missing, log the user out
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
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
                logoutUser();  // Handle token refresh failure
            }
        } catch (error) {
            logoutUser();  // Handle unexpected errors
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            authTokens,
            loginUser,
            logoutUser,
            updateToken,
            fetchWithAuth, // Add fetchWithAuth here
            error
        }}>
            {loading ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
};

export const isTokenExpired = (token) => {
    try {
        const { exp } = jwtDecode(token);
        return Date.now() >= exp * 1000;
    } catch (error) {
        console.error("Failed to decode token:", error);
        return true;
    }
};

export const fetchWithAuth = async (url, options = {}, authTokens, updateToken) => {
    if (!authTokens || !authTokens.access) {
        console.error('Authorization token is missing');
        throw new Error('Authorization token is missing');
    }

    if (isTokenExpired(authTokens.access)) {
        console.error('Token has expired');
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
            console.error('Error response:', errorData);

            if (response.status === 401) {
                throw new Error('Unauthorized request. Token may be expired or invalid.');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error.message);
        throw new Error(`Error fetching data: ${error.message}`);
    }
};

export default AuthContext;
