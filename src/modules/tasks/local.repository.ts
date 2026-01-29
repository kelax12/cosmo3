import { ITasksRepository, Task } from './tasks.repository';

const STORAGE_KEY = 'cosmo_demo_tasks';

export class LocalStorageTasksRepository implements ITasksRepository {
  private getTasks(): Task[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveTasks(tasks: Task[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  async fetchTasks(): Promise<Task[]> {
    return this.getTasks();
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const tasks = this.getTasks();
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.saveTasks([newTask, ...tasks]);
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');

    const updatedTask = { ...tasks[index], ...updates };
    tasks[index] = updatedTask;
    this.saveTasks(tasks);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    const tasks = this.getTasks();
    const filteredTasks = tasks.filter(t => t.id !== id);
    this.saveTasks(filteredTasks);
  }
}
