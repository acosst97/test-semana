import { useState, useEffect } from 'react';
import type { Product } from '../interfaces/product';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dummyjson.com';

export default function products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formPrice, setFormPrice] = useState<number>(0);

//   cargar los datos de los producctos
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const data = await response.json();
        setProducts(data.products);
      } catch (err) {
        console.error("Error cargando productos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProduct) {
      try {
        const response = await fetch(`${API_BASE_URL}/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: formTitle, price: formPrice })
        });
        const updatedData = await response.json();
        
        // Actualizamos el estado local simulando el guardado
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, title: formTitle, price: formPrice } : p));
        alert('Producto editado con éxito (Simulado)');
      } catch (err) {
        console.error(err);
      }
    } else {
      // MODO CREACIÓN (POST)
      try {
        const response = await fetch(`${API_BASE_URL}/products/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: formTitle, price: formPrice })
        });
        const newData = await response.json();
        
        // DummyJSON devuelve un ID nuevo, lo metemos al inicio de nuestra lista local
        setProducts([{ id: Date.now(), title: formTitle, price: formPrice, category: 'test', description: 'Nuevo' }, ...products]);
        alert('Producto agregado con éxito (Simulado)');
      } catch (err) {
        console.error(err);
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

  return (
    <div className="max-w-5xl mx-auto my-6 p-6 bg-white rounded-xl shadow-sm border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Gestión de Productos</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          + Agregar Producto
        </button>
      </div>

      {/* Input de Buscador */}
      <div className="mb-4">
        <input 
          type="text"
          placeholder="Buscar producto por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-500 text-sm"
        />
      </div>

      {loading ? (
        <p className="text-center py-10 text-gray-500">Cargando inventario...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="p-4 border rounded-xl bg-gray-50 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-gray-800 text-base mb-1">{product.title}</h4>
                <p className="text-green-600 font-semibold text-sm">${product.price}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => openEditModal(product)}
                  className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs py-2 rounded font-medium transition-colors"
                >
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
            <h4 className="text-lg font-bold mb-4 text-gray-800">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h4>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">Nombre</label>
                <input 
                  type="text" 
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full mt-1 p-2 border rounded outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">Precio ($)</label>
                <input 
                  type="number" 
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="w-full mt-1 p-2 border rounded outline-none text-sm"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}