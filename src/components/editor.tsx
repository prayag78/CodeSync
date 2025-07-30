"use client";

import Editor, { OnMount } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import {
  emitCursorMove,
  emitCursorSelection,
  emitCursorVisibility,
} from "@/lib/socket-client";
import { useStore } from "@/hooks/store";
import CollaborativeCursor, {
  useCollaborativeCursors,
} from "./collaborative-cursor";
import { users } from "@/lib/constants";
import type { editor } from "monaco-editor";

interface CodeEditorProps {
  language: string;
  code: string;
  setCode: (val: string) => void;
}

export default function CodeEditor({
  language,
  code,
  setCode,
}: CodeEditorProps) {
  const { roomId } = useStore();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentUser] = useState(users[0]); // In a real app, this would come from auth
  const cursors = useCollaborativeCursors(roomId);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEditorMount: OnMount = (editorInstance, monaco) => {
    editorRef.current = editorInstance;

    monaco.editor.defineTheme("neonNight", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "00FFEA" }, // default text: neon cyan
        { token: "comment", foreground: "39FF14" }, // neon green
        { token: "keyword", foreground: "FF00FF", fontStyle: "bold" }, // neon magenta
        { token: "string", foreground: "FFFF00" }, // neon yellow
        { token: "number", foreground: "FF5F1F" }, // neon orange
        { token: "type", foreground: "00FFFF" },
        { token: "function", foreground: "00FFEA" },
        { token: "variable", foreground: "FF1493" }, // deep pink
      ],
      colors: {
        "editor.background": "#0f0f0f", // dark blackish background
        "editor.foreground": "#00FFEA",
        "editorLineNumber.foreground": "#444444",
        "editorCursor.foreground": "#00FFEA",
        "editor.lineHighlightBackground": "#111111",
        "editor.selectionBackground": "#00FFEA33",
        "editor.inactiveSelectionBackground": "#00FFEA22",
        "editorIndentGuide.activeBackground": "#FF00FF33",
        "editorIndentGuide.background": "#444444",
      },
    });

    monaco.editor.setTheme("neonNight");

    // Track cursor position changes
    editorInstance.onDidChangeCursorPosition((e) => {
      const position = e.position;

      try {
        // Get the editor's DOM element
        const editorDomNode = editorInstance.getDomNode();
        if (!editorDomNode || !containerRef.current) return;

        // Get the editor's viewport
        const viewport = editorDomNode.querySelector(
          ".monaco-editor .overflow-guard"
        ) as HTMLElement;
        if (!viewport) return;

        // Use Monaco's coordinate conversion
        const coordinates = editorInstance.getScrolledVisiblePosition(position);

        if (coordinates) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const viewportRect = viewport.getBoundingClientRect();

          // Calculate position relative to the container
          const cursorX =
            viewportRect.left + coordinates.left - containerRect.left;
          const cursorY =
            viewportRect.top + coordinates.top - containerRect.top;

          console.log("Cursor position calculation:", {
            line: position.lineNumber,
            column: position.column,
            coordinates,
            viewportRect,
            containerRect,
            calculatedPosition: { x: cursorX, y: cursorY },
          });

          emitCursorMove(
            roomId,
            { x: cursorX, y: cursorY },
            currentUser.id.toString(),
            {
              name: currentUser.name,
              color: currentUser.color,
              avatar: currentUser.avatar,
            }
          );
        }
      } catch (error) {
        console.error("Error calculating cursor position:", error);
      }
    });

    // Track selection changes
    editorInstance.onDidChangeCursorSelection((e) => {
      const selection = e.selection;

      emitCursorSelection(
        roomId,
        {
          startLineNumber: selection.startLineNumber,
          startColumn: selection.startColumn,
          endLineNumber: selection.endLineNumber,
          endColumn: selection.endColumn,
        },
        currentUser.id.toString(),
        {
          name: currentUser.name,
          color: currentUser.color,
          avatar: currentUser.avatar,
        }
      );
    });

    // Track when user starts/stops typing
    editorInstance.onDidChangeModelContent(() => {
      // Show cursor when typing
      emitCursorVisibility(roomId, true, currentUser.id.toString(), {
        name: currentUser.name,
        color: currentUser.color,
        avatar: currentUser.avatar,
      });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Hide cursor after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        emitCursorVisibility(roomId, false, currentUser.id.toString(), {
          name: currentUser.name,
          color: currentUser.color,
          avatar: currentUser.avatar,
        });
      }, 3000);
    });

    // Track focus/blur events
    editorInstance.onDidFocusEditorWidget(() => {
      emitCursorVisibility(roomId, true, currentUser.id.toString(), {
        name: currentUser.name,
        color: currentUser.color,
        avatar: currentUser.avatar,
      });
    });

    editorInstance.onDidBlurEditorWidget(() => {
      emitCursorVisibility(roomId, false, currentUser.id.toString(), {
        name: currentUser.name,
        color: currentUser.color,
        avatar: currentUser.avatar,
      });
    });

    // Track scroll events to update cursor positions
    editorInstance.onDidScrollChange(() => {
      // Re-emit current cursor position after scroll
      const position = editorInstance.getPosition();
      if (position) {
        try {
          const coordinates =
            editorInstance.getScrolledVisiblePosition(position);
          if (coordinates && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const cursorX = coordinates.left + containerRect.left;
            const cursorY = coordinates.top + containerRect.top;

            emitCursorMove(
              roomId,
              { x: cursorX, y: cursorY },
              currentUser.id.toString(),
              {
                name: currentUser.name,
                color: currentUser.color,
                avatar: currentUser.avatar,
              }
            );
          }
        } catch (error) {
          console.error("Error calculating cursor position on scroll:", error);
        }
      }
    });
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Editor
        height="1000px"
        language={language}
        value={code}
        theme="neonNight"
        defaultValue="// Write your neon code here..."
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          automaticLayout: true,
        }}
        onChange={(value) => setCode(value || "")}
        onMount={handleEditorMount}
      />

      {/* Render collaborative cursors */}
      {Array.from(cursors.entries()).map(([socketId, cursor]) => {
        // Only render if we have all required data
        if (!cursor.position || !cursor.userInfo || !cursor.isVisible) {
          return null;
        }

        return (
          <CollaborativeCursor
            key={socketId}
            socketId={socketId}
            position={cursor.position}
            selection={cursor.selection}
            userId={cursor.userId}
            userInfo={cursor.userInfo}
            isVisible={cursor.isVisible}
          />
        );
      })}
    </div>
  );
}
