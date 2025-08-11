import { serve } from "bun";

const server = serve({
  port: 3001,
  fetch(req) {
    const url = new URL(req.url);
    
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }), {
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running on http://localhost:${server.port}`);
console.log(`Health endpoint available at http://localhost:${server.port}/health`);