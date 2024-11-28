import { useNavigate } from 'react-router-dom';
import { useState, useContext } from 'react';  // Added useContext import
import AuthContext from '../context/AuthContext';
import '../assets/login.css';

const LoginPage = () => {
    const { loginUser } = useContext(AuthContext);  // Accessing loginUser from context
    const navigate = useNavigate();  // Use the navigate hook for redirection
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Basic validation
        if (!username || !password) {
            setError('Please enter both username and password.');
            setLoading(false);
            return;
        }

        try {
            // Call loginUser with username and password
            await loginUser({ username, password });

            // Redirect to home page after successful login
            navigate('/');  // This will redirect to the '/' route (home page)
            setLoading(false);
        } catch (err) {
            setError('Login failed. Please check your credentials.');
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit} className="form">
                {error && <p className="error">{error}</p>}
                <div className="inputGroup">
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input"
                    />
                </div>
                <div className="inputGroup">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input"
                    />
                </div>
                <button type="submit" className="button" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <button type="button" onClick={() => navigate('/register')} className="registerButton">
                    Register
                </button>
            </form>
        </div>
    );
};

export default LoginPage;
