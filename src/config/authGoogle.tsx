import { useState } from "react";


export const authGoogle = (middleware: string | null) => {
 const [midwaareState, setMiddlewareState] = useState<string | null>(middleware);
  if (midwaareState === "middlewareGoogle") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Redirigiendo a pagina prueba</h1>
      </div>)
 }
}

