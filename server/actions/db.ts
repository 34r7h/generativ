import { open } from 'lmdb';
import crypto from 'crypto';

// Database structure - flat, scalable design
interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

interface Session {
  userId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
}

interface DataRecord {
  id: string;
  userId: string;
  key: string;
  value: any;
  createdAt: string;
  updatedAt: string;
}

// Database instance
let db: any = null;
let usersDB: any = null;
let sessionsDB: any = null;
let dataDB: any = null;
let emailIndexDB: any = null; // Index for email lookups

// Initialize database with proper configuration
export async function initDB() {
  if (!db) {
    try {
      console.log('Initializing database...');
      
      // Main database environment
      db = await open({
        path: process.cwd() + '/data',
        maxDbs: 20, // Increased for more databases
        mapSize: 2 * 1024 * 1024 * 1024, // 2GB
        pageSize: 8192, // Optimized for larger databases
        compression: true, // Enable compression for better storage
        sharedStructuresKey: Symbol.for('structures'), // Enable shared structures
        overlappingSync: true, // Better performance on non-Windows
      });

      // Create separate databases for different data types
      usersDB = db.openDB('users', { 
        encoding: 'msgpack',
        cache: true // Enable caching for frequently accessed data
      });
      
      sessionsDB = db.openDB('sessions', { 
        encoding: 'msgpack',
        cache: true
      });
      
      dataDB = db.openDB('data', { 
        encoding: 'msgpack',
        cache: true
      });

      // Email index database with dupSort for efficient lookups
      emailIndexDB = db.openDB('email_index', {
        encoding: 'ordered-binary',
        dupSort: true, // Allow multiple entries per key for indexing
        // Note: dupSort cannot be combined with cache
      });

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }
  return db;
}

// Get database instance
export function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return db;
}

// User operations with proper indexing
export async function createUser(email: string, passwordHash: string): Promise<string> {
  try {
    console.log('Creating user with email:', email);
    
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user: User = {
      id: userId,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Use transaction for atomic operation
    await db.transaction(() => {
      // Store user data
      usersDB.put(userId, user);
      
      // Create email index entry
      emailIndexDB.put(email, userId);
    });

    console.log('User saved to database with index');
    return userId;
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    return usersDB.get(userId);
  } catch (error) {
    console.error('Error in getUserById:', error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    // Use the email index for efficient lookups
    const userIds = emailIndexDB.getValues(email);
    
    // Get the first (and should be only) userId for this email
    for (const userId of userIds) {
      const user = await getUserById(userId);
      if (user) return user;
    }
    
    return null;
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    return null;
  }
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
  try {
    const user = await getUserById(userId);
    if (!user) return false;

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await usersDB.put(userId, updatedUser);
    return true;
  } catch (error) {
    console.error('Error in updateUser:', error);
    return false;
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const user = await getUserById(userId);
    if (!user) return false;

    await db.transaction(() => {
      // Delete user data
      usersDB.remove(userId);
      
      // Remove email index
      emailIndexDB.remove(user.email, userId);
      
      // Delete all sessions for this user
      const sessions = sessionsDB.getValues(userId);
      for (const session of sessions) {
        sessionsDB.remove(userId, session);
      }
      
      // Delete all data records for this user
      const dataRecords = dataDB.getValues(userId);
      for (const record of dataRecords) {
        dataDB.remove(userId, record);
      }
    });

    return true;
  } catch (error) {
    console.error('Error in deleteUser:', error);
    return false;
  }
}

// Session operations with proper expiration handling
export async function createSession(userId: string, token: string, expiresIn: number = 24 * 60 * 60 * 1000): Promise<void> {
  try {
    const session: Session = {
      userId,
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + expiresIn).toISOString()
    };

    // Store session with userId as key and session data as value
    await sessionsDB.put(userId, session);
  } catch (error) {
    console.error('Error in createSession:', error);
    throw error;
  }
}

export async function getSessionByToken(token: string): Promise<Session | null> {
  try {
    // Search through all sessions to find matching token
    // In production, consider creating a token index for better performance
    const sessions = sessionsDB.getRange();
    
    for (const { key, value } of sessions) {
      if (value.token === token && new Date(value.expiresAt) > new Date()) {
        return value;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error in getSessionByToken:', error);
    return null;
  }
}

export async function deleteSession(token: string): Promise<boolean> {
  try {
    const session = await getSessionByToken(token);
    if (!session) return false;

    await sessionsDB.remove(session.userId, session);
    return true;
  } catch (error) {
    console.error('Error in deleteSession:', error);
    return false;
  }
}

export async function deleteAllSessionsForUser(userId: string): Promise<void> {
  try {
    const sessions = sessionsDB.getValues(userId);
    for (const session of sessions) {
      await sessionsDB.remove(userId, session);
    }
  } catch (error) {
    console.error('Error in deleteAllSessionsForUser:', error);
  }
}

// Authentication function
export async function authenticateUser(token: string): Promise<string | null> {
  try {
    const session = await getSessionByToken(token);
    if (!session) return null;

    // Check if session is expired
    if (new Date(session.expiresAt) <= new Date()) {
      await deleteSession(token);
      return null;
    }

    return session.userId;
  } catch (error) {
    console.error('Error in authenticateUser:', error);
    return null;
  }
}

// Data operations
export async function createDataRecord(userId: string, key: string, value: any): Promise<string> {
  try {
    const recordId = `data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const record: DataRecord = {
      id: recordId,
      userId,
      key,
      value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dataDB.put(userId, record);
    return recordId;
  } catch (error) {
    console.error('Error in createDataRecord:', error);
    throw error;
  }
}

export async function getDataRecord(recordId: string): Promise<DataRecord | null> {
  try {
    // Search through all data records to find matching recordId
    // In production, consider creating a recordId index for better performance
    const dataRecords = dataDB.getRange();
    
    for (const { key, value } of dataRecords) {
      if (value.id === recordId) {
        return value;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error in getDataRecord:', error);
    return null;
  }
}

export async function getDataRecordsByUser(userId: string): Promise<DataRecord[]> {
  try {
    const records: DataRecord[] = [];
    const dataRecords = dataDB.getValues(userId);
    
    for (const record of dataRecords) {
      records.push(record);
    }
    
    return records;
  } catch (error) {
    console.error('Error in getDataRecordsByUser:', error);
    return [];
  }
}

export async function updateDataRecord(recordId: string, updates: Partial<DataRecord>): Promise<boolean> {
  try {
    const record = await getDataRecord(recordId);
    if (!record) return false;

    const updatedRecord = {
      ...record,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await dataDB.put(record.userId, updatedRecord);
    return true;
  } catch (error) {
    console.error('Error in updateDataRecord:', error);
    return false;
  }
}

export async function deleteDataRecord(recordId: string): Promise<boolean> {
  try {
    const record = await getDataRecord(recordId);
    if (!record) return false;

    await dataDB.remove(record.userId, record);
    return true;
  } catch (error) {
    console.error('Error in deleteDataRecord:', error);
    return false;
  }
}

// Cleanup expired sessions
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    const now = new Date();
    const sessions = sessionsDB.getRange();
    
    for (const { key, value } of sessions) {
      if (new Date(value.expiresAt) <= now) {
        await sessionsDB.remove(key, value);
      }
    }
  } catch (error) {
    console.error('Error in cleanupExpiredSessions:', error);
  }
}

// Database statistics with proper counting
export async function getDBStats(): Promise<{ users: number; sessions: number; data: number }> {
  try {
    let users = 0;
    let sessions = 0;
    let data = 0;

    // Count users
    const userEntries = usersDB.getRange();
    for (const _ of userEntries) users++;

    // Count sessions
    const sessionEntries = sessionsDB.getRange();
    for (const _ of sessionEntries) sessions++;

    // Count data records
    const dataEntries = dataDB.getRange();
    for (const _ of dataEntries) data++;

    return { users, sessions, data };
  } catch (error) {
    console.error('Error in getDBStats:', error);
    return { users: 0, sessions: 0, data: 0 };
  }
}

// Close database
export async function closeDB(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
    usersDB = null;
    sessionsDB = null;
    dataDB = null;
    emailIndexDB = null;
  }
}
