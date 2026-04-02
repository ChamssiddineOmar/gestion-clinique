import nodemailer from 'nodemailer';

// Configuration optimisée pour Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        // Rappel : Utilise le code de 16 caractères sans espaces ici
        pass: process.env.EMAIL_SERVER_PASSWORD, 
    },
});

/**
 * Fonction réutilisable pour envoyer des emails (Support, Rendez-vous, etc.)
 */
export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        const info = await transporter.sendMail({
            // L'expéditeur affiché dans la boîte mail
            from: `"Support MedGest" <${process.env.EMAIL_SERVER_USER}>`,
            to,
            subject,
            html,
        });

        console.log("✅ Email envoyé avec succès ! ID:", info.messageId);
        return { success: true };
    } catch (error: any) {
        // Log détaillé dans ton terminal pour débugger rapidement
        console.error("❌ ERREUR NODEMAILER DÉTAILLÉE :");
        console.error("Code d'erreur :", error.code);
        console.error("Message :", error.message);
        
        return { success: false, error: error.message };
    }
};