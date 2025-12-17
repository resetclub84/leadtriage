import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Cliente para uso no servidor (com service role key - acesso total)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Função para fazer upload de arquivo
export async function uploadFile(
    bucket: string,
    filePath: string,
    file: Buffer | Blob,
    contentType: string
): Promise<{ url: string | null; error: string | null }> {
    try {
        const { data, error } = await supabaseAdmin.storage
            .from(bucket)
            .upload(filePath, file, {
                contentType,
                upsert: true
            });

        if (error) {
            console.error('Erro no upload:', error);
            return { url: null, error: error.message };
        }

        // Gerar URL pública
        const { data: urlData } = supabaseAdmin.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return { url: urlData.publicUrl, error: null };
    } catch (err: any) {
        console.error('Erro no upload:', err);
        return { url: null, error: err.message };
    }
}

// Função para deletar arquivo
export async function deleteFile(
    bucket: string,
    filePath: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        const { error } = await supabaseAdmin.storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

// Nome do bucket para fotos de pacientes
export const PATIENT_PHOTOS_BUCKET = 'patient-photos';
