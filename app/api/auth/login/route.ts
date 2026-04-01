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

        // --- SÉCURITÉ : VÉRIFICATION DU STATUT ---
        // Si le compte est suspendu, on arrête tout ici.
        if (user.status === 'suspendu') {
            return NextResponse.json({ 
                error: "Votre compte est suspendu. Accès refusé." 
            }, { status: 403 }); // 403 = Forbidden
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
        }

        // --- RÉPONSE SI TOUT EST OK ---
        return NextResponse.json({ 
            user: { 
                id: user.id, 
                name: user.name,
                email: user.email,
                telephone: user.telephone,
                role: user.role,
                specialite: user.specialite,
                status: user.status // Optionnel : renvoyer le statut au front
            } 
        });

    } catch (error: any) {
        console.error("ERREUR CRITIQUE MYSQL :", error.message);
        return NextResponse.json({ error: "Erreur serveur : " + error.message }, { status: 500 });
    }
}