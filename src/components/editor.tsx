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
  };

  return (
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
  );
}
