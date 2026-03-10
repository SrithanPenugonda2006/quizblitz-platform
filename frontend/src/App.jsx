import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import PlayerDashboard from './pages/PlayerDashboard';
import HostDashboard from './pages/HostDashboard';
import AdminDashboard from './pages/AdminDashboard';
import QuizCreator from './pages/QuizCreator';
import HostRoom from './pages/HostRoom';
import JoinRoom from './pages/JoinRoom';
import LiveQuiz from './pages/LiveQuiz';
import Analytics from './pages/Analytics';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RoleRoute({ roles, children }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) {
    // Redirect to default dashboard based on their actual role
    if (user?.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user?.role === 'host') return <Navigate to="/host-dashboard" replace />;
    return <Navigate to="/player-dashboard" replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/join" element={<JoinRoom />} />
            <Route path="/live/:roomCode" element={<LiveQuiz />} />
            <Route path="/player-dashboard" element={<RoleRoute roles={['player']}><PlayerDashboard /></RoleRoute>} />
            <Route path="/host-dashboard" element={<RoleRoute roles={['host']}><HostDashboard /></RoleRoute>} />
            <Route path="/admin-dashboard" element={<RoleRoute roles={['admin']}><AdminDashboard /></RoleRoute>} />
            <Route path="/create" element={<RoleRoute roles={['host', 'admin']}><QuizCreator /></RoleRoute>} />
            <Route path="/host/:quizId" element={<RoleRoute roles={['host', 'admin']}><HostRoom /></RoleRoute>} />
            <Route path="/analytics/:quizId" element={<RoleRoute roles={['host', 'admin']}><Analytics /></RoleRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
