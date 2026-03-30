'use client';
import { useEffect, useState } from 'react';
import { Search, Clock, User, CheckCircle, Stethoscope, Trash2, AlertCircle, Phone, Loader2 } from 'lucide-react';

export default function PatientDashboard() {
    const [user, setUser] = useState<any>(null);
    const [allDispos, setAllDispos] = useState<any[]>([]);
    const [mesRdvs, setMesRdvs] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(storedUser);
        if (storedUser.id) {
            fetchData();
            fetchMesRdvs(storedUser.id);
        }
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/disponibilites');
            const data = await res.json();
            setAllDispos(Array.isArray(data) ? data : []);
        } finally { setLoading(false); }
    };

    const fetchMesRdvs = async (id: number) => {
        const res = await fetch(`/api/disponibilites?patient_id=${id}`);
        const data = await res.json();
        setMesRdvs(Array.isArray(data) ? data : []);
    };

    const actionRdv = async (dispoId: number, action: string) => {
        const res = await fetch('/api/disponibilites', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dispo_id: dispoId, patient_id: user.id, action }),
        });
        if (res.ok) { fetchData(); fetchMesRdvs(user.id); }
    };

    const filteredDispos = allDispos.filter((d: any) => 
        (d.medecin_name?.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (d.specialite?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen font-sans">
            {/* HEADER : Ton emplacement original */}
            <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">
                    Bonjour, {user?.name?.split(' ')[0] || 'Patient'} 👋
                </h1>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        type="text" placeholder="Rechercher un médecin..." 
                        className="w-full pl-12 pr-4 py-4 rounded-2xl shadow-sm border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900" 
                    />
                </div>
            </header>

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Médecins disponibles</h2>
                {loading && <Loader2 size={16} className="animate-spin text-blue-500" />}
            </div>

            {/* GRILLE : Tes cartes originales avec un design plus propre */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {filteredDispos.map((d: any) => (
                    <div key={d.id} className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 group hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                            <Stethoscope size={24} />
                        </div>
                        <h3 className="font-black text-slate-800 text-lg uppercase tracking-tighter">Dr. {d.medecin_name}</h3>
                        <p className="text-blue-500 text-[10px] font-black uppercase mb-2">{d.specialite || 'Généraliste'}</p>
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold mb-6 italic">
                            <Clock size={14} /> {new Date(d.date_heure).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <button onClick={() => actionRdv(d.id, 'reserver')} className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-xs uppercase hover:bg-blue-600 transition-all shadow-lg">
                            Prendre RDV
                        </button>
                    </div>
                ))}
            </div>

            {/* AGENDA : Restauré avec TOUTES les infos (Alerte, Téléphone) */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                    <CheckCircle className="text-green-500" size={28} /> Mon Agenda Personnel
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mesRdvs.map((r: any) => (
                        <div key={r.id} className={`p-6 rounded-2xl border transition-all ${r.statut === 'confirme' ? 'bg-green-50/20 border-green-100' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className={`p-4 rounded-xl shadow-sm ${r.statut === 'confirme' ? 'bg-green-600 text-white' : 'bg-white text-blue-600'}`}>
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 uppercase text-sm">Dr. {r.medecin_name}</p>
                                        <span className="text-[10px] font-bold text-slate-500 block italic">{new Date(r.date_heure).toLocaleString('fr-FR')}</span>
                                    </div>
                                </div>
                                {r.statut !== 'confirme' && (
                                    <button onClick={() => actionRdv(r.id, 'annuler')} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={20} /></button>
                                )}
                            </div>

                            <div className="mt-4">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${r.statut === 'confirme' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {r.statut === 'confirme' ? '✅ Rendez-vous Accepté' : '⏳ En attente de confirmation'}
                                </span>
                            </div>

                            {/* RESTAURÉ : Les infos de contact et d'alerte que j'avais cachées */}
                            {r.statut === 'confirme' && (
                                <div className="mt-4 pt-4 border-t border-green-100">
                                    <div className="flex items-start gap-2 text-amber-700 bg-amber-50 p-3 rounded-xl mb-3 border border-amber-100">
                                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                        <p className="text-[10px] font-bold leading-tight uppercase">Veuillez vous présenter au cabinet 15 minutes avant l'heure.</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase opacity-50">Contact :</span>
                                        <span className="text-sm font-black text-blue-900 flex items-center gap-1"><Phone size={14} /> {r.medecin_telephone || "00 00 00 00"}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}