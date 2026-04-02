'use client';
import { useEffect, useState } from 'react';
import { 
    Search, Clock, User, CheckCircle, Stethoscope, 
    Trash2, AlertCircle, Phone, Loader2, Star, 
    Check, Calendar, LifeBuoy 
} from 'lucide-react';
import { Rating } from '@/components/Rating';
import Link from 'next/link'; // Import crucial pour la navigation

export default function PatientDashboard() {
    const [user, setUser] = useState<any>(null);
    const [allDispos, setAllDispos] = useState<any[]>([]);
    const [mesRdvs, setMesRdvs] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

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
        } catch (error) {
            console.error("Erreur chargement dispos:", error);
        } finally { setLoading(false); }
    };

    const fetchMesRdvs = async (id: number) => {
        try {
            const res = await fetch(`/api/disponibilites?patient_id=${id}`);
            const data = await res.json();
            setMesRdvs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erreur chargement RDVs:", error);
        }
    };

    const actionRdv = async (dispoId: number, action: string) => {
        try {
            setProcessingId(dispoId);
            const res = await fetch('/api/disponibilites', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dispo_id: dispoId, patient_id: user.id, action }),
            });
            if (res.ok) { 
                await Promise.all([fetchData(), fetchMesRdvs(user.id)]);
            }
        } finally {
            setProcessingId(null);
        }
    };

    const envoyerAvis = async () => {
        if (!userComment.trim()) return alert("Veuillez laisser un petit commentaire.");
        
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
            
            {/* HEADER AVEC BOUTON SUPPORT */}
            <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">
                            Bonjour, {user?.name?.split(' ')[0] || 'Patient'} 👋
                        </h1>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">
                            Espace Patient MedGest
                        </p>
                    </div>

                    <Link 
                        href="/support" 
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 rounded-full font-black text-[10px] uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-slate-100 group"
                    >
                        <LifeBuoy size={14} className="group-hover:rotate-45 transition-transform" />
                        Centre d'aide
                    </Link>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        type="text" placeholder="Rechercher un médecin..." 
                        className="w-full pl-12 pr-4 py-4 rounded-2xl shadow-sm border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 transition-all" 
                    />
                </div>
            </header>

            {/* SECTION: MEDECINS DISPONIBLES */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Médecins disponibles</h2>
                {loading && <Loader2 size={16} className="animate-spin text-indigo-500" />}
            </div>

            {filteredDispos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {filteredDispos.map((d: any) => (
                        <div key={d.id} className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Stethoscope size={24} />
                            </div>
                            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tighter">Dr. {d.medecin_name}</h3>
                            <p className="text-indigo-500 text-[10px] font-black uppercase mb-1">{d.specialite || 'Généraliste'}</p>
                            
                            <Rating note={d.note_moyenne} total={d.total_avis} />

                            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold mt-4 mb-6 italic">
                                <Clock size={14} /> {new Date(d.date_heure).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <button 
                                disabled={processingId === d.id}
                                onClick={() => actionRdv(d.id, 'reserver')} 
                                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-black text-xs uppercase hover:bg-indigo-600 disabled:bg-slate-300 transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                {processingId === d.id ? <Loader2 size={14} className="animate-spin" /> : "Prendre RDV"}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-slate-100/50 rounded-[32px] border-2 border-dashed border-slate-200 mb-12">
                    <Search className="mx-auto text-slate-300 mb-2" size={40} />
                    <p className="text-slate-500 font-bold text-sm uppercase">Aucun médecin disponible.</p>
                </div>
            )}

            {/* SECTION: AGENDA */}
            <div className="bg-white p-6 md:p-10 rounded-[40px] shadow-sm border border-slate-100 mb-20">
                <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 uppercase italic tracking-tighter">
                    <Calendar className="text-indigo-500" size={28} /> Mon Agenda
                </h2>
                
                {mesRdvs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mesRdvs.map((r: any) => (
                            <div key={r.id} className={`p-6 rounded-[24px] border transition-all ${r.statut === 'confirme' ? 'bg-emerald-50/30 border-emerald-100' : r.statut === 'termine' ? 'bg-slate-50 border-slate-200 opacity-80' : 'bg-white border-slate-100'}`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className={`p-4 rounded-xl shadow-sm ${r.statut === 'confirme' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-indigo-600'}`}>
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 uppercase text-sm tracking-tight">Dr. {r.medecin_name}</p>
                                            <Rating note={r.note_moyenne} total={r.total_avis} />
                                            <span className="text-[10px] font-bold text-slate-400 block italic mt-1">{new Date(r.date_heure).toLocaleString('fr-FR')}</span>
                                        </div>
                                    </div>
                                    {(r.statut === 'libre' || r.statut === 'en_attente') && (
                                        <button 
                                            disabled={processingId === r.id}
                                            onClick={() => actionRdv(r.id, 'annuler')} 
                                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            {processingId === r.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={20} />}
                                        </button>
                                    )}
                                </div>

                                <div className="mt-5">
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                        r.statut === 'confirme' ? 'bg-emerald-100 text-emerald-700' : 
                                        r.statut === 'termine' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {r.statut === 'confirme' ? '✅ Accepté' : 
                                         r.statut === 'termine' ? '🏁 Terminé' : '⏳ En attente'}
                                    </span>
                                </div>

                                {r.statut === 'confirme' && (
                                    <div className="mt-5 pt-5 border-t border-emerald-100/50">
                                        <button 
                                            disabled={processingId === r.id}
                                            onClick={() => actionRdv(r.id, 'terminer')}
                                            className="w-full mb-3 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-black text-[10px] uppercase transition-all shadow-md flex items-center justify-center gap-2"
                                        >
                                            {processingId === r.id ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Marquer comme terminé</>}
                                        </button>
                                        <div className="flex items-center justify-between px-1">
                                            <span className="text-[10px] font-black uppercase opacity-40 italic">Contact</span>
                                            <span className="text-xs font-black text-slate-700 flex items-center gap-1.5"><Phone size={12} /> {r.medecin_telephone || "Non renseigné"}</span>
                                        </div>
                                    </div>
                                )}

                                {r.statut === 'termine' && (
                                    <div className="mt-5 pt-5 border-t border-slate-200">
                                        <button 
                                            onClick={() => { setSelectedMedecin(r); setShowRatingModal(true); }}
                                            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-black text-[10px] uppercase transition-all shadow-lg shadow-amber-100"
                                        >
                                            ⭐ Laisser un avis
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest italic opacity-60">Aucun rendez-vous dans votre agenda</p>
                    </div>
                )}
            </div>

            {/* MODAL DE NOTATION */}
            {showRatingModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 border border-slate-100">
                        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase text-center italic tracking-tighter">Votre Avis</h2>
                        <p className="text-slate-400 text-[10px] mb-8 font-black uppercase tracking-widest text-center">Consultation avec Dr. {selectedMedecin?.medecin_name}</p>
                        
                        <div className="flex justify-center gap-3 mb-10">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button 
                                    key={star} 
                                    onClick={() => setUserNote(star)}
                                    className={`text-4xl transition-all active:scale-90 transform ${star <= userNote ? 'text-amber-400 scale-110' : 'text-slate-100 hover:text-slate-200'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>

                        <textarea 
                            value={userComment}
                            onChange={(e) => setUserComment(e.target.value)}
                            placeholder="Comment s'est déroulée la séance ?"
                            className="w-full border-2 border-slate-50 bg-slate-50 rounded-[24px] p-5 text-sm outline-none focus:border-indigo-500 focus:bg-white mb-8 h-32 font-bold transition-all resize-none"
                        />

                        <div className="flex gap-4">
                            <button 
                                onClick={() => setShowRatingModal(false)}
                                className="flex-1 py-4 text-slate-400 font-black uppercase text-[10px] hover:bg-slate-100 rounded-2xl transition-all tracking-widest"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={envoyerAvis}
                                className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all tracking-widest"
                            >
                                Envoyer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* BOUTON FLOTTANT DE SUPPORT (FIXE) */}
            <Link 
                href="/support" 
                className="fixed bottom-8 right-8 bg-slate-900 text-white p-4 rounded-[22px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:bg-indigo-600 transition-all group flex items-center gap-3 z-50 overflow-hidden max-w-[56px] hover:max-w-[220px] duration-500 ease-in-out border border-slate-800"
            >
                <LifeBuoy size={24} className="shrink-0 group-hover:rotate-90 transition-transform duration-500" />
                <span className="font-black text-[10px] uppercase tracking-[0.2em] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Aide MedGest
                </span>
            </Link>

        </div>
    );
}