"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getSocket } from "@/lib/socket-client";

interface CursorPosition {
  x: number;
  y: number;
}

interface CursorSelection {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

interface UserInfo {
  name: string;
  color: string;
  avatar?: string;
}

interface CursorData {
  position?: CursorPosition;
  selection?: CursorSelection;
  userId: string;
  userInfo: UserInfo;
  isVisible: boolean;
  lastUpdate: number;
}

interface CollaborativeCursorProps {
  socketId: string;
  position?: CursorPosition;
  selection?: CursorSelection;
  userId: string;
  userInfo: UserInfo;
  isVisible: boolean;
}

// Generate a random color for each user
const generateRandomColor = (userId: string): string => {
  // Use userId to generate consistent colors for the same user
  const colors = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#45B7D1", // Blue
    "#96CEB4", // Green
    "#FFEAA7", // Yellow
    "#DDA0DD", // Plum
    "#98D8C8", // Mint
    "#F7DC6F", // Gold
    "#BB8FCE", // Purple
    "#85C1E9", // Light Blue
    "#F8C471", // Orange
    "#82E0AA", // Light Green
    "#F1948A", // Salmon
    "#85C1E9", // Sky Blue
    "#FAD7A0", // Peach
  ];

  // Use userId to consistently pick a color
  const hash = userId.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

export default function CollaborativeCursor({position, userId, userInfo, isVisible}: CollaborativeCursorProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [debouncedPosition, setDebouncedPosition] = useState(position);
  const [cursorColor] = useState(() => generateRandomColor(userId));

  // Debounce position updates to prevent flickering
  useEffect(() => {
    if (position) {
      const timeoutId = setTimeout(() => {
        setDebouncedPosition(position);
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [position]);

  // Don't render if not visible or no position
  if (!isVisible || !position || !debouncedPosition) return null;

  // Get user's first letter for the icon
  const userInitial = userInfo.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div
      ref={cursorRef}
      className="absolute pointer-events-none z-50 transition-all duration-150 ease-out"
      style={{
        left: debouncedPosition.x,
        top: debouncedPosition.y,
        transform: "translate(-50%, -50%)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Arrow cursor with user icon */}
      <div className="relative">
        {/* Arrow cursor */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          className="drop-shadow-lg"
          style={{
            filter: `drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))`,
            transform: "translate(8px, 15px) rotate(45deg)",
          }}
        >
          {/* Arrow shape - pointing up-left */}
          <path
            d="M22 22 L2 12 L22 2 L16 12 Z"
            fill={cursorColor}
            stroke="white"
            strokeWidth="1.5"
          />

          {/* Alternative arrow directions - uncomment the one you want: */}

          {/* // Pointing DOWN (default cursor style)
          d="M2 2 L12 22 L22 2 L12 8 Z"
          
          // Pointing UP */}
          {/* d="M2 22 L12 2 L22 22 L12 16 Z"
          
          // Pointing LEFT */}
          {/* d="M22 2 L2 12 L22 22 L16 12 Z"
          
          // Pointing RIGHT (current) */}
          {/* d="M2 2 L22 12 L2 22 L8 12 Z"
          
          // Pointing DOWN-RIGHT (diagonal) */}
          {/* d="M2 2 L18 18 L2 18 L8 12 Z"
          
          // Pointing UP-RIGHT (diagonal) */}
          {/* d="M2 18 L18 2 L2 2 L8 8 Z" */}
        </svg>

        {/* Glow effect */}
        <div
          className="absolute inset-0 w-4 h-4 rounded-full opacity-30 animate-pulse"
          style={{
            backgroundColor: cursorColor,
            filter: "blur(4px)",
            transform: "translate(8px, 15px)",
          }}
        />
      </div>

      {/* User info tooltip */}
      {isHovered && (
        <div
          className="absolute top-6 left-0 bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-2 flex items-center gap-2 min-w-max"
          style={{ zIndex: 1000 }}
        >
          <Avatar className="w-6 h-6">
            <AvatarImage src={userInfo.avatar || "/placeholder.svg"} />
            <AvatarFallback
              className="text-xs"
              style={{ backgroundColor: cursorColor }}
            >
              {userInitial}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-white">
              {userInfo.name}
            </span>
            <Badge
              variant="secondary"
              className="text-xs"
              style={{
                backgroundColor: cursorColor + "20",
                color: cursorColor,
              }}
            >
              {userId}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook to manage collaborative cursors
export function useCollaborativeCursors(roomId: string) {
  const [cursors, setCursors] = useState<Map<string, CursorData>>(new Map());

  const updateCursor = useCallback(
    (socketId: string, updates: Partial<CursorData>) => {
      setCursors((prev) => {
        const newCursors = new Map(prev);
        const existing = newCursors.get(socketId) || ({} as CursorData);
        newCursors.set(socketId, {
          ...existing,
          ...updates,
          lastUpdate: Date.now(),
        });
        return newCursors;
      });
    },
    []
  );

  const removeCursor = useCallback((socketId: string) => {
    setCursors((prev) => {
      const newCursors = new Map(prev);
      newCursors.delete(socketId);
      return newCursors;
    });
  }, []);

  useEffect(() => {
    const socket = getSocket();

    const handleCursorMove = ({
      socketId,
      position,
      userId,
      userInfo,
    }: {
      socketId: string;
      position: CursorPosition;
      userId: string;
      userInfo: UserInfo;
    }) => {
      updateCursor(socketId, {
        position,
        userId,
        userInfo,
        isVisible: true,
      });
    };

    const handleCursorSelection = ({
      socketId,
      selection,
      userId,
      userInfo,
    }: {
      socketId: string;
      selection: CursorSelection;
      userId: string;
      userInfo: UserInfo;
    }) => {
      updateCursor(socketId, {
        selection,
        userId,
        userInfo,
        isVisible: true,
      });
    };

    const handleCursorVisibility = ({
      socketId,
      isVisible,
      userId,
      userInfo,
    }: {
      socketId: string;
      isVisible: boolean;
      userId: string;
      userInfo: UserInfo;
    }) => {
      if (isVisible) {
        updateCursor(socketId, {
          isVisible: true,
          userId,
          userInfo,
        });
      } else {
        removeCursor(socketId);
      }
    };

    const handleUserLeft = ({ socketId }: { socketId: string }) => {
      removeCursor(socketId);
    };

    // Clean up stale cursors (older than 10 seconds)
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setCursors((prev) => {
        const newCursors = new Map(prev);
        for (const [socketId, cursor] of newCursors.entries()) {
          if (now - cursor.lastUpdate > 10000) {
            newCursors.delete(socketId);
          }
        }
        return newCursors;
      });
    }, 5000);

    socket.on("cursor-move", handleCursorMove);
    socket.on("cursor-selection", handleCursorSelection);
    socket.on("cursor-visibility", handleCursorVisibility);
    socket.on("user-left", handleUserLeft);

    return () => {
      socket.off("cursor-move", handleCursorMove);
      socket.off("cursor-selection", handleCursorSelection);
      socket.off("cursor-visibility", handleCursorVisibility);
      socket.off("user-left", handleUserLeft);
      clearInterval(cleanupInterval);
    };
  }, [roomId, updateCursor, removeCursor]);

  return cursors;
}
