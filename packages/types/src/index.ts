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

