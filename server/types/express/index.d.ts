import "express";
import { User } from "@shared/models/auth";

declare global {
  namespace Express {
    interface User extends User {}
  }
}
