import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// --- 1. RÉCUPÉRATION DES MÉDECINS (Avec calcul de réputation) ---
export async function GET() {
    try {
        const query = `
            SELECT 
                u.id, u.name, u.email, u.telephone, u.specialite, u.role, u.status,
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
        return NextResponse.json({ error: "Erreur lors de la récupération." }, { status: 500 });
    }
}

// --- 2. INSCRIPTION (Utilisé par ton formulaire Admin) ---
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nom, prenom, email, password, telephone, specialite, role } = body;

        if (!nom || !email || !password) {
            return NextResponse.json({ error: "Nom, Email et Mot de passe requis." }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const fullName = `${nom} ${prenom}`.trim();

        const query = `
            INSERT INTO users (name, email, password, telephone, role, specialite, status) 
            VALUES (?, ?, ?, ?, ?, ?, 'actif')
        `;

        await db.query(query, [
            fullName, 
            email, 
            hashedPassword, 
            telephone || null, 
            role || 'medecin', 
            specialite || 'Généraliste'
        ]);

        return NextResponse.json({ message: "Médecin créé avec succès !" }, { status: 201 });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// --- 3. MISE À JOUR DU STATUT (PATCH) : C'est ce qui manquait ! ---
export async function PATCH(request: Request) {
    try {
        const { id, status } = await request.json();

        if (!id || !status) {
            return NextResponse.json({ error: "Données manquantes (id ou status)." }, { status: 400 });
        }

        await db.query(
            'UPDATE users SET status = ? WHERE id = ?',
            [status, id]
        );

        return NextResponse.json({ message: "Statut mis à jour avec succès !" });
    } catch (error: any) {
        return NextResponse.json({ error: "Erreur lors de la mise à jour du statut." }, { status: 500 });
    }
}

// --- 4. MODIFICATION GÉNÉRALE (PUT) ---
export async function PUT(request: Request) {
    try {
        const { id, name, email, telephone, specialite } = await request.json();
        await db.query(
            'UPDATE users SET name = ?, email = ?, telephone = ?, specialite = ? WHERE id = ?',
            [name, email, telephone, specialite, id]
        );
        return NextResponse.json({ message: "Modifié !" });
    } catch (error: any) {
        return NextResponse.json({ error: "Erreur modification." }, { status: 500 });
    }
}

// --- 5. SUPPRESSION (DELETE) ---
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "ID manquant." }, { status: 400 });

        await db.query('DELETE FROM users WHERE id = ?', [id]);
        return NextResponse.json({ message: "Supprimé !" });
    } catch (error) {
        return NextResponse.json({ error: "Erreur suppression." }, { status: 500 });
    }
}