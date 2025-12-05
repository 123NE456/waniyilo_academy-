

import { createClient } from '@supabase/supabase-js';
import { UserProfile, Archetype, LeaderboardEntry, NewsItem, Course, NexusMessage, VocabularyItem, Comment, PrivateMessage, Partner, UserSummary, VodunLocation, VodunArchive } from '../types';

// Configuration Supabase
const SUPABASE_URL = 'https://quemcztobbsqdlqftgyw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1ZW1jenRvYmJzcWRscWZ0Z3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MTI1NjksImV4cCI6MjA4MDM4ODU2OX0.s-Al1jPolCYqfxyYULeTF2AD2B8J8HyrUmVX7a6j43A';

let supabaseInstance: any = null;

const getSupabase = () => {
    if (!supabaseInstance) {
        supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
            }
        });
    }
    return supabaseInstance;
};

export const supabase = getSupabase();

// --- DIAGNOSTIC SYSTEME ---
export const checkSupabaseConnection = async (): Promise<{ ok: boolean; message: string }> => {
    try {
        const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        
        if (error) {
            if (error.code === '42P01') {
                return { ok: false, message: "Table 'profiles' introuvable. Lancez le script SQL." };
            }
            if (error.code === '42883') {
                return { ok: false, message: "Erreur SQL (UUID/BigInt). Supprimez les policies RLS incompatibles." };
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
            date: item.date_display,
            content: item.content
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

// --- PARTENAIRES ---
export const fetchPartners = async (): Promise<Partner[]> => {
    try {
        const { data, error } = await supabase.from('partners').select('*');
        if (error || !data) return [];
        return data as Partner[];
    } catch(e) { return []; }
}

export const addPartner = async (name: string, type: string, website_url?: string) => {
    try {
        const { error } = await supabase.from('partners').insert({ name, type, website_url });
        return { success: !error, error: error?.message };
    } catch(e: any) {
        return { success: false, error: e.message };
    }
}

export const deletePartner = async (id: number) => {
    try {
        const { error } = await supabase.from('partners').delete().eq('id', id);
        return { success: !error };
    } catch(e) { return { success: false }; }
}

// --- VODUN DAYS ---
export const fetchVodunLocations = async (): Promise<VodunLocation[]> => {
    try {
        const { data, error } = await supabase.from('vodun_locations').select('*');
        if(error || !data) return [];
        return data as VodunLocation[];
    } catch(e) { return []; }
}

export const addVodunLocation = async (name: string, type: string, img_url: string, description_long: string, map_coords: string) => {
    try {
        const { error } = await supabase.from('vodun_locations').insert({ 
            name, type, img_url, description_long, map_coords 
        });
        return { success: !error };
    } catch(e) { return { success: false }; }
}

export const deleteVodunLocation = async (id: number) => {
    try {
        const { error } = await supabase.from('vodun_locations').delete().eq('id', id);
        return { success: !error };
    } catch(e) { return { success: false }; }
}

export const fetchVodunArchives = async (): Promise<VodunArchive[]> => {
    try {
        const { data, error } = await supabase.from('vodun_archives').select('*').order('year', { ascending: false });
        if(error || !data) return [];
        return data as VodunArchive[];
    } catch(e) { return []; }
}

export const addVodunArchive = async (year: number, title: string, description: string, gallery: string[]) => {
    try {
        const { error } = await supabase.from('vodun_archives').insert({ year, title, description, gallery });
        return { success: !error };
    } catch(e) { return { success: false }; }
}

export const deleteVodunArchive = async (id: number) => {
    try {
        const { error } = await supabase.from('vodun_archives').delete().eq('id', id);
        return { success: !error };
    } catch(e) { return { success: false }; }
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
            .order('id', { ascending: true }) // Ordre stable pour le quiz
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
            joinedAt: data.created_at,
            avatar_style: data.avatar_style || 'bottts',
            course_progress: data.course_progress || {}
        };
    } catch (e) {
        console.error("Erreur connexion Supabase", e);
        return null;
    }
};

export const fetchAllUsers = async (): Promise<UserSummary[]> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('matricule, name, phone, level, avatar_style')
            .order('created_at', { ascending: false });
        if(error || !data) return [];
        return data as UserSummary[];
    } catch (e) { return []; }
}

export const upsertProfile = async (profile: UserProfile): Promise<{ success: boolean; error?: string; matricule?: string }> => {
    try {
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
            avatar_style: 'bottts',
            updated_at: new Date().toISOString(),
            course_progress: profile.course_progress || {}
        };

        const { error } = await supabase
            .from('profiles')
            .upsert(dbProfile, { onConflict: 'phone' });

        if (error) {
            console.error("Erreur sauvegarde profil (Supabase):", error);
            if (error.code === '23505') return { success: false, error: "Ce numéro (ou matricule) est déjà inscrit." };
            return { success: false, error: error.message };
        }
        return { success: true, matricule: matriculeToUse };
    } catch (e: any) {
        console.error("Erreur critique Supabase", e);
        return { success: false, error: e.message || "Erreur inconnue" };
    }
};

export const updateAvatar = async (matricule: string, style: string) => {
    try {
        await supabase.from('profiles').update({ avatar_style: style }).eq('matricule', matricule);
        return true;
    } catch (e) { return false; }
}

export const saveCourseScore = async (matricule: string, courseId: string, score: number) => {
    try {
        // 1. Récupérer le progrès actuel
        const { data: profile } = await supabase.from('profiles').select('course_progress').eq('matricule', matricule).single();
        if (!profile) return;

        let currentProgress = profile.course_progress || {};
        
        // 2. Ne sauvegarder que si le nouveau score est meilleur
        if (!currentProgress[courseId] || score > currentProgress[courseId]) {
            currentProgress[courseId] = score;
            await supabase.from('profiles').update({ course_progress: currentProgress }).eq('matricule', matricule);
        }
    } catch (e) {
        console.error("Erreur sauvegarde score", e);
    }
}

export const addXPToRemote = async (matricule: string, amount: number) => {
    try {
        const { error } = await supabase.rpc('increment_xp', { user_matricule: matricule, xp_amount: amount });
        
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
            .select('name, archetype, xp, level, avatar_style, matricule')
            .neq('archetype', 'ADMIN') 
            .order('xp', { ascending: false })
            .limit(10);
            
        if (error) return [];
        
        return data.map((entry: any) => ({
            name: entry.name,
            archetype: entry.archetype as Archetype,
            xp: entry.xp,
            level: entry.level,
            avatar_style: entry.avatar_style,
            matricule: entry.matricule
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

export const deleteNexusMessage = async (id: number) => {
    try {
        const { error } = await supabase.from('messages').delete().eq('id', id);
        return { success: !error };
    } catch (e) { return { success: false }; }
}

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
