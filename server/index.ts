import { serve } from "bun";
import type { Request } from "bun";

// Configuration with environment variables
const config = {
  port: parseInt(process.env.PORT || '3003'),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'https://www.generativ.cc',
    'https://generativ.cc'
  ],
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Standardized API response formatter
function formatResponse(success: boolean, data: any = null, error: string | null = null, status: number = 200, headers: any = {}) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const response = {
    success,
    requestId,
    timestamp: new Date().toISOString(),
    ...(data !== null && { data }),
    ...(error && { error })
  };
  
  return new Response(JSON.stringify(response), {
    status,
    headers
  });
}

// Simple logger
const logger = {
  info: (message: string, ...args: any[]) => {
    if (['info', 'debug'].includes(config.logLevel)) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    if (['info', 'debug', 'warn'].includes(config.logLevel)) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
};
import { initDB, authenticateUser, getUserById, getUserByEmail, updateUser, createDataRecord, getDataRecord, getDataRecordsByUser, updateDataRecord, deleteDataRecord, getDBStats, cleanupExpiredSessions } from "./actions/db.js";
import { handleAuth } from "./actions/auth.js";
import { initCMSDB } from "./cms/db.js";
import { handleCMSOperation } from "./cms/api.js";
import { seedCMSData } from "./cms/seed.js";
import type { AuthOperation } from "./actions/auth.js";
import type { CMSOperation } from "./cms/api.js";

// Initialize database on startup
initDB().then(async () => {
  console.log("Database initialized successfully");
  
  // Initialize CMS database
  await initCMSDB();
  console.log("CMS database initialized successfully");
  
  // Check if we should seed the database
  // This can be triggered by setting the SEED_CMS environment variable
  // or by passing --seed-cms as a command line argument
  const shouldSeed = process.env.SEED_CMS === 'true' || 
                    process.argv.includes('--seed-cms');
                    
  if (shouldSeed) {
    try {
      console.log("Seeding CMS database with initial content...");
      await seedCMSData();
      console.log("CMS database seeded successfully");
    } catch (error) {
      console.error("Failed to seed CMS data:", error);
    }
  }
}).catch((error) => {
  console.error("Failed to initialize database:", error);
  process.exit(1);
});

const server = serve({
  port: config.port,
  async fetch(req: Request) {
    const url = new URL(req.url);
    const startTime = Date.now();
    
    // Log request
    logger.info(`${req.method} ${url.pathname}`, { 
      userAgent: req.headers.get('user-agent'),
      origin: req.headers.get('origin')
    });
    
    // Set CORS headers with proper origin handling
    const origin = req.headers.get('origin');
    const corsOrigin = origin && config.corsOrigins.includes(origin) ? origin : config.corsOrigins[0];
    
    const corsHeaders = {
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
      "Content-Type": "application/json"
    };
    
    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, { 
        status: 200, 
        headers: corsHeaders 
      });
    }
    
    try {
      // Health endpoint
      if (url.pathname === "/health") {
        const healthData = {
          status: "healthy",
          uptime: process.uptime(),
          environment: config.nodeEnv,
          version: "1.0.0"
        };
        
        logger.info("Health check completed", healthData);
        
        return formatResponse(true, healthData, null, 200, corsHeaders);
      }
      
      // Authentication endpoint
      if (url.pathname === "/auth") {
        if (req.method !== "POST") {
          return formatResponse(false, null, "Method not allowed", 405, corsHeaders);
        }
        
        try {
          const body = await req.json();
          const { type, operation, ...requestData } = body;
          const authType = type || operation;
          
          if (!authType || !['login', 'logout', 'signup', 'delete', 'otp'].includes(authType)) {
            return formatResponse(false, null, "Invalid operation type", 400, corsHeaders);
          }
          
          // Extract token from Authorization header for operations that need it
          let token: string | undefined;
          const authHeader = req.headers.get("Authorization");
          if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
          }
          
          const result = await handleAuth(authType as AuthOperation, requestData, token);
          
          // Format auth response consistently
          const status = result.success ? 200 : (result.error?.includes('Invalid email or password') ? 401 : 400);
          
          if (result.success) {
            logger.info(`Auth operation successful: ${authType}`, { userId: result.userId });
            return formatResponse(true, result, null, status, corsHeaders);
          } else {
            logger.warn(`Auth operation failed: ${authType}`, { error: result.error });
            return formatResponse(false, null, result.error, status, corsHeaders);
          }
        } catch (error) {
          logger.error("Auth endpoint error", { error: error.message });
          return formatResponse(false, null, "Invalid request body", 400, corsHeaders);
        }
      }
      
      // CMS endpoint
      if (url.pathname === "/cms") {
        if (req.method !== "POST") {
          return formatResponse(false, null, "Method not allowed", 405, corsHeaders);
        }
        
        try {
          const body = await req.json();
          const { operation, ...requestData } = body;
          
          if (!operation) {
            return formatResponse(false, null, "Operation is required", 400, corsHeaders);
          }
          
          // Extract token for authentication
          let token: string | undefined;
          const authHeader = req.headers.get("Authorization");
          if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
          }
          
          const result = await handleCMSOperation(operation as CMSOperation, requestData, token);
          
          // Format CMS response consistently
          const status = result.success ? 200 : (result.error?.includes('unauthorized') ? 403 : 400);
          
          if (result.success) {
            logger.info(`CMS operation successful: ${operation}`, { operation });
            return formatResponse(true, result, null, status, corsHeaders);
          } else {
            logger.warn(`CMS operation failed: ${operation}`, { error: result.error });
            return formatResponse(false, null, result.error, status, corsHeaders);
          }
        } catch (error) {
          logger.error("CMS endpoint error", { error: error.message });
          return formatResponse(false, null, "Invalid request body", 400, corsHeaders);
        }
      }
      
      // Database operations endpoint
      if (url.pathname === "/db") {
        if (req.method !== "POST") {
          return new Response(JSON.stringify({ 
            success: false, 
            error: "Method not allowed" 
          }), { 
            status: 405, 
            headers: corsHeaders 
          });
        }
        
        try {
          const body = await req.json();
          const { type, ...requestData } = body;
          
          // Extract token for authentication
          let token: string | undefined;
          const authHeader = req.headers.get("Authorization");
          if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
          }
          
          // Authenticate user for protected operations
          let userId: string | null = null;
          if (token) {
            userId = await authenticateUser(token);
          }
          
          // Handle different database operations
          let result: any;
          
          switch (type) {
                       case 'getUserById':
             if (!requestData.userId) {
               result = { success: false, error: 'userId is required' };
               break;
             }
             result = { success: true, user: await getUserById(requestData.userId) };
             break;
             
           case 'getUserByEmail':
             if (!requestData.email) {
               result = { success: false, error: 'email is required' };
               break;
             }
             result = { success: true, user: await getUserByEmail(requestData.email) };
             break;
             
           case 'updateUser':
             if (!userId) {
               result = { success: false, error: 'Authentication required' };
               break;
             }
             if (!requestData.updates) {
               result = { success: false, error: 'updates are required' };
               break;
             }
             result = { success: await updateUser(userId, requestData.updates) };
             break;
             
           case 'createDataRecord':
             if (!userId) {
               result = { success: false, error: 'Authentication required' };
               break;
             }
             if (!requestData.key || requestData.value === undefined) {
               result = { success: false, error: 'key and value are required' };
               break;
             }
             const recordId = await createDataRecord(userId, requestData.key, requestData.value);
             result = { success: true, recordId };
             break;
             
           case 'getDataRecord':
             if (!requestData.recordId) {
               result = { success: false, error: 'recordId is required' };
               break;
             }
             const record = await getDataRecord(requestData.recordId);
             if (record && userId && record.userId !== userId) {
               result = { success: false, error: 'Access denied' };
             } else {
               result = { success: true, record };
             }
             break;
             
           case 'getDataRecordsByUser':
             if (!userId) {
               result = { success: false, error: 'Authentication required' };
               break;
             }
             const records = await getDataRecordsByUser(userId);
             result = { success: true, records };
             break;
             
           case 'updateDataRecord':
             if (!userId) {
               result = { success: false, error: 'Authentication required' };
               break;
             }
             if (!requestData.recordId || requestData.updates === undefined) {
               result = { success: false, error: 'recordId and updates are required' };
               break;
             }
             const recordToUpdate = await getDataRecord(requestData.recordId);
             if (!recordToUpdate || recordToUpdate.userId !== userId) {
               result = { success: false, error: 'Access denied' };
             } else {
               result = { success: await updateDataRecord(requestData.recordId, requestData.updates) };
             }
             break;
             
           case 'deleteDataRecord':
             if (!userId) {
               result = { success: false, error: 'Authentication required' };
               break;
             }
             if (!requestData.recordId) {
               result = { success: false, error: 'recordId is required' };
               break;
             }
             const recordToDelete = await getDataRecord(requestData.recordId);
             if (!recordToDelete || recordToDelete.userId !== userId) {
               result = { success: false, error: 'Access denied' };
             } else {
               result = { success: await deleteDataRecord(requestData.recordId) };
             }
             break;
             
           case 'getDBStats':
             result = { success: true, stats: await getDBStats() };
             break;
             
           case 'cleanupExpiredSessions':
             await cleanupExpiredSessions();
             result = { success: true, message: 'Expired sessions cleaned up' };
             break;
             
          case 'bootstrap-admin':
            if (!requestData.userId || !requestData.role || !requestData.permissions) {
              result = { success: false, error: 'userId, role, and permissions are required' };
              break;
            }
            // Import the CMS admin functions
            const { createAdminUser } = await import('./cms/db.js');
            const adminCreated = await createAdminUser(
              requestData.userId, 
              requestData.role, 
              requestData.permissions
            );
            result = { success: adminCreated, message: adminCreated ? 'Admin user created' : 'Failed to create admin user' };
            break;
            
          default:
            result = { success: false, error: 'Invalid operation type' };
          }
          
          return new Response(JSON.stringify(result), {
            status: result.success ? 200 : 400,
            headers: corsHeaders
          });
        } catch (error) {
          console.error("DB endpoint error:", error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: "Invalid request body" 
          }), { 
            status: 400, 
            headers: corsHeaders 
          });
        }
      }
      
      // Default response for unknown endpoints
      logger.warn(`404 - Endpoint not found: ${req.method} ${url.pathname}`);
      return formatResponse(false, null, "Endpoint not found", 404, corsHeaders);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Server error on ${req.method} ${url.pathname}`, {
        error: error.message,
        stack: config.nodeEnv === 'development' ? error.stack : undefined,
        duration
      });
      
      const errorMessage = config.nodeEnv === 'development' ? error.message : "Internal server error";
      return formatResponse(false, null, errorMessage, 500, corsHeaders);
    } finally {
      // Log response time
      const duration = Date.now() - startTime;
      if (duration > 1000) {
        logger.warn(`Slow request: ${req.method} ${url.pathname} took ${duration}ms`);
      }
    }
  },
});

logger.info(`Server started successfully`, {
  port: server.port,
  environment: config.nodeEnv,
  corsOrigins: config.corsOrigins,
  endpoints: {
    health: `/health`,
    auth: `/auth`,
    cms: `/cms`,
    db: `/db`
  }
});

console.log(`🚀 Server running on http://localhost:${server.port}`);
console.log(`📊 Environment: ${config.nodeEnv}`);
console.log(`🔗 CORS Origins: ${config.corsOrigins.join(', ')}`);
console.log(`📝 Log Level: ${config.logLevel}`);