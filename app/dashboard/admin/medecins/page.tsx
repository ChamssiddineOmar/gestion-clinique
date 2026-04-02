'use client';
import { useState, useEffect, useMemo } from 'react';
import { 
    UserPlus, Search, Mail, Phone, Loader2, 
    Edit2, Trash2, Filter, Power, PowerOff,
    Star, MessageSquareText, X, User
} from 'lucide-react';
import Link from 'next/link';

interface Doctor {
    id: number;
    name: string;
    email: string;
    telephone: string;
    specialite: string;
    status: 'actif' | 'suspendu';
    note_moyenne: number;
    total_avis: number;
}

export default function DoctorsList() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSpecialty, setFilterSpecialty] = useState('Tous');

    // États pour la Modal des avis
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [avis, setAvis] = useState([]);
    const [loadingAvis, setLoadingAvis] = useState(false);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/auth/register'); 
            const data = await res.json();
            
            if (res.ok) {
                const docs = data.map((d: any) => ({
                    id: d.id,
                    name: d.name || d.nom || "Sans nom",
                    email: d.email,
                    telephone: d.telephone || d.phone || "N/A",
                    specialite: d.specialite || "Généraliste",
                    status: d.status || 'actif',
                    // On force le format numérique pour éviter les bugs d'affichage
                    note_moyenne: parseFloat(d.note_moyenne) || 0,
                    total_avis: parseInt(d.total_avis) || 0
                }));
                setDoctors(docs);
            }
        } catch (err) {
            console.error("Erreur chargement:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvis = async (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setLoadingAvis(true);
        try {
            const res = await fetch(`/api/avis?medecinId=${String(doctor.id)}`);
            const data = await res.json();
            setAvis(data);
        } catch (err) {
            console.error("Erreur avis:", err);
        } finally {
            setLoadingAvis(false);
        }
    };

    useEffect(() => { fetchDoctors(); }, []);

    // Utilisation de useMemo pour optimiser le filtrage sans re-render inutile
    const filteredDoctors = useMemo(() => {
        return doctors.filter((doc) => {
            const name = doc.name?.toLowerCase() || "";
            const spec = doc.specialite?.toLowerCase() || "";
            const search = searchTerm.toLowerCase();
            const matchesSearch = name.includes(search) || spec.includes(search);
            const matchesFilter = filterSpecialty === 'Tous' || doc.specialite === filterSpecialty;
            return matchesSearch && matchesFilter;
        });
    }, [searchTerm, filterSpecialty, doctors]);

    const specialties = useMemo(() => {
        return ['Tous', ...new Set(doctors.map(d => d.specialite).filter(Boolean))];
    }, [doctors]);

    const toggleStatus = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'actif' ? 'suspendu' : 'actif';
        try {
            const res = await fetch('/api/auth/register', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus }),
            });
            if (res.ok) {
                setDoctors(prev => prev.map(doc => 
                    doc.id === id ? { ...doc, status: newStatus as 'actif' | 'suspendu' } : doc
                ));
            }
        } catch (err) { alert("Erreur réseau."); }
    };

    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Voulez-vous supprimer définitivement le Dr. ${name} ?`)) {
            try {
                const res = await fetch(`/api/auth/register?id=${id}`, { method: 'DELETE' });
                if (res.ok) setDoctors(prev => prev.filter(doc => doc.id !== id));
            } catch (err) { alert("Erreur réseau."); }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter italic uppercase">Annuaire</h1>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] ml-1">Gestion MedGest</p>
                    </div>
                    <Link href="/dashboard/admin/medecins/ajouter" className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 hover:scale-105 transition-all active:scale-95">
                        <UserPlus size={18} /> Nouveau Médecin
                    </Link>
                </div>

                {/* FILTRES */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Rechercher un praticien ou une spécialité..." 
                            className="w-full pl-16 pr-6 py-5 bg-white rounded-[28px] border border-slate-100 shadow-sm outline-none font-bold text-sm focus:ring-4 focus:ring-indigo-500/5 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative min-w-[220px]">
                        <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <select 
                            className="w-full pl-14 pr-6 py-5 bg-white rounded-[28px] border border-slate-100 shadow-sm outline-none font-bold text-sm appearance-none cursor-pointer text-slate-600 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                            value={filterSpecialty}
                            onChange={(e) => setFilterSpecialty(e.target.value)}
                        >
                            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-indigo-600" size={40} />
                        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Récupération des données...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                        <th className="px-10 py-6">Médecin</th>
                                        <th className="px-8 py-6">Réputation</th>
                                        <th className="px-8 py-6">Contact</th>
                                        <th className="px-8 py-6">État</th>
                                        <th className="px-10 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredDoctors.map((doc) => (
                                        <tr key={doc.id} className={`transition-all group ${doc.status === 'suspendu' ? 'opacity-60 bg-slate-50/30' : 'hover:bg-slate-50/80'}`}>
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs transition-all shadow-sm ${doc.status === 'suspendu' ? 'bg-slate-200 text-slate-400' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                                                        {doc.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className={`font-black uppercase tracking-tight text-sm block ${doc.status === 'suspendu' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                                            {doc.name}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-indigo-500 uppercase italic">{doc.specialite}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-1 text-amber-500 font-black text-sm">
                                                        <Star size={14} className="fill-amber-400" />
                                                        {Number(doc.note_moyenne).toFixed(1)}
                                                    </div>
                                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">{doc.total_avis} avis</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1 text-[11px] font-bold">
                                                    <span className="text-slate-600 flex items-center gap-2"><Mail size={12} className="text-slate-300"/> {doc.email}</span>
                                                    <span className="text-slate-400 flex items-center gap-2"><Phone size={12} className="text-slate-300"/> {doc.telephone}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${doc.status === 'actif' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`}></div>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${doc.status === 'actif' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                        {doc.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => fetchAvis(doc)}
                                                        className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-slate-100"
                                                        title="Voir les avis"
                                                    >
                                                        <MessageSquareText size={16} />
                                                    </button>
                                                    
                                                    <button 
                                                        onClick={() => toggleStatus(doc.id, doc.status)}
                                                        className={`p-3 rounded-xl transition-all shadow-sm border border-slate-100 ${doc.status === 'actif' ? 'bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                                                        title={doc.status === 'actif' ? "Suspendre" : "Activer"}
                                                    >
                                                        {doc.status === 'actif' ? <PowerOff size={16} /> : <Power size={16} />}
                                                    </button>

                                                    <Link href={`/dashboard/admin/medecins/modifier/${doc.id}`} className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm border border-slate-100" title="Modifier">
                                                        <Edit2 size={16} />
                                                    </Link>

                                                    <button onClick={() => handleDelete(doc.id, doc.name)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm border border-slate-100" title="Supprimer">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL DES AVIS */}
            {selectedDoctor && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="font-black text-xl text-slate-900 uppercase italic tracking-tighter">Avis Patients</h2>
                                <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">Dr. {selectedDoctor.name}</p>
                            </div>
                            <button onClick={() => setSelectedDoctor(null)} className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all rounded-xl">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 max-h-[450px] overflow-y-auto space-y-4 bg-white">
                            {loadingAvis ? (
                                <div className="flex flex-col items-center justify-center p-10 gap-2">
                                    <Loader2 className="animate-spin text-indigo-600" />
                                    <span className="text-[10px] font-bold text-slate-300 uppercase">Chargement...</span>
                                </div>
                            ) : avis.length > 0 ? (
                                avis.map((a: any, idx: number) => (
                                    <div key={idx} className="p-5 bg-slate-50 rounded-[28px] border border-slate-100 transition-all hover:bg-white hover:shadow-md group/card">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-400 group-hover/card:text-indigo-500 transition-colors">
                                                    <User size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-800 uppercase">{a.patient_name || "Patient Anonyme"}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-amber-500 bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-50">
                                                <Star size={10} className="fill-amber-400" />
                                                <span className="text-[10px] font-black">{a.note}</span>
                                            </div>
                                        </div>
                                        <p className="text-slate-500 text-sm italic leading-relaxed pl-2 border-l-2 border-indigo-100 ml-4">
                                            "{a.commentaire}"
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MessageSquareText className="text-slate-200" size={32} />
                                    </div>
                                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Aucun avis déposé</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}