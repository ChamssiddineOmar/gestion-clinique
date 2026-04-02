import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// --- 1. RÉCUPÉRATION DES MÉDECINS (AVEC NOTES) ---
export async function GET() {
    try {
        // On utilise COALESCE pour mettre 0 si aucune note n'existe
        // COUNT(avis.id) donne le nombre total d'avis
        // AVG(avis.note) calcule la moyenne des notes
        const query = `
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.telephone, 
                u.specialite, 
                u.role, 
                u.status,
                COALESCE(AVG(a.note), 0) as note_moyenne,
                COUNT(a.id) as total_avis
            FROM users u
            LEFT JOIN avis a ON u.id = a.medecin_id
            WHERE u.role = 'medecin'
            GROUP BY u.id
            ORDER BY u.id DESC
        `;

        const [rows]: any = await db.query(query);
        return NextResponse.json(rows);
    } catch (error: any) {
        console.error("Erreur Fetch Doctors:", error);
        return NextResponse.json({ error: "Impossible de récupérer la liste." }, { status: 500 });
    }
}

// --- 2. INSCRIPTION (POST) ---
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nom, prenom, email, password, telephone, specialite, date_naissance, role } = body;

        if (!nom || !prenom || !email || !password || !telephone) {
            return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
        }

        const finalRole = (role === 'medecin' || role === 'admin') ? role : 'patient';
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO users (name, email, password, telephone, role, date_naissance, specialite, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'actif')
        `;

        await db.query(query, [
            `${nom} ${prenom}`, email, hashedPassword, telephone, 
            finalRole, date_naissance || null, 
            finalRole === 'medecin' ? (specialite || 'Généraliste') : null
        ]);

        return NextResponse.json({ message: "Utilisateur créé avec succès !" }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// --- 3. MODIFICATION COMPLÈTE (PUT) ---
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, email, telephone, specialite } = body;

        await db.query(
            'UPDATE users SET name = ?, email = ?, telephone = ?, specialite = ? WHERE id = ?',
            [name, email, telephone, specialite, id]
        );

        return NextResponse.json({ message: "Informations mises à jour !" });
    } catch (error: any) {
        return NextResponse.json({ error: "Erreur lors de la modification." }, { status: 500 });
    }
}

// --- 4. MISE À JOUR DU STATUT (PATCH) ---
export async function PATCH(request: Request) {
    try {
        const { id, status } = await request.json();
        
        await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
        
        return NextResponse.json({ message: "Statut mis à jour !" });
    } catch (error: any) {
        return NextResponse.json({ error: "Erreur statut." }, { status: 500 });
    }
}

// --- 5. SUPPRESSION (DELETE) ---
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

        await db.query('DELETE FROM users WHERE id = ?', [id]);

        return NextResponse.json({ message: "Médecin supprimé définitivement." });
    } catch (error: any) {
        return NextResponse.json({ error: "Erreur suppression." }, { status: 500 });
    }
}