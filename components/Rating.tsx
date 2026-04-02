import { Star } from "lucide-react";

interface RatingProps {
  note: number;
  total: number;
}

export function Rating({ note, total }: RatingProps) {
  const valeurNote = Number(note) || 0;
  const valeurTotal = Number(total) || 0;
  const noteArrondie = Math.round(valeurNote);

  return (
    // "flex-col" sur mobile pour gagner de la place, "flex-row" sur tablette/PC
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
      
      {/* CONTENEUR ÉTOILES */}
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={10} // Un peu plus petit pour le côté minimaliste pro
            className={`${
              star <= noteArrondie 
                ? "text-amber-400 fill-amber-400" 
                : "text-slate-200 fill-slate-100" // Fond d'étoile vide plus discret
            } transition-colors`}
          />
        ))}
      </div>

      {/* TEXTE DE LA NOTE */}
      <div className="flex items-baseline gap-1">
        <span className="text-[11px] font-black text-slate-700">
          {valeurNote > 0 ? valeurNote.toFixed(1) : "—"}
        </span>
        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
          ({valeurTotal} {valeurTotal > 1 ? 'avis' : 'avis'})
        </span>
      </div>
      
    </div>
  );
}