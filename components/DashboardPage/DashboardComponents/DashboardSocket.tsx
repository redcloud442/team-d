"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type NotificationData = {
  event: string;
  data: string;
};

const DISPLAY_TIME = 4000; // 4 seconds per notification

const DashboardSocket = () => {
  const [notificationQueue, setNotificationQueue] = useState<string[]>([]);
  const [currentNotification, setCurrentNotification] = useState<string | null>(
    null
  );
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<NodeJS.Timeout | null>(null);
  const displayTimeout = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = () => {
    const ws = new WebSocket("wss://api-access.digi-wealth.vip/ws");
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const payload: NotificationData = JSON.parse(event.data);
        if (payload.event === "deposit") {
          setNotificationQueue((prev) => [...prev, payload.data]);
        }
      } catch (_) {}
    };

    ws.onclose = () => {
      retryRef.current = setTimeout(() => connectWebSocket(), 3000);
    };

    ws.onerror = () => {
      ws.close(); // triggers onclose
    };
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      wsRef.current?.close();
      if (retryRef.current) clearTimeout(retryRef.current);
      if (displayTimeout.current) clearTimeout(displayTimeout.current);
    };
  }, []);

  // Handle display of queue
  useEffect(() => {
    if (!currentNotification && notificationQueue.length > 0) {
      const next = notificationQueue[0];
      setCurrentNotification(next);
      setNotificationQueue((prev) => prev.slice(1));

      displayTimeout.current = setTimeout(() => {
        setCurrentNotification(null);
      }, DISPLAY_TIME);
    }
  }, [currentNotification, notificationQueue]);

  return (
    <div className="px-6">
      <div className="flex gap-2 h-8 bg-[#0f172a] text-white px-3 py-1 rounded-md justify-center relative animate-fade-in-out">
        <Image
          src="/assets/icons/microphone.ico"
          alt="Deposit"
          width={40}
          height={40}
          className="absolute -left-4 -top-1"
        />
        {currentNotification && (
          <div className="flex items-center gap-1 text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-bg-primary-blue inline-block" />
            <span>{currentNotification}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSocket;
