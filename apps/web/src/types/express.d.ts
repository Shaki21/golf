import { SubscriptionTier } from "../domain/subscription";

declare global {
  namespace Express {
    interface User {
      id: string;
      subscriptionTier: string;
    }
    interface Request {
      user: User;
    }
  }
}

export {};
