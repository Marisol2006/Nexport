
import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { supabase } from '../supabase/supabaseClient';

export class SupabaseAuthRepository extends AuthRepository {
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles_usuario')
      .select('id, nombre, correo, usuario, estado, rol_id, roles(nombre)')
      .eq('id', data.user.id)
      .single();

    if (perfilError) {
      await supabase.auth.signOut();
      throw new Error('No se pudo recuperar el perfil del usuario');
    }

    if (
      perfil.estado !== 'Activo' ||
      perfil.roles?.nombre !== 'Administrador'
    ) {
      await supabase.auth.signOut();
      throw new Error('Tu cuenta no tiene permisos de administrador activos');
    }

    return {
      user: data.user,
      perfil,
    };
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error) throw error;

    return data.user;
  }
}
