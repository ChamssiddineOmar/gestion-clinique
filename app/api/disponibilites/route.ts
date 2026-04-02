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

// 2. LIRE les créneaux avec calcul automatique du statut "TERMINE"
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const medecin_id = searchParams.get('medecin_id');
    const patient_id = searchParams.get('patient_id');
    const now = new Date();

    try {
        let rows: any = [];

        if (medecin_id) {
            const [data] = await db.query(`
                SELECT d.*, u.name as patient_name 
                FROM disponibilites d
                LEFT JOIN users u ON d.patient_id = u.id
                WHERE d.medecin_id = ? 
                ORDER BY d.date_heure ASC
            `, [medecin_id]);
            rows = data;

        } else if (patient_id) {
            const [data] = await db.query(`
                SELECT d.*, u.name as medecin_name, u.specialite, 
                       u.telephone as medecin_telephone,
                       IFNULL((SELECT AVG(note) FROM avis WHERE medecin_id = u.id), 0) as note_moyenne,
                       (SELECT COUNT(*) FROM avis WHERE medecin_id = u.id) as total_avis
                FROM disponibilites d
                JOIN users u ON d.medecin_id = u.id
                WHERE d.patient_id = ? AND u.status = 'actif'
                ORDER BY d.date_heure ASC
            `, [patient_id]);
            rows = data;

        } else {
            const [data] = await db.query(`
                SELECT d.*, u.name as medecin_name, u.specialite, 
                    u.telephone as medecin_telephone,
                    (SELECT IFNULL(AVG(note), 0) FROM avis WHERE medecin_id = u.id) as note_moyenne,
                    (SELECT COUNT(*) FROM avis WHERE medecin_id = u.id) as total_avis
                FROM disponibilites d
                JOIN users u ON d.medecin_id = u.id
                WHERE d.statut = 'libre' AND d.date_heure > NOW()
                AND d.est_libre = TRUE AND u.status = 'actif'
                ORDER BY d.date_heure ASC
            `);
            rows = data;
        }

        // --- Passage automatique à "terminé" si la date est dépassée de plus d'une heure (sécurité) ---
        const updatedRows = rows.map((rdv: any) => {
            const rdvDate = new Date(rdv.date_heure);
            if (rdv.statut === 'confirme' && rdvDate < now) {
                return { ...rdv, statut: 'termine' };
            }
            return rdv;
        });

        return NextResponse.json(updatedRows);

    } catch (error: any) { 
        return NextResponse.json({ error: error.message }, { status: 500 }); 
    }
}

// 3. SUPPRIMER un créneau
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

// 4. ACTIONS (Gestion du cycle de vie)
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const id = body.dispo_id || body.id;
        const action = body.action;

        if (!id) return NextResponse.json({ error: "ID du créneau manquant" }, { status: 400 });

        // A. RESERVER (Action Patient)
        if (action === 'reserver') {
            const { patient_id } = body;
            if (!patient_id) return NextResponse.json({ error: "Patient ID manquant" }, { status: 400 });
            
            await db.query(
                'UPDATE disponibilites SET statut = "en_attente", patient_id = ?, est_libre = FALSE WHERE id = ? AND statut = "libre"',
                [patient_id, id]
            );
        } 
        
        // B. VALIDER / CONFIRMER (Action Médecin)
        else if (action === 'valider' || action === 'confirmer') {
            await db.query(
                'UPDATE disponibilites SET statut = "confirme", est_libre = FALSE WHERE id = ? AND statut = "en_attente"',
                [id]
            );
        } 

        // C. TERMINER (Action Patient ou Médecin) - La consultation a eu lieu
        else if (action === 'terminer') {
            await db.query(
                'UPDATE disponibilites SET statut = "termine" WHERE id = ? AND statut = "confirme"',
                [id]
            );
        }

        // D. ANNULER / LIBÉRER (Patient ou Médecin)
        else if (action === 'annuler' || action === 'refuser') {
            await db.query(
                'UPDATE disponibilites SET statut = "libre", est_libre = TRUE, patient_id = NULL WHERE id = ?',
                [id]
            );
        } 

        // E. CAS GÉNÉRIQUE
        else {
            await db.query('UPDATE disponibilites SET statut = ? WHERE id = ?', [action, id]);
        }

        return NextResponse.json({ message: "Statut mis à jour avec succès" });

    } catch (error: any) {
        console.error("Erreur API PUT:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}