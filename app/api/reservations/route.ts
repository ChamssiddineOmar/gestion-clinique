import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// 1. GET : Récupérer les créneaux disponibles (Vue Patient)
export async function GET() {
    try {
        const [rows] = await db.query(`
            SELECT u.nom, u.prenom, u.specialite, d.id as dispo_id, d.date_heure 
            FROM users u
            JOIN disponibilites d ON u.id = d.medecin_id
            WHERE u.role = 'medecin' AND d.est_libre = TRUE AND d.patient_id IS NULL
            ORDER BY d.date_heure ASC
        `);
        return NextResponse.json(rows || []);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// 2. POST : Demande de réservation par le patient
export async function POST(request: Request) {
    try {
        const { dispo_id, patient_id } = await request.json();
        
        if (!dispo_id || !patient_id) {
            return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
        }

        await db.query(`
            UPDATE disponibilites 
            SET est_libre = FALSE, 
                patient_id = ?, 
                statut = 'en_attente' 
            WHERE id = ?`, 
            [patient_id, dispo_id]
        );
        
        return NextResponse.json({ message: "Demande envoyée !" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// 3. PUT : DÉCISION DU MÉDECIN (Valider, Refuser ou Annuler après confirmation)
export async function PUT(request: Request) {
    try {
        const { dispo_id, action } = await request.json(); 

        if (action === 'valider') {
            await db.query(
                "UPDATE disponibilites SET statut = 'confirme' WHERE id = ?",
                [dispo_id]
            );
            return NextResponse.json({ message: "Rendez-vous confirmé !" });
        } 
        
        // Si le médecin refuse (avant confirmation) OU annule (après confirmation suite à un imprévu)
        if (action === 'refuser' || action === 'annuler') {
            await db.query(`
                UPDATE disponibilites 
                SET est_libre = TRUE, 
                    patient_id = NULL, 
                    statut = 'en_attente' 
                WHERE id = ?`,
                [dispo_id]
            );
            return NextResponse.json({ message: "Créneau libéré avec succès." });
        }

        return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// 4. PATCH : Voir les RDV d'un patient spécifique
export async function PATCH(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const patient_id = searchParams.get('patient_id');
        
        if (!patient_id) return NextResponse.json([]);

        const [rows] = await db.query(`
            SELECT d.id as dispo_id, d.date_heure, d.statut, u.nom as medecin_nom, u.specialite 
            FROM disponibilites d
            JOIN users u ON d.medecin_id = u.id
            WHERE d.patient_id = ?
            ORDER BY d.date_heure ASC
        `, [patient_id]);

        return NextResponse.json(rows || []); 
    } catch (error: any) {
        return NextResponse.json([], { status: 500 });
    }
}

// 5. DELETE : Annulation par le PATIENT (avec sécurité)
export async function DELETE(request: Request) {
    try {
        const { dispo_id } = await request.json();

        // Sécurité : On vérifie le statut actuel
        const [rows]: any = await db.query(
            'SELECT statut FROM disponibilites WHERE id = ?',
            [dispo_id]
        );

        if (rows.length > 0 && rows[0].statut === 'confirme') {
            return NextResponse.json(
                { error: "Impossible d'annuler un RDV déjà confirmé. Contactez le médecin." }, 
                { status: 403 }
            );
        }

        // Si c'est en attente, le patient peut encore libérer le créneau
        await db.query(`
            UPDATE disponibilites 
            SET est_libre = TRUE, 
                patient_id = NULL, 
                statut = 'en_attente' 
            WHERE id = ?
        `, [dispo_id]);

        return NextResponse.json({ message: "Demande annulée." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}