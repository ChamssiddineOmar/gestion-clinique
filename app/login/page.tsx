'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    // 1. Logique d'état (basée sur ton code)
    const [creds, setCreds] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // 2. Fonction de connexion mise à jour
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        console.log("1. Tentative de connexion (MedGest) :", creds.email);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(creds),
            });

            console.log("2. Réponse reçue, statut :", res.status);
            const data = await res.json();

            if (res.ok) {
                console.log("3. Succès ! Rôle :", data.user.role);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirection selon le rôle (MedGest)
                if (data.user.role === 'admin') {
                    router.push('/dashboard/admin');
                } else if (data.user.role === 'medecin') {
                    router.push('/dashboard/medecin');
                } else {
                    router.push('/dashboard/patient');
                }
            } else {
                console.error("4. Erreur :", data.error);
                alert(data.error || "Identifiants incorrects");
            }
        } catch (err) {
            console.error("5. Erreur critique :", err);
            alert("Erreur de connexion au serveur MySQL.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-slate-900">
            <div className="w-full max-w-md">
                
                {/* HEADER MEDGEST */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-[22px] mb-6 shadow-xl shadow-indigo-100">
                        <ShieldCheck className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter italic uppercase text-indigo-950">MedGest</h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Gestion Hospitalière</p>
                </div>

                {/* FORMULAIRE DESIGN MODERNE */}
                <div className="bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100 p-10">
                    <form onSubmit={handleLogin} className="space-y-6">
                        
                        {/* EMAIL */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input 
                                    type="email" 
                                    placeholder="exemple@mail.com"
                                    value={creds.email}
                                    onChange={(e) => setCreds({...creds, email: e.target.value})}
                                    className="w-full pl-16 pr-6 py-5 bg-slate-50 border-none rounded-[24px] outline-none font-bold text-sm focus:ring-4 focus:ring-indigo-500/5 transition-all text-slate-700"
                                    required
                                />
                            </div>
                        </div>

                        {/* MOT DE PASSE */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Mot de passe</label>
                            <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input 
                                    type="password" 
                                    placeholder="••••••••"
                                    value={creds.password}
                                    onChange={(e) => setCreds({...creds, password: e.target.value})}
                                    className="w-full pl-16 pr-6 py-5 bg-slate-50 border-none rounded-[24px] outline-none font-bold text-sm focus:ring-4 focus:ring-indigo-500/5 transition-all text-slate-700"
                                    required
                                />
                            </div>
                        </div>

                        {/* BOUTON SE CONNECTER */}
                        <button 
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:bg-slate-300 disabled:shadow-none"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>Se connecter <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>
                </div>

                {/* FOOTER */}
                <div className="text-center mt-8 space-y-3">
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        Nouveau ici ? 
                        <Link href="/register" className="text-indigo-600 ml-2 hover:underline">Créer un compte</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}