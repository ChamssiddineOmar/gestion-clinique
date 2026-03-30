import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // 1. On récupère bien 'telephone' depuis le frontend
        const { nom, prenom, email, password, telephone, role, date_naissance, specialite } = body;

        // 2. Validation de base (Ajout du téléphone dans les champs obligatoires)
        if (!nom || !prenom || !email || !password || !role || !telephone) {
            return NextResponse.json(
                { error: "Veuillez remplir tous les champs obligatoires, y compris le téléphone." }, 
                { status: 400 }
            );
        }

        // 3. Vérifier si l'utilisateur existe déjà
        const [existingUser]: any = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUser && existingUser.length > 0) {
            return NextResponse.json(
                { error: "Cet email est déjà associé à un compte." }, 
                { status: 400 }
            );
        }

        // 4. Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Insertion dans la base de données
        // ATTENTION : On utilise 'name' (combinaison nom + prenom) et on ajoute 'telephone'
        // Vérifie que ta table a bien ces colonnes : id, name, email, password, telephone, role, date_naissance, specialite
        await db.query(
            'INSERT INTO users (name, email, password, telephone, role, date_naissance, specialite) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                `${nom} ${prenom}`, // Fusion pour correspondre à la colonne 'name'
                email, 
                hashedPassword, 
                telephone, // Nouvelle donnée !
                role, 
                date_naissance, 
                role === 'medecin' ? (specialite || 'Généraliste') : null
            ]
        );

        return NextResponse.json(
            { message: "Utilisateur créé avec succès !" }, 
            { status: 201 }
        );

    } catch (error: any) {
        console.error("Erreur Inscription détaillée:", error);
        
        if (error.code === 'ECONNREFUSED') {
            return NextResponse.json(
                { error: "Impossible de se connecter à la base de données. Vérifiez MySQL." }, 
                { status: 500 }
            );
        }

        // Retourne l'erreur SQL précise pour t'aider à déboguer si ça échoue encore
        return NextResponse.json(
            { error: `Erreur SQL : ${error.message}` }, 
            { status: 500 }
        );
    }
}