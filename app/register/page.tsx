'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Calendar, Phone, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        nom: '', 
        prenom: '', 
        email: '', 
        password: '', 
        telephone: '', 
        date_naissance: '',
        role: 'patient' // Forcé en patient
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/login');
            } else {
                setError(data.error || "Une erreur est survenue.");
            }
        } catch (err) {
            setError("Impossible de contacter le serveur.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] p-4 font-sans text-slate-900">
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[40px] p-8 border border-slate-100">
                
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Créer un compte</h1>
                    <p className="text-slate-500 font-medium mt-2">Espace Patient — Gérez vos rendez-vous</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                            <input type="text" placeholder="Nom" required
                                className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 text-sm font-medium"
                                onChange={(e) => setFormData({...formData, nom: e.target.value})} />
                        </div>
                        <div className="relative">
                            <input type="text" placeholder="Prénom" required
                                className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 text-sm font-medium"
                                onChange={(e) => setFormData({...formData, prenom: e.target.value})} />
                        </div>
                    </div>

                    <div className="relative">
                        <Calendar className="absolute left-4 top-4 text-slate-400" size={18} />
                        <input type="date" required
                            className="pl-12 w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 text-sm font-medium"
                            onChange={(e) => setFormData({...formData, date_naissance: e.target.value})} />
                    </div>

                    <div className="relative">
                        <Phone className="absolute left-4 top-4 text-slate-400" size={18} />
                        <input type="tel" placeholder="Téléphone" required
                            className="pl-12 w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 text-sm font-medium"
                            onChange={(e) => setFormData({...formData, telephone: e.target.value})} />
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-4 top-4 text-slate-400" size={18} />
                        <input type="email" placeholder="Email" required
                            className="pl-12 w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 text-sm font-medium"
                            onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-4 text-slate-400" size={18} />
                        <input type="password" placeholder="Mot de passe" required
                            className="pl-12 w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 text-sm font-medium"
                            onChange={(e) => setFormData({...formData, password: e.target.value})} />
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full mt-4 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : "S'inscrire"}
                        {!loading && <ChevronRight size={18} />}
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                    <p className="text-sm text-slate-500 font-medium">
                        Déjà un compte ? <Link href="/login" className="text-indigo-600 font-bold hover:underline">Se connecter</Link>
                    </p>
                </div>
            </form>
        </div>
    );
}