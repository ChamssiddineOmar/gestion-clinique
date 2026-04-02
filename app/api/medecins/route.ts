import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Cette requête récupère les médecins ET calcule leur moyenne d'avis
        const results = await db.query(`
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.telephone, 
                u.specialite,
                IFNULL(AVG(a.note), 0) as note_moyenne,
                COUNT(a.id) as total_avis
            FROM users u
            LEFT JOIN avis a ON u.id = a.medecin_id
            WHERE u.role = 'medecin'
            GROUP BY u.id
        `);
        return NextResponse.json(results);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}