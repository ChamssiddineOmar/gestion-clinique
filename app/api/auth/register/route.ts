import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// --- 1. RÉCUPÉRATION DES MÉDECINS ---
export async function GET() {
    try {
        // Ajout du champ 'status' dans la sélection
        const [rows]: any = await db.query(
            'SELECT id, name, email, telephone, specialite, role, status FROM users WHERE role = ? ORDER BY id DESC',
            ['medecin']
        );
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

        const finalRole = role === 'medecin' ? 'medecin' : 'patient';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertion avec status 'actif' par défaut
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