'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [creds, setCreds] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        console.log("1. Tentative de connexion avec :", creds.email);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(creds),
            });

            console.log("2. Réponse du serveur reçue, statut :", res.status);
            const data = await res.json();

            if (res.ok) {
                console.log("3. Connexion réussie ! Rôle :", data.user.role);
                // Sauvegarde des infos utilisateur
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirection basée sur le rôle
                if (data.user.role === 'medecin') {
                    router.push('/dashboard/medecin');
                } else {
                    router.push('/dashboard/patient');
                }
            } else {
                console.error("4. Erreur API :", data.error);
                alert(data.error || "Identifiants incorrects");
            }
        } catch (err) {
            console.error("5. Erreur critique (Fetch) :", err);
            alert("Impossible de contacter le serveur. Vérifie ta connexion MySQL.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white shadow-xl rounded-2xl w-full max-w-md border border-gray-200">
                <h1 className="text-2xl font-bold text-center mb-6 text-green-700">Connexion Clinique</h1>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input 
                            type="email" 
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="exemple@mail.com"
                            onChange={(e) => setCreds({...creds, email: e.target.value})} 
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                        <input 
                            type="password" 
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="••••••••"
                            onChange={(e) => setCreds({...creds, password: e.target.value})} 
                            required 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition disabled:bg-gray-400"
                    >
                        {isLoading ? "Vérification..." : "Se connecter"}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Nouveau ici ? <a href="/register" className="text-green-600 font-semibold">Créer un compte</a>
                </p>
            </div>
        </div>
    );
}