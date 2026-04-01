'use client';
import { useState } from 'react';
import { 
  UserPlus, Mail, Phone, Stethoscope, Lock, Loader2, 
  ShieldCheck, KeyRound, CheckCircle2, AlertCircle, List 
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [accessCode, setAccessCode] = useState('');
    const [authError, setAuthError] = useState(false);

    const initialState = {
        nom: '', prenom: '', email: '', password: '', 
        telephone: '', specialite: '', role: 'medecin'
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

            if (res.ok) {
                setMessage({ type: 'success', text: "Médecin enregistré avec succès !" });
                setFormData(initialState);
                setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.error || "Erreur lors de l'inscription." });
            }
        } catch (err) {
            setMessage({ type: 'error', text: "Erreur de connexion (Vérifiez XAMPP)." });
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 text-center border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={40} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2 italic uppercase">Admin</h1>
                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="relative">
                            <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input 
                                type="password" 
                                placeholder="Code secret" 
                                value={accessCode}
                                className={`w-full pl-14 pr-6 py-5 bg-slate-50 border-2 rounded-[24px] outline-none font-bold transition-all ${authError ? 'border-rose-500 bg-rose-50' : 'border-transparent focus:border-indigo-500/20'}`}
                                onChange={(e) => setAccessCode(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all">
                            Déverrouiller
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
                    {/* TITRE ET SOUS-TITRE */}
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Personnel</h1>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Enregistrement</p>
                    </div>

                    {/* BOUTON VERS LA LISTE */}
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/dashboard/admin/medecins" 
                            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-600 hover:text-indigo-600 hover:border-indigo-100 transition-all font-black text-[10px] uppercase tracking-widest"
                        >
                            <List size={16} /> Liste des médecins
                        </Link>
                        <button onClick={() => setIsAuthorized(false)} className="text-slate-300 hover:text-rose-500 transition-colors p-2">
                            <Lock size={22} />
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[48px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100">
                    <div className="flex items-center gap-5 mb-10">
                        <div className="p-4 bg-indigo-600 text-white rounded-[24px] shadow-lg shadow-indigo-100">
                            <UserPlus size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Nouveau Praticien</h2>
                            <p className="text-sm text-slate-400 font-medium">Créer un compte professionnel</p>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`mb-8 p-4 rounded-3xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            <span className="font-bold text-sm">{message.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <input type="text" placeholder="Nom" required 
                                className="w-full p-5 bg-slate-50 rounded-[24px] outline-none border-2 border-transparent focus:border-indigo-500/10 text-sm font-bold transition-all"
                                value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
                            <input type="text" placeholder="Prénom" required 
                                className="w-full p-5 bg-slate-50 rounded-[24px] outline-none border-2 border-transparent focus:border-indigo-500/10 text-sm font-bold transition-all"
                                value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input type="email" placeholder="Email professionnel" required 
                                className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[24px] outline-none border-2 border-transparent focus:border-indigo-500/10 text-sm font-bold transition-all"
                                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="relative">
                                <Stethoscope className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input type="text" placeholder="Spécialité" required 
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[24px] outline-none border-2 border-transparent focus:border-indigo-500/10 text-sm font-bold transition-all"
                                    value={formData.specialite} onChange={e => setFormData({...formData, specialite: e.target.value})} />
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input type="tel" placeholder="Téléphone" required 
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[24px] outline-none border-2 border-transparent focus:border-indigo-500/10 text-sm font-bold transition-all"
                                    value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} />
                            </div>
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input type="password" placeholder="Mot de passe temporaire" required 
                                className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[24px] outline-none border-2 border-transparent focus:border-indigo-500/10 text-sm font-bold transition-all"
                                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        </div>

                        <button type="submit" disabled={loading} 
                            className="w-full py-6 bg-indigo-600 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all flex justify-center items-center gap-3 shadow-xl shadow-indigo-100 disabled:opacity-70">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Valider l'inscription"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}