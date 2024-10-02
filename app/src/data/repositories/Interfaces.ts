// app/src/data/repositories/IRepository.ts
export interface IRepository<T> {
    add(item: T): Promise<void>;
    update(item: T): Promise<void>;
    delete(id: string): Promise<void>;
    getById(id: string): Promise<T | null>;
    getAll(): Promise<T[]>;
  }