import { serve } from "bun";
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
  port: 3001,
  async fetch(req) {
    const url = new URL(req.url);
    
    // Set CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
        return new Response(JSON.stringify({
          status: "healthy",
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        }), {
          headers: corsHeaders
        });
      }
      
      // Authentication endpoint
      if (url.pathname === "/auth") {
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
          
          if (!type || !['login', 'logout', 'signup', 'delete', 'otp'].includes(type)) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: "Invalid operation type" 
            }), { 
              status: 400, 
              headers: corsHeaders 
            });
          }
          
          // Extract token from Authorization header for operations that need it
          let token: string | undefined;
          const authHeader = req.headers.get("Authorization");
          if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
          }
          
          const result = await handleAuth(type as AuthOperation, requestData, token);
          
          return new Response(JSON.stringify(result), {
            status: result.success ? 200 : 400,
            headers: corsHeaders
          });
        } catch (error) {
          console.error("Auth endpoint error:", error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: "Invalid request body" 
          }), { 
            status: 400, 
            headers: corsHeaders 
          });
        }
      }
      
      // CMS endpoint
      if (url.pathname === "/cms") {
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
          const { operation, ...requestData } = body;
          
          if (!operation) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: "Operation is required" 
            }), { 
              status: 400, 
              headers: corsHeaders 
            });
          }
          
          // Extract token for authentication
          let token: string | undefined;
          const authHeader = req.headers.get("Authorization");
          if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
          }
          
          const result = await handleCMSOperation(operation as CMSOperation, requestData, token);
          
          return new Response(JSON.stringify(result), {
            status: result.success ? 200 : 400,
            headers: corsHeaders
          });
        } catch (error) {
          console.error("CMS endpoint error:", error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: "Invalid request body" 
          }), { 
            status: 400, 
            headers: corsHeaders 
          });
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
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Endpoint not found" 
      }), { 
        status: 404, 
        headers: corsHeaders 
      });
      
    } catch (error) {
      console.error("Server error:", error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Internal server error" 
      }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }
  },
});

console.log(`Server running on http://localhost:${server.port}`);
console.log(`Health endpoint available at http://localhost:${server.port}/health`);
console.log(`Auth endpoint available at http://localhost:${server.port}/auth`);
console.log(`CMS endpoint available at http://localhost:${server.port}/cms`);
console.log(`Database endpoint available at http://localhost:${server.port}/db`);