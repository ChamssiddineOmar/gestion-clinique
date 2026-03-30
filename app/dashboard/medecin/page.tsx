'use client';
import { useEffect, useState } from 'react';
import { Plus, User, Check, X, Trash2, Clock, Stethoscope, Phone } from 'lucide-react';

export default function MedecinDashboard() {
    const [user, setUser] = useState<any>(null);
    const [dispos, setDispos] = useState<any[]>([]);
    const [newDate, setNewDate] = useState('');

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(storedUser);
        if (storedUser.id) fetchDispos(storedUser.id);
    }, []);

    const fetchDispos = async (id: number) => {
        const res = await fetch(`/api/disponibilites?medecin_id=${id}`);
        const data = await res.json();
        setDispos(Array.isArray(data) ? data : []);
    };

    const actionRdv = async (id: number, action: string) => {
        await fetch('/api/disponibilites', { method: 'PUT', body: JSON.stringify({ id, action }) });
        fetchDispos(user.id);
    };

    const addDispo = async () => {
        if (!newDate) return;
        await fetch('/api/disponibilites', { method: 'POST', body: JSON.stringify({ medecin_id: user.id, date_heure: newDate }) });
        setNewDate('');
        fetchDispos(user.id);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
            {/* HEADER : Restauré comme ton image_3 */}
            <div className="bg-white rounded-[32px] p-8 mb-8 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <Stethoscope size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Dr. {user?.name}</h1>
                        <div className="flex items-center gap-4 mt-1">
                            <span className="text-blue-600 text-[10px] font-black uppercase tracking-widest">Spécialité : {user?.specialite}</span>
                            <span className="text-slate-400 text-[10px] font-black uppercase flex items-center gap-1"><Phone size={12} /> {user?.telephone}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-green-700 uppercase">Cabinet Ouvert</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* BLOC GAUCHE : Nouveau créneau (Ta structure originale) */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Plus size={16} className="text-blue-600" /> Nouveau créneau
                        </h2>
                        <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Date et Heure</label>
                        <input 
                            type="datetime-local" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button onClick={addDispo} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase hover:bg-blue-600 transition-all">
                            Publier l'horaire
                        </button>
                    </div>
                </div>

                {/* TABLEAU DROITE : Agenda (Ta structure originale) */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
                        <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <Clock className="text-blue-600" size={24} /> Agenda des Consultations
                        </h2>
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                    <th className="pb-4 px-4">Horaire</th>
                                    <th className="pb-4 px-4">Patient</th>
                                    <th className="pb-4 px-4 text-center">Statut</th>
                                    <th className="pb-4 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {dispos.map(d => (
                                    <tr key={d.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-5 px-4 font-black text-slate-700 text-sm">{new Date(d.date_heure).toLocaleString('fr-FR')}</td>
                                        <td className="py-5 px-4">
                                            <span className="font-bold text-slate-600 text-sm">{d.patient_name || 'Disponible'}</span>
                                        </td>
                                        <td className="py-5 px-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                                d.statut === 'confirme' ? 'bg-green-100 text-green-700' : 
                                                d.statut === 'en_attente' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {d.statut === 'libre' ? 'DISPONIBLE' : d.statut.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-5 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {d.statut === 'en_attente' && (
                                                    <>
                                                        <button onClick={() => actionRdv(d.id, 'valider')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"><Check size={16} /></button>
                                                        <button onClick={() => actionRdv(d.id, 'refuser')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"><X size={16} /></button>
                                                    </>
                                                )}
                                                {d.statut === 'confirme' && (
                                                    <button onClick={() => actionRdv(d.id, 'refuser')} className="text-red-500 font-black text-[10px] uppercase flex items-center gap-1 hover:underline"><X size={14} /> Annuler RDV</button>
                                                )}
                                                {d.statut === 'libre' && (
                                                    <button onClick={async () => { await fetch('/api/disponibilites', { method: 'DELETE', body: JSON.stringify({ id: d.id }) }); fetchDispos(user.id); }} className="text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}