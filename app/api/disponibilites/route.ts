import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// 1. LIRE les créneaux (Calcul des avis inclus)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const medecin_id = searchParams.get('medecin_id');
    const patient_id = searchParams.get('patient_id');

    try {
        let rows: any = [];

        if (medecin_id) {
            const [data] = await db.query(`
                SELECT d.*, u.name as patient_name 
                FROM disponibilites d
                LEFT JOIN users u ON d.patient_id = u.id
                WHERE d.medecin_id = ? 
                ORDER BY d.date_rendez_vous ASC
            `, [medecin_id]);
            rows = data;

        } else if (patient_id) {
            // Pour afficher les rendez-vous du patient avec les stats du médecin
            const [data] = await db.query(`
                SELECT d.*, u.name as medecin_name, u.specialite, u.telephone as medecin_telephone,
                    (SELECT IFNULL(AVG(note), 0) FROM avis WHERE medecin_id = d.medecin_id) as note_moyenne,
                    (SELECT COUNT(*) FROM avis WHERE medecin_id = d.medecin_id) as total_avis
                FROM disponibilites d
                JOIN users u ON d.medecin_id = u.id
                WHERE d.patient_id = ?
                ORDER BY d.date_rendez_vous ASC
            `, [patient_id]);
            rows = data;

        } else {
            // Dashboard général (créneaux libres) avec calcul des étoiles
            const [data] = await db.query(`
                SELECT d.*, u.name as medecin_name, u.specialite, u.telephone as medecin_telephone,
                    (SELECT IFNULL(AVG(note), 0) FROM avis WHERE medecin_id = d.medecin_id) as note_moyenne,
                    (SELECT COUNT(*) FROM avis WHERE medecin_id = d.medecin_id) as total_avis
                FROM disponibilites d
                JOIN users u ON d.medecin_id = u.id
                WHERE d.status = 'libre' 
                AND DATE(d.date_rendez_vous) >= CURDATE()
                ORDER BY d.date_rendez_vous ASC
            `);
            rows = data;
        }

        // Mapping pour la compatibilité Frontend
        const updatedRows = rows.map((rdv: any) => ({
            ...rdv,
            statut: rdv.status, 
            date_heure: rdv.date_rendez_vous,
            note_moyenne: parseFloat(rdv.note_moyenne) || 0,
            total_avis: parseInt(rdv.total_avis) || 0
        }));

        return NextResponse.json(updatedRows);
    } catch (error: any) { 
        return NextResponse.json({ error: error.message }, { status: 500 }); 
    }
}

// 2. CRÉER un créneau
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { medecin_id, date_heure } = body;
        await db.query(
            'INSERT INTO disponibilites (medecin_id, date_rendez_vous, status) VALUES (?, ?, "libre")', 
            [medecin_id, date_heure]
        );
        return NextResponse.json({ message: "Succès" }, { status: 201 });
    } catch (error: any) { 
        return NextResponse.json({ error: error.message }, { status: 500 }); 
    }
}

// 3. ACTIONS (Reserver, Confirmer, Terminer, Annuler)
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const id = body.dispo_id || body.id;
        const action = body.action;

        if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

        if (action === 'reserver') {
            const { patient_id } = body;
            await db.query(
                'UPDATE disponibilites SET status = "en_attente", patient_id = ? WHERE id = ?',
                [patient_id, id]
            );
        } 
        else if (action === 'confirmer' || action === 'valider') {
            await db.query(
                'UPDATE disponibilites SET status = "confirme" WHERE id = ?',
                [id]
            );
        } 
        else if (action === 'terminer') {
            await db.query(
                'UPDATE disponibilites SET status = "termine" WHERE id = ?',
                [id]
            );
        }
        else if (action === 'annuler' || action === 'refuser') {
            await db.query(
                'UPDATE disponibilites SET status = "libre", patient_id = NULL WHERE id = ?',
                [id]
            );
        } 
        else {
            await db.query('UPDATE disponibilites SET status = ? WHERE id = ?', [action, id]);
        }

        return NextResponse.json({ message: "Statut mis à jour avec succès" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// 4. SUPPRIMER
export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const id = body.dispo_id || body.id;
        await db.query('DELETE FROM disponibilites WHERE id = ?', [id]);
        return NextResponse.json({ message: "Supprimé" });
    } catch (error: any) { 
        return NextResponse.json({ error: error.message }, { status: 500 }); 
    }
}