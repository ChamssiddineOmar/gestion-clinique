import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { medecin_id, patient_id, note, commentaire } = await request.json();

        // Sécurité : Vérifier que les données sont là
        if (!medecin_id || !patient_id || !note) {
            return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
        }

        // Insérer l'avis
        await db.query(
            'INSERT INTO avis (medecin_id, patient_id, note, commentaire) VALUES (?, ?, ?, ?)',
            [medecin_id, patient_id, note, commentaire || ""]
        );

        return NextResponse.json({ message: "Avis enregistré avec succès !" }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}