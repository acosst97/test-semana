import { useState, useEffect } from 'react';
import type { User, UsersResponse } from '../interfaces/dummyData';

interface LoginResponseData extends User {
  accessToken: string;
  refreshToken: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
  category?: string;
  description?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dummyjson.com';

// test
const TEST_USERS = [
  { name: 'Emily Smith', username: 'emilys', password: 'emilyspass' },
  { name: 'Michael Williams', username: 'michaelw', password: 'michaelwpass' },
  { name: 'Alexander Jones', username: 'alexanderj', password: 'alexanderjpass' }
];

export default function UserList() {
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  

  const [token, setToken] = useState<string | null>(localStorage.getItem('userToken'));
  const [userData, setUserData] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('userData');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  
  const [credentials, setCredentials] = useState({
    username: 'emilys',
    password: 'emilyspass'
  });

  // Estados de datos de la plataforma
  const [platformUsers, setPlatformUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'users' | 'products'>('profile');

  // Estados específicos para el CRUD y filtro de Productos
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formPrice, setFormPrice] = useState<number>(0);

  // Manejadores para el Login interactivo
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectTestUser = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUsername = e.target.value;
    const user = TEST_USERS.find(u => u.username === selectedUsername);
    if (user) {
      setCredentials({ username: user.username, password: user.password });
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setApiError(null); 

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: credentials.username, 
          password: credentials.password 
        })
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
    if (!token) return;

    const fetchPlatformUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/users`);
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
  }, [token]);

  // Cargar lista de Productos desde la API
  useEffect(() => {
    if (!token) return;

    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error('No se pudieron obtener los productos');
        const data = await response.json();
        setProducts(data.products);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProducts();
  }, [token]);

  //Filtros
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProduct) {
      //  pruebas edicion solo local
      try {
        const response = await fetch(`${API_BASE_URL}/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: formTitle, price: formPrice })
        });
        
        if (response.ok) {
          setProducts(products.map(p => p.id === editingProduct.id ? { ...p, title: formTitle, price: formPrice } : p));
          alert('Producto editaado ok)');
        }
      } catch (err) {
        console.error("Error al editar:", err);
      }
    } else {
      try {
        const response = await fetch(`${API_BASE_URL}/products/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: formTitle, price: formPrice })
        });
        
        if (response.ok) {
      
          const newProductMock: Product = {
            id: Date.now(),
            title: formTitle,
            price: formPrice
          };
          setProducts([newProductMock, ...products]);
          alert('Producto agregado con éxito (Simulado en Local)');
        }
      } catch (err) {
        console.error("Error al crear:", err);
      }
    }
    closeModal();
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormTitle(product.title);
    setFormPrice(product.price);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormTitle('');
    setFormPrice(0);
  };

  const handleLogout = () => {
    setToken(null);
    setUserData(null);
    setPlatformUsers([]);
    setProducts([]);
    setActiveTab('profile');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
  };

  //  formulario de acceso
  if (!token || !userData) {
    return (
      <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Acceso al Panel del Blog</h2>
        
        {/*usuarios para selecciona */}
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <label className="block text-xs font-semibold text-blue-700 uppercase mb-1">
            Seleccionar usuario de prueba
          </label>
          <select 
            onChange={handleSelectTestUser}
            value={credentials.username}
            className="w-full text-sm p-1.5 bg-white border border-blue-200 rounded text-gray-700 outline-none"
          >
            {TEST_USERS.map(user => (
              <option key={user.username} value={user.username}>
                {user.name} ({user.username})
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Usuario</label>
            <input 
              name="username" 
              type="text" 
              value={credentials.username} 
              onChange={handleInputChange} 
              className="w-full mt-1 p-2 border rounded outline-none text-gray-800" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input 
              name="password" 
              type="password" 
              value={credentials.password} 
              onChange={handleInputChange} 
              className="w-full mt-1 p-2 border rounded outline-none text-gray-800" 
              required 
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors">
            {loading ? 'Validando...' : 'Ingresar'}
          </button>
        </form>
        {apiError && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">Error: {apiError}</div>}
      </div>
    );
  }

  // paenl solo con token
  return (
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

      {/* menus de de navegacion */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-3 text-center font-medium text-sm border-b-2 transition-colors ${activeTab === 'profile' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Mi Información
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 text-center font-medium text-sm border-b-2 transition-colors ${activeTab === 'users' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Lista de Usuarios
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-3 text-center font-medium text-sm border-b-2 transition-colors ${activeTab === 'products' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Módulo de Productos
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

        {/* Plista genera  de usuarios*/}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h5 className="font-bold text-gray-700">Usuarios de la plataforma</h5>
              <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-semibold">Sesión Activa</span>
            </div>

            {loading && <p className="text-center text-sm text-gray-500 py-4">Consultando usuarios...</p>}

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
      {/* Productos */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <h4 className="text-lg font-bold text-gray-800">Inventario General de Productos</h4>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded-lg font-bold transition-colors"
              >
                + Agregar Producto
              </button>
            </div>

            <input 
              type="text" 
              placeholder="Buscar por nombre de producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-lg text-sm outline-none focus:border-blue-500"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {filteredProducts.map((product) => (
                <div key={product.id} className="p-4 bg-gray-50 rounded-lg border flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-gray-800 text-sm truncate">{product.title}</h5>
                    <p className="text-xs text-green-600 font-bold mt-1">${product.price}</p>
                  </div>
                  <button 
                    onClick={() => openEditModal(product)}
                    className="mt-3 w-full bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs py-1.5 rounded font-medium transition-colors"
                  >
                    Editar
                  </button>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-6">No se encontraron productos.</p>
            )}
          </div>
        )}

        {apiError && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">Error: {apiError}</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg border">
            <h4 className="text-lg font-bold mb-4 text-gray-800">
              {editingProduct ? 'Modificar Producto' : 'Crear Nuevo Producto'}
            </h4>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">Nombre</label>
                <input 
                  type="text" 
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full mt-1 p-2 border rounded outline-none text-sm text-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">Precio ($)</label>
                <input 
                  type="number" 
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="w-full mt-1 p-2 border rounded outline-none text-sm text-gray-800"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  {editingProduct ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}