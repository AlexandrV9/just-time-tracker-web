import type {
  DeletePushSubscriptionBodyDTO,
  PushSubscriptionBodyDTO,
} from "@time-tracker/shared";
import { baseApi } from "../base";

class PushApiService {
  registerSubscription(data: PushSubscriptionBodyDTO) {
    return baseApi.put<null>(`/api/push-subscriptions`, { data });
  }

  unregisterSubscription(data: DeletePushSubscriptionBodyDTO) {
    return baseApi.delete<null>(`/api/push-subscriptions`, { data });
  }
}

export const pushApiService = new PushApiService();
