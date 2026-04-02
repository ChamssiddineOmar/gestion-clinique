'use client';
import { useEffect, useState } from 'react';
import { Search, Clock, User, CheckCircle, Stethoscope, Trash2, AlertCircle, Phone, Loader2, Star, Check } from 'lucide-react';
import { Rating } from '@/components/Rating';

export default function PatientDashboard() {
    const [user, setUser] = useState<any>(null);
    const [allDispos, setAllDispos] = useState<any[]>([]);
    const [mesRdvs, setMesRdvs] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedMedecin, setSelectedMedecin] = useState<any>(null);
    const [userNote, setUserNote] = useState(5);
    const [userComment, setUserComment] = useState("");

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
        if (res.ok) { 
            fetchData(); 
            fetchMesRdvs(user.id); 
        }
    };

    const envoyerAvis = async () => {
        const res = await fetch('/api/avis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                medecin_id: selectedMedecin.medecin_id,
                patient_id: user.id,
                note: userNote,
                commentaire: userComment
            }),
        });

        if (res.ok) {
            setShowRatingModal(false);
            setUserComment("");
            setUserNote(5);
            fetchData();
            fetchMesRdvs(user.id);
        }
    };

    const filteredDispos = allDispos.filter((d: any) => 
        (d.medecin_name?.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (d.specialite?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen font-sans relative">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {filteredDispos.map((d: any) => (
                    <div key={d.id} className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 group hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                            <Stethoscope size={24} />
                        </div>
                        <h3 className="font-black text-slate-800 text-lg uppercase tracking-tighter">Dr. {d.medecin_name}</h3>
                        <p className="text-blue-500 text-[10px] font-black uppercase mb-1">{d.specialite || 'Généraliste'}</p>
                        
                        <Rating note={d.note_moyenne} total={d.total_avis} />

                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold mt-4 mb-6 italic">
                            <Clock size={14} /> {new Date(d.date_heure).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <button onClick={() => actionRdv(d.id, 'reserver')} className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-xs uppercase hover:bg-blue-600 transition-all shadow-lg">
                            Prendre RDV
                        </button>
                    </div>
                ))}
            </div>

            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                    <CheckCircle className="text-green-500" size={28} /> Mon Agenda Personnel
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mesRdvs.map((r: any) => (
                        <div key={r.id} className={`p-6 rounded-2xl border transition-all ${r.statut === 'confirme' ? 'bg-green-50/20 border-green-100' : r.statut === 'termine' ? 'bg-slate-50 border-slate-200 opacity-80' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className={`p-4 rounded-xl shadow-sm ${r.statut === 'confirme' ? 'bg-green-600 text-white' : 'bg-white text-blue-600'}`}>
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 uppercase text-sm">Dr. {r.medecin_name}</p>
                                        <Rating note={r.note_moyenne} total={r.total_avis} />
                                        <span className="text-[10px] font-bold text-slate-500 block italic mt-1">{new Date(r.date_heure).toLocaleString('fr-FR')}</span>
                                    </div>
                                </div>
                                {r.statut === 'libre' || r.statut === 'en_attente' && (
                                    <button onClick={() => actionRdv(r.id, 'annuler')} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={20} /></button>
                                )}
                            </div>

                            <div className="mt-4">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                    r.statut === 'confirme' ? 'bg-green-100 text-green-700' : 
                                    r.statut === 'termine' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {r.statut === 'confirme' ? '✅ Rendez-vous Accepté' : 
                                     r.statut === 'termine' ? '🏁 Consultation Terminée' : '⏳ En attente de confirmation'}
                                </span>
                            </div>

                            {r.statut === 'confirme' && (
                                <div className="mt-4 pt-4 border-t border-green-100">
                                    <div className="flex items-start gap-2 text-amber-700 bg-amber-50 p-3 rounded-xl mb-3 border border-amber-100">
                                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                        <p className="text-[10px] font-bold leading-tight uppercase">Veuillez vous présenter au cabinet 5 minutes avant l'heure.</p>
                                    </div>
                                    
                                    {/* NOUVEAU BOUTON : MARQUER COMME TERMINÉ */}
                                    <button 
                                        onClick={() => actionRdv(r.id, 'terminer')}
                                        className="w-full mb-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-black text-[10px] uppercase transition-all shadow-md flex items-center justify-center gap-2"
                                    >
                                        <Check size={14} /> J'ai terminé la séance
                                    </button>

                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[10px] font-black uppercase opacity-50">Contact :</span>
                                        <span className="text-sm font-black text-blue-900 flex items-center gap-1"><Phone size={14} /> {r.medecin_telephone || "00 00 00 00"}</span>
                                    </div>
                                </div>
                            )}

                            {/* SI TERMINÉ : ON PROPOSE L'AVIS */}
                            {r.statut === 'termine' && (
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <button 
                                        onClick={() => { setSelectedMedecin(r); setShowRatingModal(true); }}
                                        className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-black text-[10px] uppercase transition-all shadow-lg shadow-amber-100"
                                    >
                                        ⭐ Laisser un avis sur le Dr. {r.medecin_name}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL DE NOTATION */}
            {showRatingModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-black text-slate-900 mb-2 uppercase">Noter le Dr. {selectedMedecin?.medecin_name}</h2>
                        <p className="text-slate-500 text-[10px] mb-6 font-bold uppercase italic">Comment s'est passée votre consultation ?</p>
                        
                        <div className="flex justify-center gap-3 mb-8">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button 
                                    key={star} 
                                    onClick={() => setUserNote(star)}
                                    className={`text-4xl transition-all active:scale-90 ${star <= userNote ? 'text-yellow-400' : 'text-slate-100'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>

                        <textarea 
                            value={userComment}
                            onChange={(e) => setUserComment(e.target.value)}
                            placeholder="Écrivez un petit mot ici..."
                            className="w-full border border-slate-100 bg-slate-50 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-6 h-32 font-medium"
                        />

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowRatingModal(false)}
                                className="flex-1 py-4 text-slate-400 font-black uppercase text-[10px] hover:bg-slate-50 rounded-2xl transition-all"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={envoyerAvis}
                                className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                            >
                                Publier l'avis
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}