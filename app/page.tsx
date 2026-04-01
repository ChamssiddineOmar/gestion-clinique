import Link from 'next/link';
import { Stethoscope, LogIn, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] p-4 font-sans text-slate-900">
      {/* Badge décoratif */}
      <div className="mb-6 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-indigo-100">
        <ShieldCheck size={14} /> Système Sécurisé
      </div>

      {/* Icône Centrale */}
      <div className="mb-8 p-6 bg-white rounded-[32px] shadow-xl shadow-indigo-100/50 border border-slate-100">
        <Stethoscope size={48} className="text-indigo-600" />
      </div>

      <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 text-center tracking-tight">
        Clinique <span className="text-indigo-600">SaaS</span>
      </h1>
      
      <p className="text-base text-slate-500 mb-10 text-center max-w-md font-medium leading-relaxed">
        Plateforme professionnelle de gestion de rendez-vous médicaux. 
        Connectez-vous pour accéder à votre espace de travail.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-none justify-center">
        <Link href="/login" 
              className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-200 transition-all active:scale-95">
          <LogIn size={20} />
          Se Connecter
        </Link>
        
        {/* Le bouton "Créer un compte" a été supprimé pour sécuriser l'accès médecin/admin */}
      </div>
      
      <div className="mt-20 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] flex items-center gap-4">
        <div className="h-[1px] w-8 bg-slate-200"></div>
        Projet Examen STI 2026
        <div className="h-[1px] w-8 bg-slate-200"></div>
      </div>
    </div>
  );
}