import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-4xl font-extrabold text-blue-900 mb-4 text-center">
        Gestion de la Clinique
      </h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
        Bienvenue sur votre plateforme de gestion de rendez-vous médicaux.
      </p>

      <div className="flex gap-4">
        <Link href="/login" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
          Se Connecter
        </Link>
        <Link href="/register" 
              className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
          Créer un compte
        </Link>
      </div>
      
      <div className="mt-12 text-sm text-gray-400">
        Projet Examen STI 2026
      </div>
    </div>
  );
}