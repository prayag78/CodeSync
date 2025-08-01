"use client";

import Editor, { OnMount } from "@monaco-editor/react";

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
  const handleEditorMount: OnMount = (editorInstance, monaco) => {
    monaco.editor.defineTheme("neonNightSoft", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "66fff0" }, // soft cyan
        { token: "comment", foreground: "77dd77", fontStyle: "italic" }, // muted neon green
        { token: "keyword", foreground: "da70d6", fontStyle: "bold" }, // soft magenta
        { token: "string", foreground: "ffea00" }, // toned-down yellow
        { token: "number", foreground: "ff8c42" }, // soft orange
        { token: "type", foreground: "7fdbff" },
        { token: "function", foreground: "66fff0" },
        { token: "variable", foreground: "ff69b4" }, // pink
      ],
      colors: {
        "editor.background": "#121212", // slightly brighter than pure black
        "editor.foreground": "#66fff0",
        "editorLineNumber.foreground": "#555",
        "editorCursor.foreground": "#66fff0",
        "editor.lineHighlightBackground": "#1a1a1a",
        "editor.selectionBackground": "#66fff033", // lighter alpha
        "editor.inactiveSelectionBackground": "#66fff022",
        "editorIndentGuide.activeBackground": "#da70d622",
        "editorIndentGuide.background": "#333",
      },
    });

    monaco.editor.setTheme("neonNightSoft");
  };

  return (
    <Editor
      height="1000px"
      language={language}
      value={code}
      theme="neonNightSoft"
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
  );
}
