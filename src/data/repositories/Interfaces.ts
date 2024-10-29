import ClosureEntry from "../models/ClosureEntry";

// app/src/data/repositories/IRepository.ts
export interface IRepository<T> {
    add(item: T): Promise<void>;
    update(item: T): Promise<void>;
    delete(id: string): Promise<void>;
    getById(id: string): Promise<T | null>;
    getAll(): Promise<T[]>;
    clear(): Promise<void>;
  }

export interface IClosureTableRepository {
  add(entry: ClosureEntry): Promise<void>;
  deleteByAncestorDescendant(ancestorId: string, descendantId: string): Promise<void>;
  getDescendants(ancestorId: string): Promise<ClosureEntry[]>;
  getAncestors(descendantId: string): Promise<ClosureEntry[]>;
  deleteDescendants(ancestorId: string): Promise<void>;
  getAll(): Promise<ClosureEntry[]>;
  clear(): Promise<void>;
}