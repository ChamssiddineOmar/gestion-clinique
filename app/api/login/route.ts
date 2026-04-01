import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // 1. Récupération de l'utilisateur avec toutes ses colonnes (dont status)
        const [rows]: any = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        // 2. Vérification de l'existence et du mot de passe
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return NextResponse.json(
                { error: "Email ou mot de passe incorrect" }, 
                { status: 401 }
            );
        }

        // 3. VÉRIFICATION DU STATUT (Sécurité critique)
        // Si le médecin est marqué comme 'suspendu' dans la BDD, on bloque l'accès
        if (user.status === 'suspendu') {
            return NextResponse.json(
                { error: "Votre compte a été suspendu par l'administration. Veuillez les contacter." }, 
                { status: 403 } // 403 Forbidden : l'utilisateur est reconnu mais n'a pas le droit d'entrer
            );
        }

        // 4. Succès : On retourne les infos pour la session
        return NextResponse.json({ 
            user: { 
                id: user.id, 
                name: user.name, // Vérifie si ta colonne est 'name' ou 'nom' dans MySQL
                role: user.role 
            } 
        });

    } catch (error) {
        console.error("Erreur Login:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}