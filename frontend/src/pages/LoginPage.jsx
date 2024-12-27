import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../assets/Login.css';

const LoginPage = () => {
    const { loginUser, error } = useContext(AuthContext); // Access `error` from context
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Basic validation
        if (!username || !password) {
            setLoading(false);
            return;
        }

        await loginUser({ username, password }); // Call loginUser
        setLoading(false);
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit} className="form">
                {error && <p className="error">{error}</p>} {/* Display error */}
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
                <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="registerButton"
                >
                    Register
                </button>
            </form>
        </div>
    );
};

export default LoginPage;
