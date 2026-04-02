import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mailer';

export async function POST(request: Request) {
    try {
        // 1. Vérification de la lecture du JSON
        const body = await request.json();
        const { nom, email, sujet, message } = body;

        // 2. Validation des champs
        if (!nom || !email || !message) {
            return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
        }

        // 3. Vérification CRITIQUE des variables d'environnement
        // Si ces variables sont undefined, le serveur renverra une erreur 500
        if (!process.env.EMAIL_SERVER_USER) {
            console.error("ERREUR : EMAIL_SERVER_USER n'est pas défini dans le .env");
            return NextResponse.json({ error: "Configuration serveur incomplète" }, { status: 500 });
        }

        const emailBody = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #f1f5f9; padding: 20px; border-radius: 20px;">
                <h2 style="color: #4f46e5; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Nouveau Ticket Support - MedGest</h2>
                <p><strong>De :</strong> ${nom} (<a href="mailto:${email}">${email}</a>)</p>
                <p><strong>Sujet :</strong> ${sujet || 'Assistance Technique'}</p>
                <div style="background: #f8fafc; padding: 20px; border-radius: 15px; margin-top: 10px; font-style: italic;">
                    "${message}"
                </div>
                <p style="font-size: 10px; color: #94a3b8; margin-top: 30px; text-transform: uppercase; letter-spacing: 1px;">
                    Envoyé via le portail MedGest - 2026
                </p>
            </div>
        `;

        // 4. Appel du mailer
        const result = await sendEmail(
            process.env.EMAIL_SERVER_USER as string, 
            `[Support MedGest] ${sujet} - ${nom}`,
            emailBody
        );

        if (result.success) {
            return NextResponse.json({ message: "Votre demande a été envoyée !" }, { status: 200 });
        } else {
            // Si sendEmail renvoie success: false, on jette l'erreur précise
            throw new Error(result.error || "Échec de l'envoi de l'email via le serveur.");
        }

    } catch (error: any) {
        // C'EST ICI : Regarde ton terminal VS Code (la console noire) pour lire ce log !
        console.error("🔴 ERREUR API SUPPORT :", error.message);
        
        return NextResponse.json(
            { error: error.message || "Erreur interne du serveur" }, 
            { status: 500 }
        );
    }
}