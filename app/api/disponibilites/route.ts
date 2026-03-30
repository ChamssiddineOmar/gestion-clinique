import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// 1. CRÉER un créneau (Médecin)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { medecin_id, date_heure } = body;

        if (!medecin_id || !date_heure) {
            return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
        }

        await db.query(
            'INSERT INTO disponibilites (medecin_id, date_heure, est_libre, statut) VALUES (?, ?, TRUE, "libre")', 
            [medecin_id, date_heure]
        );
        
        return NextResponse.json({ message: "Succès" }, { status: 201 });
    } catch (error: any) { 
        return NextResponse.json({ error: error.message }, { status: 500 }); 
    }
}

// 2. LIRE les créneaux (Médecin, Patient, ou Recherche)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const medecin_id = searchParams.get('medecin_id');
    const patient_id = searchParams.get('patient_id');

    try {
        if (medecin_id) {
            // VUE MÉDECIN : Voir ses créneaux + Nom du patient
            const [rows] = await db.query(`
                SELECT d.*, u.name as patient_name 
                FROM disponibilites d
                LEFT JOIN users u ON d.patient_id = u.id
                WHERE d.medecin_id = ? 
                ORDER BY d.date_heure ASC
            `, [medecin_id]);
            return NextResponse.json(rows);

        } else if (patient_id) {
            // VUE "MES RENDEZ-VOUS" (Patient)
            const [rows] = await db.query(`
                SELECT d.*, u.name as medecin_name, u.specialite, 
                       u.telephone as medecin_telephone 
                FROM disponibilites d
                JOIN users u ON d.medecin_id = u.id
                WHERE d.patient_id = ?
                ORDER BY d.date_heure ASC
            `, [patient_id]);
            return NextResponse.json(rows);

        } else {
            // VUE RECHERCHE GLOBALE
            const [rows] = await db.query(`
                SELECT d.*, u.name as medecin_name, u.specialite, 
                       u.telephone as medecin_telephone
                FROM disponibilites d
                JOIN users u ON d.medecin_id = u.id
                WHERE d.statut = 'libre' AND d.est_libre = TRUE
                ORDER BY d.date_heure ASC
            `);
            return NextResponse.json(rows);
        }
    } catch (error: any) { 
        return NextResponse.json({ error: error.message }, { status: 500 }); 
    }
}

// 3. SUPPRIMER un créneau (Corrigé pour lire le corps JSON)
export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const id = body.dispo_id || body.id;

        if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });
        
        await db.query('DELETE FROM disponibilites WHERE id = ?', [id]);
        return NextResponse.json({ message: "Supprimé avec succès" });
    } catch (error: any) { 
        return NextResponse.json({ error: error.message }, { status: 500 }); 
    }
}

// 4. VALIDER, REFUSER, ANNULER ou RÉSERVER (Méthode PUT synchronisée)
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const id = body.dispo_id || body.id;
        const action = body.action || body.nouveau_statut;

        if (!id) return NextResponse.json({ error: "ID du créneau manquant" }, { status: 400 });

        // Cas : Annulation (Médecin/Patient) ou Refus (Médecin)
        if (action === 'refuser' || action === 'annuler' || action === 'libre') {
            await db.query(
                'UPDATE disponibilites SET statut = "libre", est_libre = TRUE, patient_id = NULL WHERE id = ?',
                [id]
            );
        } 
        // Cas : Validation finale par le médecin
        else if (action === 'valider' || action === 'confirme') {
            await db.query(
                'UPDATE disponibilites SET statut = "confirme", est_libre = FALSE WHERE id = ?',
                [id]
            );
        } 
        // Cas : Demande de réservation par le patient
        else if (action === 'reserver') {
            const { patient_id } = body;
            if (!patient_id) return NextResponse.json({ error: "Patient ID manquant" }, { status: 400 });
            
            await db.query(
                'UPDATE disponibilites SET statut = "en_attente", patient_id = ?, est_libre = FALSE WHERE id = ?',
                [patient_id, id]
            );
        } 
        // Cas générique (fallback)
        else {
            await db.query('UPDATE disponibilites SET statut = ? WHERE id = ?', [action, id]);
        }

        return NextResponse.json({ message: "Mise à jour réussie" });

    } catch (error: any) {
        console.error("Erreur API PUT:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}