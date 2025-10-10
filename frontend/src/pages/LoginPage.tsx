import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(username, password);
      
      if (user) {
        if (user.role === 'manager') {
          navigate('/manager/dashboard', { replace: true });
        } else if (user.role === 'cashier') {
          navigate('/cashier/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        setError('Username atau password salah');
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Terjadi kesalahan saat login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #ec5766 0%, #da344d 50%, #c42348 100%)'
    }}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl" style={{
            background: 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)'
          }}>
            🧑‍🍳
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Warung Pak Aceng</h1>
          <p className="text-gray-600">Sistem Digitalisasi UMKM</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 transition-colors"
              onFocus={(e) => {
                e.target.style.borderColor = '#ec5766';
                e.target.style.boxShadow = '0 0 0 2px rgba(236, 87, 102, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgb(209 213 219)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 transition-colors"
              onFocus={(e) => {
                e.target.style.borderColor = '#ec5766';
                e.target.style.boxShadow = '0 0 0 2px rgba(236, 87, 102, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgb(209 213 219)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? 'Masuk...' : 'Masuk'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            © 2025 Warung Pak Aceng - Digitalisasi UMKM
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;