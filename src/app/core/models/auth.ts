
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface UserDto {
  name: string;
  email: string;
  token: string;
  refreshToken: string;
  refreshTokenExpiry: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
}

export interface ResetPasswordDto {
  email: string;
  otp: string;
  newPassword: string;
}

export interface EmailConfirmationDto {
  userId: string;
  token: string;
}

export type OtpPurpose = 'EmailConfirmation' | 'PasswordReset';