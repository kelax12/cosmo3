import { supabase } from '@/lib/supabase';
import { normalizeApiError } from '@/lib/normalizeApiError';
import { ITasksRepository, Task } from './tasks.repository';

export class SupabaseTasksRepository implements ITasksRepository {
  async fetchTasks(): Promise<Task[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('userId', user.id)
      .order('createdAt', { ascending: false });

    if (error) throw normalizeApiError(error);
    return data || [];
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...task, userId: user.id }])
      .select()
      .single();

    if (error) throw normalizeApiError(error);
    return data;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('userId', user.id)
      .select()
      .single();

    if (error) throw normalizeApiError(error);
    return data;
  }

  async deleteTask(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('userId', user.id);

    if (error) throw normalizeApiError(error);
  }
}
