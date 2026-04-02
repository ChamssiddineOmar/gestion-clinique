'use client';
import { useState, useEffect } from 'react';
import { Send, LifeBuoy, CheckCircle2, Loader2, AlertCircle, ArrowLeft, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function SupportPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState("");
    const [userData, setUserData] = useState({ nom: '', email: '' });

    // Récupération automatique des infos utilisateur au chargement
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser.name || storedUser.email) {
            setUserData({
                nom: storedUser.name || '',
                email: storedUser.email || ''
            });
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage("");
        
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                setStatus('success');
            } else {
                const err = await res.json();
                setErrorMessage(err.error || "Une erreur est survenue lors de l'envoi.");
                setStatus('error');
            }
        } catch (err) {
            setErrorMessage("Impossible de joindre le serveur. Vérifiez votre connexion.");
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 md:p-6 font-sans">
            <div className="w-full max-w-xl">
                {/* Bouton Retour */}
                <Link href="/" className="group inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all mb-8 font-black text-[10px] uppercase tracking-[0.2em]">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
                    Retour à l'accueil
                </Link>

                <div className="bg-white rounded-[40px] md:rounded-[56px] p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden">
                    {/* Décoration d'arrière-plan */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50/50 rounded-bl-[120px] -z-0"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-5 mb-12">
                            <div className="p-4 bg-slate-900 text-white rounded-[24px] shadow-2xl rotate-3">
                                <LifeBuoy size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Centre d'Aide</h1>
                                <p className="text-[9px] text-indigo-500 font-black uppercase tracking-[0.3em] mt-2">Support Technique MedGest</p>
                            </div>
                        </div>

                        {status === 'success' ? (
                            <div className="py-10 text-center animate-in fade-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                    <CheckCircle2 size={48} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase">Message Reçu !</h2>
                                <p className="text-slate-500 mt-4 font-bold text-sm leading-relaxed max-w-[300px] mx-auto uppercase">
                                    L'équipe support traite votre demande. Une réponse vous sera envoyée sous 24h.
                                </p>
                                <button 
                                    onClick={() => setStatus('idle')}
                                    className="mt-10 px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
                                >
                                    Envoyer un autre message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {status === 'error' && (
                                    <div className="p-5 bg-rose-50 text-rose-600 rounded-[24px] flex items-center gap-3 text-xs font-black border border-rose-100 animate-bounce">
                                        <AlertCircle size={18} /> {errorMessage.toUpperCase()}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-widest">Votre Nom</label>
                                        <input 
                                            name="nom" 
                                            type="text" 
                                            defaultValue={userData.nom}
                                            placeholder="Nom complet" 
                                            required 
                                            className="w-full p-5 bg-slate-50 rounded-[24px] outline-none border-2 border-transparent focus:border-indigo-500 focus:bg-white text-sm font-bold transition-all placeholder:text-slate-300" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-widest">Votre Email</label>
                                        <input 
                                            name="email" 
                                            type="email" 
                                            defaultValue={userData.email}
                                            placeholder="email@exemple.com" 
                                            required 
                                            className="w-full p-5 bg-slate-50 rounded-[24px] outline-none border-2 border-transparent focus:border-indigo-500 focus:bg-white text-sm font-bold transition-all placeholder:text-slate-300" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-widest">Objet de la demande</label>
                                    <div className="relative">
                                        <select 
                                            name="sujet" 
                                            required 
                                            className="w-full p-5 bg-slate-50 rounded-[24px] outline-none border-2 border-transparent focus:border-indigo-500 focus:bg-white text-sm font-bold transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="Bug Technique"> Signaler un bug technique</option>
                                            <option value="Accès Compte">🔑 Problème d'accès au compte</option>
                                            <option value="Données">📁 Question sur les données médicales</option>
                                            <option value="Autre">💬 Autre demande</option>
                                        </select>
                                        <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-widest">Description</label>
                                    <textarea 
                                        name="message" 
                                        placeholder="Comment pouvons-nous vous aider ?" 
                                        rows={4} 
                                        required
                                        className="w-full p-6 bg-slate-50 rounded-[32px] outline-none border-2 border-transparent focus:border-indigo-500 focus:bg-white text-sm font-bold transition-all resize-none placeholder:text-slate-300"
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={status === 'loading'}
                                    className="w-full py-6 bg-indigo-600 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-700 transition-all flex justify-center items-center gap-3 shadow-[0_20px_40px_-12px_rgba(79,70,229,0.3)] disabled:opacity-70 active:scale-[0.97] mt-6"
                                >
                                    {status === 'loading' ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <><Send size={18} className="rotate-12" /> Transmettre le ticket</>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
                
                <p className="text-center mt-12 text-slate-400 text-[9px] font-black uppercase tracking-[0.4em] opacity-50">
                    Système de support chiffré &copy; 2026
                </p>
            </div>
        </div>
    );
}