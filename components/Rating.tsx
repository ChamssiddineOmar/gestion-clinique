import { Star } from "lucide-react";

interface RatingProps {
  note: number;
  total: number;
}

export function Rating({ note, total }: RatingProps) {
  // Sécurité : On force la conversion en nombre au cas où c'est une string ou undefined
  const valeurNote = Number(note) || 0;
  const valeurTotal = Number(total) || 0;

  // On arrondit pour l'affichage des étoiles
  const noteArrondie = Math.round(valeurNote);

  return (
    <div className="flex items-center space-x-1 mt-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={12}
          className={`${
            star <= noteArrondie 
              ? "text-yellow-400 fill-yellow-400" 
              : "text-slate-300"
          }`}
        />
      ))}
      <span className="text-[10px] text-slate-500 ml-2 font-bold">
        {valeurNote > 0 ? valeurNote.toFixed(1) : "0"} ({valeurTotal} {valeurTotal > 1 ? 'avis' : 'avis'})
      </span>
    </div>
  );
}