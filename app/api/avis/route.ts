import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // On récupère les données avec plusieurs noms possibles pour éviter les erreurs frontend
        const medecin_id = body.medecin_id || body.medecinId;
        const patient_id = body.patient_id || body.patientId;
        const note = body.note || body.rating;
        const commentaire = body.commentaire || body.comment || "";

        if (!medecin_id || !patient_id || note === undefined) {
            return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
        }

        // --- TEST SQL ÉTAPE PAR ÉTAPE ---
        // On essaie d'insérer sans 'date_avis' au cas où le nom soit différent
        // La plupart des tables ont juste medecin_id, patient_id, note, commentaire
        const sql = `
            INSERT INTO avis (medecin_id, patient_id, note, commentaire) 
            VALUES (?, ?, ?, ?)
        `;
        
        await db.query(sql, [medecin_id, patient_id, Number(note), commentaire]);

        return NextResponse.json({ message: "Avis enregistré avec succès !" }, { status: 201 });

    } catch (error: any) {
        // Si ça plante encore, on affiche l'erreur exacte dans la console VS Code
        console.error("ERREUR SQL AVIS :", error.message);
        return NextResponse.json({ error: "Erreur Base de données : " + error.message }, { status: 500 });
    }
}

// Garde ton GET actuel ici si il fonctionne, sinon utilise une version simple
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const medecinId = searchParams.get('medecinId') || searchParams.get('medecin_id');

        if (!medecinId) return NextResponse.json([], { status: 200 });

        const [rows] = await db.query(
            "SELECT a.*, u.name as patient_name FROM avis a JOIN users u ON a.patient_id = u.id WHERE a.medecin_id = ? ORDER BY id DESC",
            [medecinId]
        );
        return NextResponse.json(rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}