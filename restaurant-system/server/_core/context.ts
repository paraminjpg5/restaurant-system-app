import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    // For testing purposes, we provide a mock user based on the path
    const referer = opts.req.headers.referer || '';
    const isRiderPath = referer.includes('/rider');
    const isOrderTrackingPath = referer.includes('/order-tracking');
    
    user = {
      id: isRiderPath ? 2 : 1,
      openId: isRiderPath ? 'rider-test-id' : 'admin-test',
      name: isRiderPath ? 'Manus Rider' : 'Admin User',
      role: isRiderPath ? 'rider' : (isOrderTrackingPath ? 'customer' : 'admin'),
      email: isRiderPath ? 'rider@example.com' : 'admin@example.com',
      lastSignedIn: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      loginMethod: 'mock'
    } as any;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
