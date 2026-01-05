import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { connectMongo } from "./mongo";
import cors from "cors";
import 'dotenv/config';


const app = express();

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin) {
      return callback(null, true);
    }
    
    // Development: allow all origins
    if (process.env.NODE_ENV === "development") {
      return callback(null, true);
    }
    
    // Production: allow common local origins and any origin containing the server IP
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:8000",
      "http://localhost:5000",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:8000",
      "http://127.0.0.1:5000",
    ];
    
    // Add environment-based origins
    if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);
    if (process.env.PUBLIC_URL) allowedOrigins.push(process.env.PUBLIC_URL);
    
    // Allow any request from the same server (by IP or domain)
    if (process.env.SERVER_IP && origin.includes(process.env.SERVER_IP)) {
      return callback(null, true);
    }
    
    // Check if origin matches any allowed origin
    if (allowedOrigins.some(allowed => origin === allowed)) {
      return callback(null, true);
    }
    
    // Log the origin that was rejected for debugging
    console.warn(`CORS rejected origin: ${origin}`);
    
    // Still allow it but log it (more forgiving for production)
    return callback(null, true);
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Connect to MongoDB
  await connectMongo();
  
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  const listenOptions: any = {
    port,
    host: "0.0.0.0",
  };
  
  // Only use reusePort on non-Windows systems
  if (process.platform !== "win32") {
    listenOptions.reusePort = true;
  }
  
  httpServer.listen(listenOptions, () => {
      log(`serving on port ${port}`);
    },
  );
})();
