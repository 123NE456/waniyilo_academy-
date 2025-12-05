
import { createClient } from '@supabase/supabase-js';
import { UserProfile, Archetype, LeaderboardEntry, NewsItem, Course, NexusMessage, VocabularyItem, Comment } from '../types';

// Configuration Supabase
const SUPABASE_URL = 'https://quemcztobbsqdlqftgyw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1ZW1jenRvYmJzcWRscWZ0Z3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MTI1NjksImV4cCI6MjA4MDM4ODU2OX0.s-Al1jPolCYqfxyYULeTF2AD2B8J8HyrUmVX7a6j43A';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- DIAGNOSTIC SYSTEME ---
export const checkSupabaseConnection = async (): Promise<{ ok: boolean; message: string }> => {
    try {
        const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        
        if (error) {
            if (error.code === '42P01') {
                return { ok: false, message: "Table 'profiles' introuvable. Lancez le script SQL." };
            }
            return { ok: false, message: `Erreur API: ${error.message}` };
        }
        return { ok: true, message: "Connexion établie. Table prête." };
    } catch (e: any) {
        return { ok: false, message: "Impossible de joindre Supabase." };
    }
};

// --- GESTION CONTENU DYNAMIQUE (BACKEND) ---

export const fetchNews = async (): Promise<NewsItem[]> => {
    try {
        const { data, error } = await supabase
            .from('news')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
            
        if (error || !data) return [];
        
        return data.map((item: any) => ({
            id: item.id.toString(),
            title: item.title,
            category: item.category,
            excerpt: item.excerpt,
            date: item.date_display
        }));
    } catch (e) {
        return [];
    }
};

export const createNews = async (title: string, category: string, excerpt: string, date: string) => {
    try {
        const { error } = await supabase.from('news').insert({
            title, category, excerpt, date_display: date
        });
        return { success: !error, error: error?.message };
    } catch(e: any) {
        return { success: false, error: e.message };
    }
}

export const deleteNews = async (id: string) => {
    try {
        const { error } = await supabase.from('news').delete().eq('id', id);
        return { success: !error, error: error?.message };
    } catch(e: any) {
        return { success: false, error: e.message };
    }
}

// --- COMMENTAIRES ---
export const fetchComments = async (newsId: string): Promise<Comment[]> => {
    try {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('news_id', newsId)
            .order('created_at', { ascending: true });
        
        if(error || !data) return [];
        return data as Comment[];
    } catch(e) { return []; }
}

export const addComment = async (newsId: string, userName: string, content: string) => {
    try {
        const { error } = await supabase.from('comments').insert({
            news_id: newsId, user_name: userName, content
        });
        return { success: !error, error: error?.message };
    } catch(e: any) {
        return { success: false, error: e.message };
    }
}


export const fetchCourses = async (): Promise<Course[]> => {
    try {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('id', { ascending: true });

        if (error || !data) return [];

        return data.map((item: any) => ({
            id: item.id,
            title: item.title,
            desc: item.description,
            level: item.level,
            duration: item.status === 'AVAILABLE' ? 'Module Actif' : 'À venir',
            modules: [],
            iconName: item.icon_name
        }));
    } catch (e) {
        return [];
    }
};

export const fetchVocabulary = async (level: number = 1): Promise<VocabularyItem[]> => {
    try {
        const { data, error } = await supabase
            .from('vocabulary')
            .select('*')
            .eq('level', level);
            
        if (error || !data) return [];
        
        return data.map((item: any) => ({
            id: item.id,
            level: item.level,
            fr: item.fr,
            fon: item.fon,
            options: item.options
        }));
    } catch (e) {
        return [];
    }
}

export const addVocabulary = async (fr: string, fon: string, options: string[]) => {
    try {
        const { error } = await supabase.from('vocabulary').insert({
            level: 1, fr, fon, options
        });
        return { success: !error, error: error?.message };
    } catch(e: any) {
        return { success: false, error: e.message };
    }
}

export const deleteVocabulary = async (id: number) => {
    try {
        const { error } = await supabase.from('vocabulary').delete().eq('id', id);
        return { success: !error, error: error?.message };
    } catch(e: any) {
        return { success: false, error: e.message };
    }
}


// --- GESTION DES PROFILS UTILISATEURS ---

// Récupération par MATRICULE
export const getProfileByMatricule = async (matricule: string): Promise<UserProfile | null> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('matricule', matricule)
            .single();

        if (error) {
            return null;
        }

        return {
            name: data.name,
            phone: data.phone,
            matricule: data.matricule,
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

// Génération Matricule et Auth
export const upsertProfile = async (profile: UserProfile): Promise<{ success: boolean; error?: string; matricule?: string }> => {
    try {
        // 1. Générer un matricule aléatoire si c'est une nouvelle inscription
        let matriculeToUse = profile.matricule;
        
        if (!matriculeToUse) {
             const randomId = Math.floor(100000 + Math.random() * 900000); // 6 chiffres
             matriculeToUse = `W26-${randomId}`;
        }

        const dbProfile = {
            matricule: matriculeToUse,
            phone: profile.phone,
            name: profile.name,
            archetype: profile.archetype,
            level: profile.level,
            xp: profile.xp,
            badges: profile.badges,
            updated_at: new Date().toISOString()
        };

        // IMPORTANT : onConflict doit cibler une contrainte UNIQUE.
        // Avec le nouveau script SQL, 'phone' est UNIQUE.
        const { error } = await supabase
            .from('profiles')
            .upsert(dbProfile, { onConflict: 'phone' });

        if (error) {
            console.error("Erreur sauvegarde profil (Supabase):", error);
            // Gestion erreur contrainte unique
            if (error.code === '23505') return { success: false, error: "Ce numéro est déjà inscrit." };
            if (error.code === '42883') return { success: false, error: "Erreur config SQL (UUID/BigInt)." };
            return { success: false, error: error.message };
        }
        return { success: true, matricule: matriculeToUse };
    } catch (e: any) {
        console.error("Erreur critique Supabase", e);
        return { success: false, error: e.message || "Erreur inconnue" };
    }
};

export const addXPToRemote = async (matricule: string, amount: number) => {
    try {
        // Tentative d'appel RPC sécurisé avec MATRICULE
        const { error } = await supabase.rpc('increment_xp', { user_matricule: matricule, xp_amount: amount });
        
        // Fallback update manuel (uniquement si RPC échoue et RLS permissif)
        if (error) {
            console.warn("RPC increment_xp échoué, fallback update manuel", error.message);
            const { data: current } = await supabase.from('profiles').select('xp').eq('matricule', matricule).single();
            if (current) {
                await supabase.from('profiles').update({ xp: current.xp + amount }).eq('matricule', matricule);
            }
        }
    } catch (e) {
        console.error("Impossible de sync XP", e);
    }
};

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('name, archetype, xp, level')
            .order('xp', { ascending: false })
            .limit(10);
            
        if (error) return [];
        
        return data.map((entry: any) => ({
            name: entry.name,
            archetype: entry.archetype as Archetype,
            xp: entry.xp,
            level: entry.level
        }));
    } catch (e) {
        return [];
    }
};

// --- NEXUS (CHAT COMMUNAUTAIRE) ---

export const fetchRecentMessages = async (): Promise<NexusMessage[]> => {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
            
        if (error || !data) return [];
        return data.reverse() as NexusMessage[]; 
    } catch (e) {
        console.error("Erreur fetch messages", e);
        return [];
    }
};

export const sendMessageToNexus = async (userName: string, userPhone: string, archetype: string, content: string) => {
    try {
        const { error } = await supabase.from('messages').insert({
            user_name: userName,
            user_phone: userPhone,
            archetype: archetype,
            content: content
        });
        if (error) console.error("Erreur envoi message", error);
    } catch (e) {
        console.error("Exception envoi message", e);
    }
};

export const subscribeToNexus = (onMessage: (msg: NexusMessage) => void) => {
    return supabase
        .channel('nexus_channel')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages' },
            (payload) => {
                onMessage(payload.new as NexusMessage);
            }
        )
        .subscribe();
};
