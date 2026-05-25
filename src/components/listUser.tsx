
import { useState, useEffect } from 'react';
import { GoogleLogin, type CredentialResponse, GoogleOAuthProvider } from '@react-oauth/google';
import type { User, UsersResponse } from '../interfaces/dummyData';

interface LoginResponseData extends User {
  accessToken: string;
  refreshToken: string;
}

export default function UserList() {
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const [token, setToken] = useState<string | null>(localStorage.getItem('userToken'));
  const [userData, setUserData] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('userData');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState<boolean>(false);
  const [platformUsers, setPlatformUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'google-users'>('profile');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setApiError(null); 

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      const response = await fetch('https://dummyjson.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Credenciales incorrectas');
      }

      const data: LoginResponseData = await response.json();
      
      setToken(data.accessToken);
      setUserData(data);
      
      localStorage.setItem('userToken', data.accessToken);
      localStorage.setItem('userData', JSON.stringify(data));

    } catch (err) {
      console.error(err);
      setApiError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isGoogleAuthenticated) return;

    const fetchPlatformUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://dummyjson.com/users');
        if (!response.ok) throw new Error('No se pudieron obtener los usuarios');
        const data: UsersResponse = await response.json();
        setPlatformUsers(data.users);
      } catch (err) {
        console.error(err);
        setApiError('Error al cargar la lista de usuarios desde el servidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlatformUsers();
  }, [isGoogleAuthenticated]);

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    console.log("Google Token:", credentialResponse.credential);
    setIsGoogleAuthenticated(true);
  };

  const handleLogout = () => {
    setToken(null);
    setUserData(null);
    setIsGoogleAuthenticated(false);
    setPlatformUsers([]);
    setActiveTab('profile');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
  };

  if (!token || !userData) {
    return (
      <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Acceso al Panel del Blog</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Usuario</label>
            <input name="username" type="text" defaultValue="emilys" className="w-full mt-1 p-2 border rounded outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input name="password" type="password" defaultValue="emilyspass" className="w-full mt-1 p-2 border rounded outline-none" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400">
            {loading ? 'Validando...' : 'Ingresar'}
          </button>
        </form>
        {apiError && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">Error: {apiError}</div>}
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId="TU_CLIENT_ID_DE_GOOGLE.apps.googleusercontent.com">
      <div className="max-w-4xl mx-auto my-10 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        <div className="bg-gradient-to-r bg-slate-800 p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={userData.image} alt="Avatar" className="w-16 h-16 rounded-full bg-white p-0.5 border-2 border-blue-400 object-cover" />
            <div>
              <h3 className="text-xl font-black">{userData.firstName} {userData.lastName}</h3>
              <p className="text-sm text-slate-300">{userData.email} </p>
            </div>
          </div>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Cerrar Sesión
          </button>
        </div>

        <div className="flex border-b border-gray-200 bg-gray-50">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-center font-medium text-sm border-b-2 transition-colors ${activeTab === 'profile' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Mi Información
          </button>
          <button 
            onClick={() => setActiveTab('google-users')}
            className={`flex-1 py-3 text-center font-medium text-sm border-b-2 transition-colors ${activeTab === 'google-users' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Lista General (Protegida por Google)
          </button>
        </div>

        <div className="p-6">
          
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-gray-800">Información de la Cuenta</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <span className="text-xs text-gray-400 block font-semibold uppercase">Género</span>
                  <span className="text-gray-700 font-medium capitalize">{userData.gender}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <span className="text-xs text-gray-400 block font-semibold uppercase">ID de Usuario</span>
                  <span className="text-gray-700 font-medium">#{userData.id}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'google-users' && (
            <div className="space-y-6">
              {!isGoogleAuthenticated ? (
                <div className="text-center py-8 max-w-sm mx-auto">
                  <h5 className="font-bold text-gray-800 mb-1">Capa de Autenticación de Google</h5>
                  <p className="text-xs text-gray-500 mb-4">Para listar a todos los usuarios de la plataforma con sus fotos, inicie sesión con Google:</p>
                  <div className="flex justify-center">
                    <GoogleLogin 
                      onSuccess={handleGoogleSuccess} 
                      onError={() => setApiError('Error de autenticación con Google')} 
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-bold text-gray-700">Usuarios de la plataforma</h5>
                    <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-semibold">Google Verificado</span>
                  </div>

                  {loading && <p className="text-center text-sm text-gray-500 py-4">Consultando base de datos...</p>}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {platformUsers.map((user) => (
                      <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                        <img src={user.image} alt={user.firstName} className="w-10 h-10 rounded-full bg-white border object-cover" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {apiError && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">Error: {apiError}</div>}
        </div>

      </div>
    </GoogleOAuthProvider>
  );
}