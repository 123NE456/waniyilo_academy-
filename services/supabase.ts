
import { createClient } from '@supabase/supabase-js';
import { UserProfile, Archetype } from '../types';

// Configuration Supabase
const SUPABASE_URL = 'https://quemcztobbsqdlqftgyw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1ZW1jenRvYmJzcWRscWZ0Z3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MTI1NjksImV4cCI6MjA4MDM4ODU2OX0.s-Al1jPolCYqfxyYULeTF2AD2B8J8HyrUmVX7a6j43A';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- DIAGNOSTIC SYSTEME ---
export const checkSupabaseConnection = async (): Promise<{ ok: boolean; message: string }> => {
    try {
        // On essaie juste de lire la table, peu importe le résultat, tant que ça ne crash pas
        const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        
        if (error) {
            if (error.code === '42P01') { // Code PostgreSQL pour "Table undefined"
                return { ok: false, message: "La table 'profiles' n'existe pas. Lancez le script SQL." };
            }
            return { ok: false, message: `Erreur API: ${error.message}` };
        }
        return { ok: true, message: "Connexion établie. Table prête." };
    } catch (e: any) {
        return { ok: false, message: "Impossible de joindre Supabase." };
    }
};

// --- GESTION DES PROFILS UTILISATEURS ---

// Récupérer un profil par téléphone
export const getProfileByPhone = async (phone: string): Promise<UserProfile | null> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('phone', phone)
            .single();

        if (error) {
            return null;
        }

        return {
            name: data.name,
            phone: data.phone,
            archetype: data.archetype as Archetype,
            level: data.level,
            xp: data.xp,
            badges: data.badges || [],
            joinedAt: data.created_at
        };
    } catch (e) {
        console.error("Erreur connexion Supabase", e);
        return null;
    }
};

// Créer ou Mettre à jour un profil
export const upsertProfile = async (profile: UserProfile): Promise<{ success: boolean; error?: string }> => {
    try {
        const dbProfile = {
            phone: profile.phone,
            name: profile.name,
            archetype: profile.archetype,
            level: profile.level,
            xp: profile.xp,
            badges: profile.badges,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('profiles')
            .upsert(dbProfile, { onConflict: 'phone' });

        if (error) {
            console.error("Erreur sauvegarde profil (Supabase):", error);
            return { success: false, error: error.message };
        }
        return { success: true };
    } catch (e: any) {
        console.error("Erreur critique Supabase", e);
        return { success: false, error: e.message || "Erreur inconnue" };
    }
};

// Ajouter des XP en temps réel
export const addXPToRemote = async (phone: string, amount: number) => {
    try {
        const { data: current } = await supabase.from('profiles').select('xp').eq('phone', phone).single();
        if (current) {
            await supabase.from('profiles').update({ xp: current.xp + amount }).eq('phone', phone);
        }
    } catch (e) {
        console.error("Impossible de sync XP", e);
    }
};
