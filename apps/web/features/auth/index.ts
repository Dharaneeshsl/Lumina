import { auth } from "@lumina/auth";

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

export async function signUp({
  name,
  email,
  password,
  rememberMe = true,
}: SignUpInput) {
  return auth.api.signUpEmail({
    body: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      rememberMe,
    },
  });
}

export async function signIn({
  email,
  password,
  rememberMe = true,
}: SignInInput) {
  return auth.api.signInEmail({
    body: { email, password, rememberMe },
  });
}