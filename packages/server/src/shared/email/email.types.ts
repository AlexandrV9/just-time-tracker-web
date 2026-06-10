export type SendVerificationCodeParams = {
  to: string;
  code: string;
};

export type EmailService = {
  sendVerificationCode: (params: SendVerificationCodeParams) => Promise<void>;
};
