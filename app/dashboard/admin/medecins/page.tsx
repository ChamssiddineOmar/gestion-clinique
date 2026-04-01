'use client';
import { useState, useEffect } from 'react';
import { 
    UserPlus, Search, Mail, Phone, Loader2, 
    Edit2, Trash2, Filter, Power, PowerOff 
} from 'lucide-react';
import Link from 'next/link';

interface Doctor {
    id: number;
    name: string;
    email: string;
    telephone: string;
    specialite: string;
    status: 'actif' | 'suspendu';
}

export default function DoctorsList() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSpecialty, setFilterSpecialty] = useState('Tous');

    // --- CHARGEMENT DEPUIS LA BDD ---
    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/auth/register'); 
            const data = await res.json();
            
            if (res.ok) {
                // On transforme les données SQL pour qu'elles collent à l'interface Doctor
                const docs = data.map((d: any) => ({
                    id: d.id,
                    name: d.name || d.nom || "Sans nom", // Gère 'name' ou 'nom'
                    email: d.email,
                    telephone: d.telephone || d.phone || "N/A",
                    specialite: d.specialite || "Généraliste",
                    status: d.status || 'actif'
                }));
                setDoctors(docs);
                setFilteredDoctors(docs);
            }
        } catch (err) {
            console.error("Erreur chargement:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    // --- RECHERCHE ET FILTRAGE ---
    useEffect(() => {
        const results = doctors.filter((doc) => {
            const name = doc.name?.toLowerCase() || "";
            const spec = doc.specialite?.toLowerCase() || "";
            const search = searchTerm.toLowerCase();

            const matchesSearch = name.includes(search) || spec.includes(search);
            const matchesFilter = filterSpecialty === 'Tous' || doc.specialite === filterSpecialty;
            
            return matchesSearch && matchesFilter;
        });
        setFilteredDoctors(results);
    }, [searchTerm, filterSpecialty, doctors]);

    const specialties = ['Tous', ...new Set(doctors.map(d => d.specialite).filter(Boolean))];

    // --- ACTION : SUSPENDRE / ACTIVER (PATCH) ---
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
            } else {
                const errorData = await res.json();
                alert(`Erreur: ${errorData.error || "Impossible de changer le statut"}`);
            }
        } catch (err) {
            alert("Erreur réseau lors de la mise à jour.");
        }
    };

    // --- ACTION : SUPPRIMER (DELETE) ---
    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Voulez-vous supprimer définitivement le Dr. ${name} ?`)) {
            try {
                const res = await fetch(`/api/auth/register?id=${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setDoctors(prev => prev.filter(doc => doc.id !== id));
                } else {
                    alert("Erreur lors de la suppression en base de données.");
                }
            } catch (err) {
                alert("Erreur réseau.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter italic uppercase">Annuaire</h1>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] ml-1">Système de gestion IPD</p>
                    </div>
                    <Link href="/dashboard/admin/medecins/ajouter" className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 hover:scale-105 transition-all">
                        <UserPlus size={18} /> Nouveau Médecin
                    </Link>
                </div>

                {/* FILTRES */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Rechercher un praticien..." 
                            className="w-full pl-16 pr-6 py-5 bg-white rounded-[28px] border border-slate-100 shadow-sm outline-none font-bold text-sm focus:ring-4 focus:ring-indigo-500/5 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative min-w-[220px]">
                        <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <select 
                            className="w-full pl-14 pr-6 py-5 bg-white rounded-[28px] border border-slate-100 shadow-sm outline-none font-bold text-sm appearance-none cursor-pointer text-slate-600"
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
                        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Synchronisation BDD...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                        <th className="px-10 py-6">Médecin</th>
                                        <th className="px-8 py-6">Spécialité</th>
                                        <th className="px-8 py-6">Contact</th>
                                        <th className="px-8 py-6">État</th>
                                        <th className="px-10 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredDoctors.length > 0 ? (
                                        filteredDoctors.map((doc) => (
                                            <tr key={doc.id} className={`transition-all group ${doc.status === 'suspendu' ? 'opacity-60 bg-slate-50/30' : 'hover:bg-slate-50/80'}`}>
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs transition-all shadow-sm ${doc.status === 'suspendu' ? 'bg-slate-200 text-slate-400' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                                                            {doc.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className={`font-black uppercase tracking-tight text-sm ${doc.status === 'suspendu' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                                            {doc.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="bg-white px-4 py-2 rounded-xl font-bold text-slate-500 italic text-[10px] border border-slate-100 shadow-sm uppercase">
                                                        {doc.specialite}
                                                    </span>
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
                                                            onClick={() => toggleStatus(doc.id, doc.status)}
                                                            title={doc.status === 'actif' ? 'Suspendre' : 'Activer'} 
                                                            className={`p-3 rounded-xl transition-all shadow-sm border border-slate-100 ${doc.status === 'actif' ? 'bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                                                        >
                                                            {doc.status === 'actif' ? <PowerOff size={16} /> : <Power size={16} />}
                                                        </button>
                                                        <Link 
                                                            href={`/dashboard/admin/medecins/modifier/${doc.id}`}
                                                            className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm border border-slate-100"
                                                        >
                                                            <Edit2 size={16} />
                                                        </Link>
                                                        <button 
                                                            onClick={() => handleDelete(doc.id, doc.name)}
                                                            className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm border border-slate-100"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-10 py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                                Aucun praticien trouvé
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}