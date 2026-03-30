import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // LOG pour vérifier la tentative
        console.log("Tentative de connexion pour :", email);

        const [rows]: any = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 401 });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
        }

        // --- MISE À JOUR CRITIQUE ICI ---
        // On renvoie 'name' au lieu de 'nom' et on AJOUTE 'telephone' et 'specialite'
        return NextResponse.json({ 
            user: { 
                id: user.id, 
                name: user.name,        // Mis à jour
                email: user.email,
                telephone: user.telephone, // Ajouté pour le dashboard
                role: user.role,
                specialite: user.specialite // Ajouté pour le dashboard
            } 
        });

    } catch (error: any) {
        console.error("ERREUR CRITIQUE MYSQL :", error.message);
        return NextResponse.json({ error: "Erreur serveur : " + error.message }, { status: 500 });
    }
}