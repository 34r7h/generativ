import * as db from './db.js';
import crypto from 'crypto';

// Authentication operation types
export type AuthOperation = 'login' | 'logout' | 'signup' | 'delete' | 'otp';

// Request interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface OTPRequest {
  email: string;
  action: 'generate' | 'verify';
  code?: string;
}

// Response interfaces
export interface LoginResponse {
  success: boolean;
  userId?: string;
  token?: string;
  error?: string;
}

export interface SignupResponse {
  success: boolean;
  userId?: string;
  error?: string;
}

export interface LogoutResponse {
  success: boolean;
  error?: string;
}

export interface DeleteResponse {
  success: boolean;
  error?: string;
}

export interface OTPResponse {
  success: boolean;
  code?: string;
  error?: string;
}

// Utility functions
function hashPassword(password: string, salt?: string): string {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, hash] = hashedPassword.split(':');
  const hashedInput = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === hashedInput;
}

function generateJWT(userId: string): string {
  // Generate a secure random token - NOT a real JWT, just a session token
  const randomBytes = crypto.randomBytes(32);
  const timestamp = Date.now().toString(36);
  const userHash = crypto.createHash('sha256').update(userId).digest('hex').slice(0, 8);
  
  return `${timestamp}.${userHash}.${randomBytes.toString('hex')}`;
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP codes temporarily (in production, use Redis or similar)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

// Track login attempts for rate limiting
const attemptTracker = new Map<string, { count: number; lastAttempt: number }>();

// Authentication operations
export async function login(request: LoginRequest): Promise<LoginResponse> {
  try {
    const { email, password } = request;
    
    // Validate input
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Invalid email format' };
    }
    
    // Rate limiting check (temporarily disabled for debugging)
    // const loginAttempts = attemptTracker.get(email) || { count: 0, lastAttempt: 0 };
    // const now = Date.now();
    // const timeDiff = now - loginAttempts.lastAttempt;
    
    // if (loginAttempts.count >= 5 && timeDiff < 15 * 60 * 1000) { // 15 minutes
    //   return { success: false, error: 'Too many login attempts. Please try again later.' };
    // }
    
    // Find user by email
    const user = await db.getUserByEmail(email);
    if (!user) {
      // Track failed attempt (temporarily disabled)
      // attemptTracker.set(email, { 
      //   count: loginAttempts.count + 1, 
      //   lastAttempt: now 
      // });
      return { success: false, error: 'Invalid email or password' };
    }
    
    // Verify password
    if (!verifyPassword(password, user.passwordHash)) {
      // Track failed attempt (temporarily disabled)
      // attemptTracker.set(email, { 
      //   count: loginAttempts.count + 1, 
      //   lastAttempt: now 
      // });
      return { success: false, error: 'Invalid email or password' };
    }
    
    // Clear failed attempts on successful login
    attemptTracker.delete(email);
    
    // Generate JWT token
    const token = generateJWT(user.id);
    
    // Save session to database
    await db.createSession(user.id, token);
    
    return {
      success: true,
      userId: user.id,
      token
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function signup(request: SignupRequest): Promise<SignupResponse> {
  try {
    const { email, password } = request;
    
    // Validate input
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Invalid email format' };
    }
    
    // Strong password validation
    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long' };
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { success: false, error: 'Password must contain at least one lowercase letter, one uppercase letter, and one number' };
    }
    
    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return { success: false, error: 'User with this email already exists' };
    }
    
    // Hash password and create user
    const passwordHash = hashPassword(password);
    const userId = await db.createUser(email, passwordHash);
    
    return {
      success: true,
      userId
    };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function logout(token: string): Promise<LogoutResponse> {
  try {
    if (!token) {
      return { success: false, error: 'Token is required' };
    }
    
    // Delete session from database
    const deleted = await db.deleteSession(token);
    
    if (!deleted) {
      return { success: false, error: 'Invalid or expired token' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function deleteUser(token: string): Promise<DeleteResponse> {
  try {
    if (!token) {
      return { success: false, error: 'Token is required' };
    }
    
    // Authenticate user
    const userId = await db.authenticateUser(token);
    if (!userId) {
      return { success: false, error: 'Invalid or expired token' };
    }
    
    // Delete user and all associated data
    const deleted = await db.deleteUser(userId);
    
    if (!deleted) {
      return { success: false, error: 'Failed to delete user' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Delete user error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function handleOTP(request: OTPRequest): Promise<OTPResponse> {
  try {
    const { email, action, code } = request;
    
    if (!email || !action) {
      return { success: false, error: 'Email and action are required' };
    }
    
    if (action === 'generate') {
      // Generate new OTP
      const otpCode = generateOTP();
      const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes
      
      otpStore.set(email, { code: otpCode, expiresAt });
      
      // In production, send this via email/SMS
      console.log(`OTP for ${email}: ${otpCode}`);
      
      return {
        success: true,
        code: otpCode // Remove this in production
      };
    } else if (action === 'verify') {
      // Verify OTP
      if (!code) {
        return { success: false, error: 'OTP code is required for verification' };
      }
      
      const storedOTP = otpStore.get(email);
      if (!storedOTP) {
        return { success: false, error: 'No OTP found for this email' };
      }
      
      if (Date.now() > storedOTP.expiresAt) {
        otpStore.delete(email);
        return { success: false, error: 'OTP has expired' };
      }
      
      if (storedOTP.code !== code) {
        return { success: false, error: 'Invalid OTP code' };
      }
      
      // Remove used OTP
      otpStore.delete(email);
      
      return { success: true };
    }
    
    return { success: false, error: 'Invalid action' };
  } catch (error) {
    console.error('OTP error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// Main authentication handler
export async function handleAuth(operation: AuthOperation, request: any, token?: string): Promise<any> {
  switch (operation) {
    case 'login':
      return await login(request);
    
    case 'signup':
      return await signup(request);
    
    case 'logout':
      return await logout(token || '');
    
    case 'delete':
      return await deleteUser(token || '');
    
    case 'otp':
      return await handleOTP(request);
    
    default:
      return { success: false, error: 'Invalid operation' };
  }
}

// Cleanup expired OTP codes periodically
setInterval(() => {
  const now = Date.now();
  for (const [email, otp] of otpStore.entries()) {
    if (now > otp.expiresAt) {
      otpStore.delete(email);
    }
  }
}, 5 * 60 * 1000); // Every 5 minutes
