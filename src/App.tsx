import './App.css'

import { MainBlog } from './components/mainBlog'
import UserList from './components/listUser'

function App() {
  return (
   
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12 font-sans">
      <header className="text-center border-b pb-6">
        <h1 className="text-3xl font-black text-gray-900">Mi Aplicación de Blog</h1>
        <p className="text-gray-500 mt-1">Pruebas de API con DummyJSON, TypeScript y Zod</p>
      </header>

      <section>
                  <p className="text-gray-500">SECCION BLOC PRINCIPAL ----------o-----------</p>

        <MainBlog />
      </section>

      <hr className="border-gray-200" />

      <section>
        <div className="mb-6">
          <p className="text-gray-500">SECCION USUARUOS </p>
        </div>
        <UserList />
      </section>
    </div>
  )
}

export default App