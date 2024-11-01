import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes if you're using it
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user } = useContext(AuthContext);

    // Redirect to login if user is not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Render the protected route children
    return children;
};

// If using PropTypes, uncomment below:
// PrivateRoute.propTypes = {
//     children: PropTypes.node.isRequired,
// };

export default PrivateRoute;
