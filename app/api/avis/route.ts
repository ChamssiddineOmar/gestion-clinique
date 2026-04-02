import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// --- RÉCUPÉRER LES AVIS ---
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const medecinId = searchParams.get('medecinId');

        if (!medecinId) {
            return NextResponse.json({ error: "ID du médecin manquant" }, { status: 400 });
        }

        const query = `
            SELECT 
                a.note, 
                a.commentaire, 
                COALESCE(u.name, 'Patient Anonyme') as patient_name, 
                a.date_avis as created_at  -- On renomme pour que le frontend comprenne
            FROM avis a 
            LEFT JOIN users u ON a.patient_id = u.id 
            WHERE CAST(a.medecin_id AS CHAR) = CAST(? AS CHAR) 
            AND a.is_hidden = 0 -- On ignore les avis masqués si la colonne existe
            ORDER BY a.date_avis DESC
        `;

        const [comments]: any = await db.query(query, [medecinId]);
        
        return NextResponse.json(comments);
    } catch (error: any) {
        console.error("Erreur API Avis:", error.message);
        return NextResponse.json(
            { error: "Erreur lors de la récupération : " + error.message }, 
            { status: 500 }
        );
    }
}

// --- ENREGISTRER UN NOUVEL AVIS ---
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { medecin_id, patient_id, note, commentaire } = body;

        if (!medecin_id || !patient_id || note === undefined) {
            return NextResponse.json(
                { error: "Informations manquantes" }, 
                { status: 400 }
            );
        }

        const rating = Number(note);
        if (isNaN(rating) || rating < 0 || rating > 5) {
            return NextResponse.json(
                { error: "La note doit être entre 0 et 5" }, 
                { status: 400 }
            );
        }

        // On utilise les noms exacts de tes colonnes phpMyAdmin
        const sql = 'INSERT INTO avis (medecin_id, patient_id, note, commentaire, date_avis, is_hidden) VALUES (?, ?, ?, ?, NOW(), 0)';
        const values = [medecin_id, patient_id, rating, commentaire?.trim() || ""];

        await db.query(sql, values);

        return NextResponse.json(
            { message: "Avis enregistré !" }, 
            { status: 201 }
        );

    } catch (error: any) {
        return NextResponse.json(
            { error: "Erreur serveur : " + error.message }, 
            { status: 500 }
        );
    }
}