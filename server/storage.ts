import { users, type User, type InsertUser } from "@shared/schema";
import { db } from './db';
import { eq } from 'drizzle-orm';
import { log } from './vite';

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

// Database storage implementation using Drizzle ORM
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      log(`Database error in getUser: ${(error as Error).message}`, 'storage');
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      log(`Database error in getUserByUsername: ${(error as Error).message}`, 'storage');
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values(insertUser)
        .returning();
      return user;
    } catch (error) {
      log(`Database error in createUser: ${(error as Error).message}`, 'storage');
      throw new Error(`Failed to create user: ${(error as Error).message}`);
    }
  }
}

// Memory storage fallback if database is not available
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    log('Using in-memory storage for users', 'storage');
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

// Initialize storage based on database availability
let storageImpl: IStorage;

try {
  // Try to use database storage by default
  storageImpl = new DatabaseStorage();
  log('Using PostgreSQL database for storage', 'storage');
} catch (error) {
  // Fall back to memory storage if database initialization fails
  log(`Database initialization failed: ${(error as Error).message}. Using memory storage fallback.`, 'storage');
  storageImpl = new MemStorage();
}

export const storage = storageImpl;
