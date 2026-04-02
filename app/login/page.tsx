'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [creds, setCreds] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(creds),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('user', JSON.stringify(data.user));
                if (data.user.role === 'admin') {
                    router.push('/dashboard/admin');
                } else if (data.user.role === 'medecin') {
                    router.push('/dashboard/medecin');
                } else {
                    router.push('/dashboard/patient');
                }
            } else {
                alert(data.error || "Identifiants incorrects");
            }
        } catch (err) {
            alert("Erreur de connexion au serveur MySQL.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans text-slate-900">
            {/* Conteneur principal avec largeur max adaptative */}
            <div className="w-full max-w-[400px] md:max-w-md">
                
                {/* HEADER MEDGEST RESPONSIVE */}
                <div className="text-center mb-6 md:mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-indigo-600 rounded-[20px] md:rounded-[22px] mb-4 md:mb-6 shadow-xl shadow-indigo-100">
                        <ShieldCheck className="text-white" size={28} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase text-indigo-950">MedGest</h1>
                    <p className="text-slate-400 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] mt-2">Gestion Hospitalière</p>
                </div>

                {/* CARTE DE CONNEXION RESPONSIVE */}
                <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100 p-6 md:p-10">
                    <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
                        
                        {/* EMAIL */}
                        <div className="space-y-2">
                            <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input 
                                    type="email" 
                                    placeholder="exemple@mail.com"
                                    value={creds.email}
                                    onChange={(e) => setCreds({...creds, email: e.target.value})}
                                    className="w-full pl-12 md:pl-16 pr-6 py-4 md:py-5 bg-slate-50 border-none rounded-[20px] md:rounded-[24px] outline-none font-bold text-sm focus:ring-4 focus:ring-indigo-500/5 transition-all text-slate-700"
                                    required
                                />
                            </div>
                        </div>

                        {/* MOT DE PASSE */}
                        <div className="space-y-2">
                            <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Mot de passe</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input 
                                    type="password" 
                                    placeholder="••••••••"
                                    value={creds.password}
                                    onChange={(e) => setCreds({...creds, password: e.target.value})}
                                    className="w-full pl-12 md:pl-16 pr-6 py-4 md:py-5 bg-slate-50 border-none rounded-[20px] md:rounded-[24px] outline-none font-bold text-sm focus:ring-4 focus:ring-indigo-500/5 transition-all text-slate-700"
                                    required
                                />
                            </div>
                        </div>

                        {/* BOUTON SE CONNECTER RESPONSIVE */}
                        <button 
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white py-4 md:py-5 rounded-[20px] md:rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:bg-slate-300 disabled:shadow-none"
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
                <div className="text-center mt-6 md:mt-8 space-y-3">
                    <p className="text-slate-400 font-bold text-[9px] md:text-[10px] uppercase tracking-widest">
                        Nouveau ici ? 
                        <Link href="/register" className="text-indigo-600 ml-2 hover:underline">Créer un compte</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}