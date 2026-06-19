import type {
  ConfirmEmailVerificationDataDTO,
  ConfirmEmailVerificationResultDTO,
  EmailVerificationStateDTO,
  StartEmailVerificationDataDTO,
} from "@time-tracker/shared";
import { baseApi } from "../base";

class EmailVerificationService {
  getStatus() {
    return baseApi.get<EmailVerificationStateDTO>(
      `/api/email-verification/status`,
    );
  }

  start(data: StartEmailVerificationDataDTO) {
    return baseApi.post<EmailVerificationStateDTO>(
      `/api/email-verification/start`,
      { data },
    );
  }

  confirm(data: ConfirmEmailVerificationDataDTO) {
    return baseApi.post<ConfirmEmailVerificationResultDTO>(
      `/api/email-verification/confirm`,
      { data },
    );
  }

  resend() {
    return baseApi.post<EmailVerificationStateDTO>(
      `/api/email-verification/resend`,
    );
  }

  cancel() {
    return baseApi.post<EmailVerificationStateDTO>(
      `/api/email-verification/cancel`,
    );
  }
}

export const emailVerificationApiService = new EmailVerificationService();
