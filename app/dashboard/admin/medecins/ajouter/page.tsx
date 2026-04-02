'use client';
import { useState } from 'react';
import { 
  UserPlus, Mail, Phone, Stethoscope, Lock, Loader2, 
  ShieldCheck, KeyRound, CheckCircle2, AlertCircle, List, Star
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [accessCode, setAccessCode] = useState('');
    const [authError, setAuthError] = useState(false);

    // Mise à jour de l'état initial pour correspondre à ton API
    const initialState = {
        nom: '', 
        prenom: '', 
        email: '', 
        password: '', 
        telephone: '', 
        specialite: '', 
        role: 'medecin' 
    };
    
    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (accessCode === '2026') {
            setIsAuthorized(true);
            setAuthError(false);
        } else {
            setAuthError(true);
            setAccessCode('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: "Médecin enregistré ! Il apparaîtra avec 0 avis par défaut." });
                setFormData(initialState);
                setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            } else {
                setMessage({ type: 'error', text: data.error || "Erreur lors de l'inscription." });
            }
        } catch (err) {
            setMessage({ type: 'error', text: "Erreur de connexion (Vérifiez XAMPP et votre API)." });
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
                <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 text-center border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={40} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2 italic uppercase tracking-tighter">MedGest Admin</h1>
                    <p className="text-slate-400 text-[10px] font-bold uppercase mb-8 tracking-widest">Zone Sécurisée</p>
                    
                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="relative">
                            <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input 
                                type="password" 
                                placeholder="Entrer le code secret" 
                                value={accessCode}
                                className={`w-full pl-14 pr-6 py-5 bg-slate-50 border-2 rounded-[24px] outline-none font-bold transition-all ${authError ? 'border-rose-500 bg-rose-50 animate-shake' : 'border-transparent focus:border-indigo-500/20'}`}
                                onChange={(e) => setAccessCode(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-lg active:scale-95">
                            Dévérrouiller l'accès
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen font-sans">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Personnel</h1>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">Gestion des Praticiens</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link 
                            href="/dashboard/admin/medecins" 
                            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-600 hover:text-indigo-600 hover:border-indigo-100 transition-all font-black text-[10px] uppercase tracking-widest"
                        >
                            <List size={16} /> Voir la liste
                        </Link>
                        <button onClick={() => setIsAuthorized(false)} className="bg-white border border-slate-100 text-slate-300 hover:text-rose-500 transition-all p-3 rounded-2xl shadow-sm">
                            <Lock size={20} />
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[48px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 relative overflow-hidden">
                    {/* Badge Décoratif Statistiques */}
                    <div className="absolute top-8 right-8 flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-black text-amber-600 uppercase">Notation Active</span>
                    </div>

                    <div className="flex items-center gap-5 mb-10">
                        <div className="p-4 bg-indigo-600 text-white rounded-[24px] shadow-lg shadow-indigo-100">
                            <UserPlus size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Ajouter un Medecin</h2>
                            <p className="text-sm text-slate-400 font-medium">Nouveau Medecin</p>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`mb-8 p-5 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                            {message.type === 'success' ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
                            <span className="font-bold text-sm">{message.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Nom </label>
                                <input type="text" placeholder="" required 
                                    className="w-full p-5 bg-slate-50 rounded-[24px] outline-none border-2 border-transparent focus:border-indigo-500/10 text-sm font-bold transition-all"
                                    value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Prénom</label>
                                <input type="text" placeholder="" required 
                                    className="w-full p-5 bg-slate-50 rounded-[24px] outline-none border-2 border-transparent focus:border-indigo-500/10 text-sm font-bold transition-all"
                                    value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} />
                            </div>
                        </div>

                        <div className="relative pt-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Identifiant de connexion</label>
                            <Mail className="absolute left-5 top-[58px] -translate-y-1/2 text-slate-300" size={18} />
                            <input type="email" placeholder="email@clinique.com" required 
                                className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[24px] outline-none border-2 border-transparent focus:border-indigo-500/10 text-sm font-bold transition-all"
                                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="relative pt-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Expertise</label>
                                <Stethoscope className="absolute left-5 top-[58px] -translate-y-1/2 text-slate-300" size={18} />
                                <input type="text" placeholder="Ex: Cardiologue" required 
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[24px] outline-none border-2 border-transparent focus:border-indigo-500/10 text-sm font-bold transition-all"
                                    value={formData.specialite} onChange={e => setFormData({...formData, specialite: e.target.value})} />
                            </div>
                            <div className="relative pt-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Contact</label>
                                <Phone className="absolute left-5 top-[58px] -translate-y-1/2 text-slate-300" size={18} />
                                <input type="tel" placeholder="" required 
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[24px] outline-none border-2 border-transparent focus:border-indigo-500/10 text-sm font-bold transition-all"
                                    value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} />
                            </div>
                        </div>

                        <div className="relative pt-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Sécurité</label>
                            <Lock className="absolute left-5 top-[58px] -translate-y-1/2 text-slate-300" size={18} />
                            <input type="password" placeholder="Mot de passe temporaire" required 
                                className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[24px] outline-none border-2 border-transparent focus:border-indigo-500/10 text-sm font-bold transition-all"
                                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        </div>

                        <button type="submit" disabled={loading} 
                            className="w-full py-6 bg-indigo-600 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all flex justify-center items-center gap-3 shadow-xl shadow-indigo-100 disabled:opacity-70 active:scale-[0.98]">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Enregistrer le praticien"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}