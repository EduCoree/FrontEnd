

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
export interface RegisterResponseDto {
  email: string;
  message: string;
  requiresVerification: boolean;
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
  purpose:OtpPurpose
}

export interface ResetPasswordDto {
  email: string;
  resetToken: string;
  newPassword: string;
  confirmPassword:string
}

export interface EmailConfirmationDto {
  userId: string;
  token: string;
}
export interface ResendEmailDto {
  email: string;
}
export interface SendOtpDto {
  email: string;
  purpose:OtpPurpose
}
export interface VerifyOtpResponseDto
  { 
     message:string,
     resetToken?:string,
     expiresInSeconds?:number,
     confirmedEmail?:string
  }
export type OtpPurpose = 'Email' | 'Password';