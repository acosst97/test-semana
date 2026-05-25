import  { type ChangeEvent } from "react";
import { useEffect, useState } from "react";
import type {
  Post,
  PostsResponse,
  User,
  UsersResponse,
} from "../interfaces/dummyData";
export const MainBlog = () => {
  const [post, setPost] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [seleectedUser, setSelectedUser] = useState<string>("");
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const dataInit = async () => {
      try {
        const postsRes = await fetch("https://dummyjson.com/posts");
        console.log("ENTRO PASO 1 post ", postsRes);
        const postsData: PostsResponse = await postsRes.json();
        setPost(postsData.posts);
        console.log(" ENTRO PASO 2 data", postsData);

        const usersRes = await fetch("https://dummyjson.com/users");
        const usersData: UsersResponse = await usersRes.json();
        setUsers(usersData.users);
        console.log("entro paso 1 consulta todos los usuarios", usersData);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("No se pudieron cargar los datos. Intenta nuevamente.");
      }
    };

    dataInit();
  }, []);

  const getNombr = (userId: number): string => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Autor Desconocido";
  };

  const handleUserChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedUser(e.target.value);
  };

  const filteredPosts = seleectedUser
    ? post.filter((post) => post.userId === parseInt(seleectedUser))
    : post;

  if (error) {
    return (
      <div className="m-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
        <span className="font-semibold"> hubo rrror:</span> {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 bg-gray-50 min-h-screen">
      
      <aside className="w-full md:w-64 bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-fit">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Filtrar por Usuario</h3>
        <select 
          value={seleectedUser} 
          onChange={handleUserChange}
          className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-all"
        >
          <option value="">Todos los autores</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.firstName} {user.lastName}
            </option>
          ))}
        </select>
      </aside>

      {/*  priemra solicitud */}
      <main className="flex-1">
        <h2 className="text-2xl font-ls text-gray-900 mb-6">Publicaciones recientes</h2>
        <div className="flex flex-col gap-6">
          {filteredPosts.map((post) => (
            <article key={post.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-gray-800 mb-1 hover:text-blue-600 cursor-pointer transition-colors">
                {post.title}
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Por: <span className="font-semibold text-gray-700">{getNombr(post.userId)}</span>
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                {post.body.substring(0, 150)}...
              </p>
              
              
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span key={tag} className="bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-1 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>

              <button 
                onClick={() => setActivePost(post)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors"
              >
                Ver interacciones
              </button>
            </article>
          ))}
        </div>
      </main>

      {/* detalles */}
      {activePost && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
    
    {/* Contenedor del Modal */}
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 transform transition-all p-6 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Cabecera */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-gray-950 pr-4 leading-snug">
          {activePost.title}
        </h2>
        <button 
          onClick={() => setActivePost(null)}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Cuerpo de Métricas */}
      <div className="border-t border-b border-gray-100 py-4 my-4 space-y-3.5">
        <div className="flex justify-between items-center bg-slate-50 px-4 py-2.5 rounded-lg">
          <span className="text-sm font-semibold text-gray-600">Vistas totales</span>
          <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border text-sm">
            {activePost.views}
          </span>
        </div>
        
        <div className="flex justify-between items-center bg-emerald-50/50 px-4 py-2.5 rounded-lg">
          <span className="text-sm font-semibold text-emerald-800">Me gusta (Likes)</span>
          <span className="font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-100 text-sm">
            {activePost.reactions.likes}
          </span>
        </div>

        <div className="flex justify-between items-center bg-rose-50/50 px-4 py-2.5 rounded-lg">
          <span className="text-sm font-semibold text-rose-800">No me gusta (Dislikes)</span>
          <span className="font-mono font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-100 text-sm">
            {activePost.reactions.dislikes}
          </span>
        </div>
      </div>

      {/* Cierre */}
      <div className="flex justify-end pt-2">
        <button 
          onClick={() => setActivePost(null)}
          className="w-full sm:w-auto px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-colors"
        > 
        Cerrar
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
};
