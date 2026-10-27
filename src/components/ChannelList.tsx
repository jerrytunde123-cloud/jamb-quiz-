// src/components/ChannelList.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { Channel } from "@/lib/constants";

interface ChannelListProps {
  channels: Channel[];
  onJoin: (channelId: string) => void;
}

export function ChannelList({ channels, onJoin }: ChannelListProps) {
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState<Record<string, number>>({});
  const timers = useRef<Record<string, ReturnType<typeof setInterval>>>({});
  const pendingChannels = useRef<Set<string>>(new Set());

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach((iv) => clearInterval(iv));
    };
  }, []);

  // Handle iOS/Android returning from the app
  useEffect(() => {
    function completePending() {
      pendingChannels.current.forEach((chId) => {
        const iv = timers.current[chId];
        if (iv) {
          clearInterval(iv);
          delete timers.current[chId];
        }
        setSecondsLeft((prev) => ({ ...prev, [chId]: 0 }));
        setJoined((prev) => ({ ...prev, [chId]: true }));
        onJoin(chId); // Notify parent hook
      });
      pendingChannels.current.clear();
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") completePending();
    };
    
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    window.addEventListener("pageshow", onVisible);
    
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.removeEventListener("pageshow", onVisible);
    };
  }, [onJoin]);

  const handleChannelClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    channelId: string,
    deepLink: string,
    webFallback: string
  ) => {
    if (joined[channelId] || timers.current[channelId]) return;

    e.preventDefault(); // Stop standard navigation

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      // THE MAGIC: Use a hidden iframe to open the app without leaving the page
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = deepLink;
      document.body.appendChild(iframe);

      const fallbackTimer = setTimeout(() => {
        // If app doesn't open in 1.2s, open the web version in a new tab
        window.open(webFallback, "_blank", "noopener,noreferrer");
      }, 1200);

      const cleanup = () => {
        clearTimeout(fallbackTimer);
        try { document.body.removeChild(iframe); } catch {}
      };

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) clearTimeout(fallbackTimer); // App opened
      }, { once: true });

      setTimeout(cleanup, 2000);
    } else {
      // Desktop: Just open a new tab
      window.open(webFallback, "_blank", "noopener,noreferrer");
    }

    // Start the 5-second unlock timer
    pendingChannels.current.add(channelId);
    let sec = 5;
    setSecondsLeft((prev) => ({ ...prev, [channelId]: sec }));

    const iv = setInterval(() => {
      sec--;
      if (sec <= 0) {
        clearInterval(iv);
        delete timers.current[channelId];
        pendingChannels.current.delete(channelId);
        setSecondsLeft((prev) => ({ ...prev, [channelId]: 0 }));
        setJoined((prev) => ({ ...prev, [channelId]: true }));
        onJoin(channelId); // Notify parent hook
      } else {
        setSecondsLeft((prev) => ({ ...prev, [channelId]: sec }));
      }
    }, 1000);

    timers.current[channelId] = iv;
  };

  return (
    <>
      {channels.map((c) => {
        const isDone = joined[c.id];
        const sec = secondsLeft[c.id];
        
        return (
          <a
            key={c.id}
            id={c.id + "Btn"}
            className={`btn-wa ${isDone ? "done" : ""}`}
            href={c.href} // Fallback if JS fails
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => handleChannelClick(e, c.id, c.href, c.webUrl || c.href)}
          >
            <i className={c.icon} />
            <span>{c.label}</span>
            {typeof sec === "number" && sec > 0 ? (
              <span className="ch-timer">{sec}s</span>
            ) : isDone ? (
              <span className="ch-timer">✓</span>
            ) : null}
          </a>
        );
      })}
    </>
  );
}
