import { supabase } from './supabase';

export const signOut = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
            return { success: false, error };
        }
        return { success: true };
    } catch (error) {
        console.error('Unexpected error during sign out:', error);
        return { success: false, error };
    }
};
