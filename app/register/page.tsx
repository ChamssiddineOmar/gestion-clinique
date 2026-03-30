'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Calendar, Stethoscope, ChevronRight, Loader2, Phone } from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        nom: '', 
        prenom: '', 
        email: '', 
        password: '', 
        telephone: '', // Ajouté ici
        date_naissance: '', 
        role: 'patient', 
        specialite: ''
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
                body: JSON.stringify({
                    ...formData,
                    // Si c'est un patient, on s'assure que la spécialité est vide
                    specialite: formData.role === 'medecin' ? formData.specialite : null
                }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/login');
            } else {
                setError(data.error || "Une erreur est survenue lors de l'inscription.");
            }
        } catch (err) {
            setError("Impossible de contacter le serveur. Vérifiez votre connexion.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
            <form onSubmit={handleSubmit} className="p-8 bg-white shadow-2xl rounded-[40px] w-full max-w-lg border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-slate-900 leading-tight">Rejoignez-nous</h1>
                    <p className="text-slate-500 font-medium mt-2">Créez votre compte en quelques secondes</p>
                </div>
                
                {/* Affichage de l'erreur */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl animate-shake">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="relative text-slate-900">
                        <User className="absolute left-4 top-4 text-gray-400" size={18} />
                        <input type="text" placeholder="Nom" className="pl-12 w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                            onChange={(e) => setFormData({...formData, nom: e.target.value})} required />
                    </div>
                    <div className="text-slate-900">
                        <input type="text" placeholder="Prénom" className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                            onChange={(e) => setFormData({...formData, prenom: e.target.value})} required />
                    </div>
                </div>

                <div className="relative mb-4 text-slate-900">
                    <Calendar className="absolute left-4 top-4 text-gray-400" size={18} />
                    <input type="date" className="pl-12 w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                        onChange={(e) => setFormData({...formData, date_naissance: e.target.value})} required />
                </div>

                <div className="relative mb-4 text-slate-900">
                    <Mail className="absolute left-4 top-4 text-gray-400" size={18} />
                    <input type="email" placeholder="Email" className="pl-12 w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                        onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                </div>

                {/* --- NOUVEAU CHAMP TÉLÉPHONE --- */}
                <div className="relative mb-4 text-slate-900">
                    <Phone className="absolute left-4 top-4 text-gray-400" size={18} />
                    <input 
                        type="tel" 
                        placeholder="Numéro de téléphone" 
                        className="pl-12 w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                        onChange={(e) => setFormData({...formData, telephone: e.target.value})} 
                        required 
                    />
                </div>
                {/* ------------------------------- */}

                <div className="relative mb-6 text-slate-900">
                    <Lock className="absolute left-4 top-4 text-gray-400" size={18} />
                    <input type="password" placeholder="Mot de passe" className="pl-12 w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                        onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                </div>

                <div className="bg-slate-50 p-5 rounded-[24px] mb-6 border border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Votre rôle</label>
                    <select className="w-full bg-transparent outline-none font-bold text-slate-900 cursor-pointer"
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}>
                        <option value="patient">Patient (Rechercher un RDV)</option>
                        <option value="medecin">Médecin (Gérer mes disponibilités)</option>
                    </select>
                </div>

                {formData.role === 'medecin' && (
                    <div className="relative mb-6 animate-in slide-in-from-top-4 duration-500 text-slate-900">
                        <Stethoscope className="absolute left-4 top-4 text-blue-600" size={18} />
                        <input type="text" placeholder="Spécialité (ex: Cardiologue)" className="pl-12 w-full p-4 bg-blue-50/50 border-2 border-blue-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-blue-900 font-bold"
                            onChange={(e) => setFormData({...formData, specialite: e.target.value})} required />
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-slate-900 text-white p-5 rounded-[24px] font-bold hover:bg-blue-600 transition-all flex justify-center items-center gap-2 shadow-xl shadow-slate-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>Un instant... <Loader2 className="animate-spin" size={20} /></>
                    ) : (
                        <>Confirmer l'inscription <ChevronRight size={20} /></>
                    )}
                </button>
                
                <p className="text-center mt-6 text-sm text-slate-500 font-medium">
                    Déjà un compte ? <a href="/login" className="text-blue-600 font-bold hover:underline">Se connecter</a>
                </p>
            </form>
        </div>
    );
}