import type { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignInInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface UsernameParams {
  username: string;
}

export interface UploadFileOptions {
  buffer: Buffer;
  mimeType: string;
  folder: string;
  fileName?: string;
}

