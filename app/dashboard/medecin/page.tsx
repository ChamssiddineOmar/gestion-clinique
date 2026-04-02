'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link'; // Import pour la redirection
import { 
    Plus, Check, X, Trash2, Clock, 
    Stethoscope, Phone, Star, Archive, CheckCircle2,
    LifeBuoy // Icône de support
} from 'lucide-react';
import { Rating } from '@/components/Rating';

export default function MedecinDashboard() {
    const [user, setUser] = useState<any>(null);
    const [dispos, setDispos] = useState<any[]>([]);
    const [newDate, setNewDate] = useState('');
    const [stats, setStats] = useState({ note: 0, total: 0 });

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser.id) {
            setUser(storedUser);
            fetchDispos(storedUser.id);
            fetchMyStats(storedUser.id);
        }
    }, []);

    // --- LOGIQUE DE FILTRAGE PAR SEMAINE ---
    const isThisWeek = (dateValue: string | Date) => {
        const now = new Date();
        const date = new Date(dateValue);
        const startOfWeek = new Date(now);
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return date >= startOfWeek && date <= endOfWeek;
    };

    const fetchMyStats = async (id: number) => {
        try {
            const res = await fetch('/api/auth/register'); 
            const data = await res.json();
            const myData = data.find((m: any) => m.id === id);
            if (myData) {
                setStats({ 
                    note: Number(myData.note_moyenne) || 0, 
                    total: Number(myData.total_avis) || 0 
                });
            }
        } catch (err) {
            console.error("Erreur stats:", err);
        }
    };

    const fetchDispos = async (id: number) => {
        try {
            const res = await fetch(`/api/disponibilites?medecin_id=${id}`);
            const data = await res.json();
            setDispos(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Erreur dispos:", err);
        }
    };

    const actionRdv = async (id: number, action: string) => {
        const res = await fetch('/api/disponibilites', { 
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dispo_id: id, action }) 
        });
        if (res.ok) fetchDispos(user.id);
    };

    const deleteDispo = async (id: number) => {
        if (!confirm("Supprimer ce créneau ?")) return;
        await fetch('/api/disponibilites', { 
            method: 'DELETE', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }) 
        });
        fetchDispos(user.id);
    };

    const addDispo = async () => {
        if (!newDate) return;
        await fetch('/api/disponibilites', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ medecin_id: user.id, date_heure: newDate }) 
        });
        setNewDate('');
        fetchDispos(user.id);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
            
            {/* HEADER PRATICIEN */}
            <div className="bg-white rounded-[32px] p-8 mb-8 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                        <Stethoscope size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic">
                            Dr. {user?.name || 'Chargement...'}
                        </h1>
                        <div className="flex items-center gap-4 mt-1">
                            <span className="text-indigo-600 text-[10px] font-black uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                                {user?.specialite || 'Praticien'}
                            </span>
                            <span className="text-slate-400 text-[10px] font-black uppercase flex items-center gap-1">
                                <Phone size={12} /> {user?.telephone}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* BOUTON SUPPORT TECHNIQUE AJOUTÉ ICI */}
                    <Link 
                        href={`/support?nom=Dr. ${encodeURIComponent(user?.name || '')}&email=${encodeURIComponent(user?.email || '')}`}
                        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-2.5 rounded-full transition-all border border-slate-200 group"
                    >
                        <LifeBuoy size={16} className="group-hover:rotate-45 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-tight">Support Technique</span>
                    </Link>

                    <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2.5 rounded-full border border-emerald-100">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tight">Cabinet Ouvert</span>
                    </div>
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* REPUTATION */}
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Réputation</p>
                        <h2 className="text-3xl font-black text-slate-800">{stats.note.toFixed(1)}</h2>
                        <Rating note={stats.note} total={stats.total} />
                    </div>
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                        <Star size={28} fill="currentColor" />
                    </div>
                </div>

                {/* EN ATTENTE */}
                <div className="bg-slate-900 p-6 rounded-[32px] shadow-xl flex items-center justify-between text-white">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">En attente</p>
                        <h2 className="text-3xl font-black text-amber-400">
                            {dispos.filter(d => d.statut === 'en_attente').length}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 italic">Demandes à traiter</p>
                    </div>
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-amber-400">
                        <Clock size={28} />
                    </div>
                </div>

                {/* CONSULTATIONS TERMINÉES */}
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Consultations Terminées</p>
                        <h2 className="text-3xl font-black text-slate-800">
                            {dispos.filter(d => d.statut === 'termine' && isThisWeek(d.date_heure)).length}
                        </h2>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase mt-2 italic tracking-tighter">Réalisées cette semaine</p>
                    </div>
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                        <CheckCircle2 size={28} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* AJOUT CRÉNEAU */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm sticky top-8">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Plus size={16} className="text-indigo-600" /> Nouveau créneau
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Date et Heure</label>
                                <input 
                                    type="datetime-local" 
                                    value={newDate} 
                                    onChange={(e) => setNewDate(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                                />
                            </div>
                            <button 
                                onClick={addDispo} 
                                className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase hover:bg-indigo-600 shadow-lg transition-all active:scale-95"
                            >
                                Publier l'horaire
                            </button>
                        </div>
                    </div>
                </div>

                {/* AGENDA */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <Clock className="text-indigo-600" size={24} /> Agenda des Consultations
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="text-left text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50">
                                        <th className="pb-4 px-4">Horaire</th>
                                        <th className="pb-4 px-4">Patient</th>
                                        <th className="pb-4 px-4 text-center">Statut</th>
                                        <th className="pb-4 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {dispos.sort((a, b) => new Date(a.date_heure).getTime() - new Date(b.date_heure).getTime()).map(d => (
                                        <tr key={d.id} className={`group transition-colors ${d.statut === 'termine' ? 'bg-slate-50/50' : 'hover:bg-slate-50/50'}`}>
                                            <td className={`py-5 px-4 font-black text-sm ${d.statut === 'termine' ? 'text-slate-400' : 'text-slate-700'}`}>
                                                {new Date(d.date_heure).toLocaleString('fr-FR', {
                                                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${d.patient_name ? (d.statut === 'termine' ? 'bg-slate-300' : 'bg-indigo-400') : 'bg-slate-200'}`}></div>
                                                    <span className={`font-bold text-sm uppercase ${d.statut === 'termine' ? 'text-slate-400' : 'text-slate-600'}`}>
                                                        {d.patient_name || 'Libre'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight ${
                                                    d.statut === 'confirme' ? 'bg-emerald-100 text-emerald-700' : 
                                                    d.statut === 'en_attente' ? 'bg-amber-100 text-amber-700 animate-pulse' : 
                                                    d.statut === 'termine' ? 'bg-blue-50 text-blue-500' :
                                                    'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {d.statut === 'libre' ? 'DISPONIBLE' : d.statut.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-5 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {d.statut === 'en_attente' && (
                                                        <>
                                                            <button onClick={() => actionRdv(d.id, 'valider')} title="Accepter" className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"><Check size={16} /></button>
                                                            <button onClick={() => actionRdv(d.id, 'refuser')} title="Refuser" className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all"><X size={16} /></button>
                                                        </>
                                                    )}
                                                    
                                                    {d.statut === 'confirme' && (
                                                        <div className="flex items-center gap-2">
                                                            <button 
                                                                onClick={() => actionRdv(d.id, 'terminer')} 
                                                                className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-black text-[9px] uppercase hover:bg-indigo-700 transition-all shadow-md"
                                                            >
                                                                <CheckCircle2 size={12} /> Terminer
                                                            </button>
                                                            <button onClick={() => actionRdv(d.id, 'annuler')} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-all">
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {d.statut === 'libre' && (
                                                        <button onClick={() => deleteDispo(d.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}

                                                    {d.statut === 'termine' && (
                                                        <span className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-lg">
                                                            <Archive size={12} /> Archivé
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {dispos.length === 0 && (
                                <div className="py-20 text-center">
                                    <p className="text-slate-300 font-bold uppercase text-xs tracking-widest italic">Aucun créneau dans l'agenda</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}