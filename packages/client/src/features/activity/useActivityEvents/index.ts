import { useQueryClient } from "@tanstack/react-query";
import { activityTrackingEventSchema } from "@to-do-list/shared";
import { useCallback, useEffect, useRef } from "react";
import { useAuthStore } from "~/features/auth";
import { ACCESS_TOKEN_KEY } from "~/shared/constants";
import {
  getCalendarDay,
  getDateIntervalByCalendarDay,
  getOrCreateClientId,
} from "~/shared/libs";
import { useCurrentActivityStore } from "../useCurrentActivity/useCurrentActivityStore";
import { fetchCurrentActivityData } from "../useCurrentActivity/utils";
import { applyRemoteActivityTrackingEvent } from "./applyRemoteActivityTrackingEvent";
import {
  invalidateActivityTrackingQueries,
  invalidateAllActivityTrackingQueries,
} from "./invalidateActivityTrackingQueries";
import { parseSseStream } from "./parseSseStream";
import { useShallow } from "zustand/react/shallow";

const SSE_URL = "/api/activities/events";
const MAX_RECONNECT_DELAY_MS = 30_000;

export function useActivityEvents() {
  const queryClient = useQueryClient();

  const { status, userId } = useAuthStore(
    useShallow((state) => ({ status: state.status, userId: state.user?.id })),
  );
  const updateData = useCurrentActivityStore((state) => state.updateData);

  const reconnectAttemptRef = useRef(0);
  const hadConnectionRef = useRef(false);
  const isConnectingRef = useRef(false);

  const syncCurrentActivityFromServer = useCallback(async () => {
    if (!userId) return;

    const calendarDay = getCalendarDay();
    const { fromDate, toDate } = getDateIntervalByCalendarDay(calendarDay);

    try {
      const result = await fetchCurrentActivityData({
        fromDate,
        toDate,
      });
      updateData({
        currentActivity: result.activity,
        currentSession: result.session,
        currentSegment: result.segment,
      });
    } catch (error) {
      console.error(
        "Failed to sync current activity after SSE reconnect:",
        error,
      );
    }
  }, [userId, updateData]);

  const handleRemoteEvent = useCallback(
    (eventType: string, rawData: string) => {
      if (eventType === "ping" || !rawData) return;

      let parsed: unknown;
      try {
        parsed = JSON.parse(rawData);
      } catch {
        console.error("Invalid SSE activity event payload");
        syncCurrentActivityFromServer();
        invalidateAllActivityTrackingQueries(queryClient);
        return;
      }

      const result = activityTrackingEventSchema.safeParse(parsed);
      if (!result.success) {
        console.error("SSE activity event validation failed", result.error);
        syncCurrentActivityFromServer();
        invalidateAllActivityTrackingQueries(queryClient);
        return;
      }

      const event = result.data;
      if (event.clientId === getOrCreateClientId()) return;

      applyRemoteActivityTrackingEvent(event, updateData);
      invalidateActivityTrackingQueries(queryClient, event.type);
    },
    [queryClient, syncCurrentActivityFromServer, updateData],
  );

  useEffect(() => {
    if (status !== "AUTHENTICATED" || !userId) return;

    const abortController = new AbortController();
    let reconnectTimeoutId: ReturnType<typeof setTimeout> | undefined;

    const scheduleReconnect = () => {
      if (abortController.signal.aborted) return;

      const delay = Math.min(
        1000 * 2 ** reconnectAttemptRef.current,
        MAX_RECONNECT_DELAY_MS,
      );
      reconnectAttemptRef.current += 1;

      reconnectTimeoutId = setTimeout(() => {
        connect();
      }, delay);
    };

    const connect = async () => {
      if (isConnectingRef.current || abortController.signal.aborted) return;

      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) return;

      isConnectingRef.current = true;

      try {
        const response = await fetch(SSE_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
            "Cache-Control": "no-cache",
          },
          signal: abortController.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`SSE connection failed: ${response.status}`);
        }

        reconnectAttemptRef.current = 0;
        hadConnectionRef.current = true;

        await parseSseStream(
          response,
          handleRemoteEvent,
          abortController.signal,
        );
      } catch (error) {
        if (abortController.signal.aborted) return;
        console.error("Activity SSE connection error:", error);
        if (hadConnectionRef.current) {
          await syncCurrentActivityFromServer();
        }
        scheduleReconnect();
        return;
      } finally {
        isConnectingRef.current = false;
      }

      if (!abortController.signal.aborted) {
        if (hadConnectionRef.current) {
          await syncCurrentActivityFromServer();
        }
        scheduleReconnect();
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncCurrentActivityFromServer();
      }
    };

    connect();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      abortController.abort();
      hadConnectionRef.current = false;
      isConnectingRef.current = false;
      if (reconnectTimeoutId) clearTimeout(reconnectTimeoutId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [status, userId, handleRemoteEvent, syncCurrentActivityFromServer]);
}
