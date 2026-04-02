"use client";

import { useEffect, useState } from "react";
import { Rating } from "@/components/Rating"; // Import du composant qu'on a créé
import { Calendar, Phone, Stethoscope } from "lucide-react";

export default function PageRecherche() {
  const [creneaux, setCreneaux] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chargement des données depuis l'API mise à jour
  useEffect(() => {
    async function fetchCreneaux() {
      try {
        const response = await fetch("/api/disponibilites");
        const data = await response.json();
        setCreneaux(data);
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCreneaux();
  }, []);

  if (loading) return <div className="p-10 text-center">Chargement des médecins...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">
        Réserver une consultation
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {creneaux.map((item: any) => (
          <div 
            key={item.id} 
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Stethoscope size={18} className="text-indigo-600" />
                  <h3 className="text-xl font-bold text-slate-800">
                    Dr. {item.medecin_name}
                  </h3>
                </div>
                
                <p className="text-indigo-600 font-semibold text-sm mb-2">
                  {item.specialite}
                </p>

                {/* --- INTÉGRATION DU SYSTÈME DE NOTATION --- */}
                <Rating 
                  note={item.note_moyenne} 
                  total={item.total_avis} 
                />
                {/* ------------------------------------------ */}
              </div>

              <div className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                Disponible
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-slate-600 text-sm gap-3">
                <Calendar size={16} className="text-slate-400" />
                <span>
                  {new Date(item.date_heure).toLocaleDateString('fr-FR', {
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex items-center text-slate-600 text-sm gap-3">
                <Phone size={16} className="text-slate-400" />
                <span>{item.medecin_telephone}</span>
              </div>
            </div>

            <button 
              onClick={() => {/* Ta fonction de réservation */}}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl transition-colors shadow-lg shadow-indigo-100"
            >
              Confirmer le rendez-vous
            </button>
          </div>
        ))}
      </div>

      {creneaux.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400">Aucune disponibilité trouvée pour le moment.</p>
        </div>
      )}
    </div>
  );
}