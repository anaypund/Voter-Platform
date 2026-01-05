import { z } from "zod";
import { voterSchema, insertConfigSchema, userSchema } from "./schema";

export const api = {
  voters: {
    search: {
      method: "GET" as const,
      path: "/api/voters/search",
      input: z.object({
        type: z.enum(["epic", "name"]),
        query: z.string(),
        subQuery: z.string().optional(),
      }),
      responses: {
        200: z.array(voterSchema),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/voters/:id",
      responses: {
        200: voterSchema,
        404: z.object({ message: z.string() }),
      },
    },
    printSlip: {
      method: "POST" as const,
      path: "/api/voters/:id/print",
      responses: {
        200: z.any(), // PDF Stream
      },
    },
  },
  config: {
    get: {
      method: "GET" as const,
      path: "/api/config",
      responses: {
        200: insertConfigSchema,
      },
    },
    update: {
      method: "POST" as const,
      path: "/api/config",
      input: insertConfigSchema,
      responses: {
        200: insertConfigSchema,
      },
    },
  },
  auth: {
    me: {
      method: "GET" as const,
      path: "/api/auth/user",
      responses: {
        200: userSchema.nullable(),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
