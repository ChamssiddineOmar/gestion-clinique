"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function ModifierMedecin() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    telephone: "",
    specialite: ""
  });

  // 1. Charger les données actuelles du médecin
  useEffect(() => {
    async function fetchDoctor() {
      try {
        const res = await fetch(`/api/auth/register`); // Ton API GET liste tout
        const doctors = await res.json();
        const doc = doctors.find((d: any) => d.id === parseInt(id as string));
        
        if (doc) {
          setFormData({
            name: doc.name,
            email: doc.email,
            telephone: doc.telephone || "",
            specialite: doc.specialite || ""
          });
        }
        setLoading(false);
      } catch (err) {
        console.error("Erreur chargement:", err);
      }
    }
    fetchDoctor();
  }, [id]);

  // 2. Envoyer les modifications
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/register", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...formData }),
      });

      if (res.ok) {
        alert("Profil mis à jour !");
        router.push("/dashboard/admin/medecins");
      }
    } catch (err) {
      alert("Erreur lors de la modification");
    }
  };

  if (loading) return <p className="p-10 text-center">Chargement...</p>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href="/dashboard/admin/medecins" className="flex items-center text-slate-500 mb-6 hover:text-indigo-600">
        <ArrowLeft size={18} className="mr-2" /> Retour à l'annuaire
      </Link>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold mb-6 text-slate-800">Modifier le Praticien</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Nom Complet</label>
            <input
              type="text"
              className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
            <input
              type="email"
              className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Spécialité</label>
              <input
                type="text"
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.specialite}
                onChange={(e) => setFormData({...formData, specialite: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Téléphone</label>
              <input
                type="text"
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.telephone}
                onChange={(e) => setFormData({...formData, telephone: e.target.value})}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-indigo-600 text-white p-4 rounded-xl font-bold flex items-center justify-center hover:bg-indigo-700 transition-all"
          >
            <Save size={18} className="mr-2" /> Enregistrer les modifications
          </button>
        </form>
      </div>
    </div>
  );
}