import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-red-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-red-600">404</h1>
          <p className="text-2xl font-semibold text-gray-800 mt-4">
            Página no encontrada
          </p>
          <p className="text-gray-600 mt-2">
            Lo sentimos, la página que buscas no existe.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/Aula-Finder"
            className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            Volver al inicio
          </Link>
          
          <p className="text-sm text-gray-500 mt-4">
            Si crees que esto es un error, por favor{" "}
            <a
              href="https://github.com/Open-Source-Uniandes/Aula-Finder/issues"
              className="text-red-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              reporta el problema
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
