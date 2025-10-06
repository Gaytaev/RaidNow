import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { PassengerDashboard } from './components/passenger/PassengerDashboard';
import { DriverDashboard } from './components/driver/DriverDashboard';

function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthScreen />;
  }

  if (profile.role === 'passenger') {
    return <PassengerDashboard />;
  }

  if (profile.role === 'driver') {
    return <DriverDashboard />;
  }

  return null;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
