"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import {
  Play,
  Users,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Sun,
  Moon,
  Share2,
  GripHorizontal,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import CodeEditor from "@/components/editor";

// Language starter templates
const starterCode = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  javascript: `// Welcome to the collaborative editor
console.log("Hello, World!");

function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("CodeChef"));`,
  typescript: `// TypeScript collaborative coding
interface User {
    name: string;
    id: number;
}

const user: User = {
    name: "Developer",
    id: 1
};

console.log(\`Hello, \${user.name}!\`);`,
  python: `# Python collaborative coding
def greet(name: str) -> str:
    return f"Hello, {name}!"

def main():
    print("Hello, World!")
    print(greet("CodeChef"))

if __name__ == "__main__":
    main()`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        String name = "CodeChef";
        System.out.println("Hello, " + name + "!");
    }
}`,
  c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    
    char name[] = "CodeChef";
    printf("Hello, %s!\\n", name);
    
    return 0;
}`,
  rust: `fn main() {
    println!("Hello, World!");
    
    let name = "CodeChef";
    println!("Hello, {}!", name);
}`,
  go: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
    
    name := "CodeChef"
    fmt.Printf("Hello, %s!\\n", name)
}`,
};

// Simulated users for collaboration
const users = [
  {
    id: 1,
    name: "Alex Chen",
    avatar: "/placeholder.svg?height=32&width=32",
    color: "bg-blue-500",
    cursorColor: "border-blue-500",
  },
  {
    id: 2,
    name: "Sarah Kim",
    avatar: "/placeholder.svg?height=32&width=32",
    color: "bg-purple-500",
    cursorColor: "border-purple-500",
  },
];

// Horizontal Resizable Divider Component (for editor/panels split)
function HorizontalResizableDivider({
  onResize,
}: {
  onResize: (deltaX: number) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    document.body.style.userSelect = "none"; // Prevent text selection
    const startX = e.clientX;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      onResize(deltaX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = ""; // Restore text selection
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className={`relative w-2 cursor-col-resize group ${"bg-slate-800 hover:bg-slate-700"} transition-colors ${
        isDragging ? "bg-blue-500" : ""
      }`}
      onMouseDown={handleMouseDown}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <GripVertical
          className={`w-4 h-4 ${"text-slate-600 group-hover:text-slate-400"} transition-colors ${
            isDragging ? "text-blue-300" : ""
          }`}
        />
      </div>
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500 opacity-20 animate-pulse" />
      )}
    </div>
  );
}

// Vertical Resizable Divider Component (for input/output split)
function VerticalResizableDivider({
  onResize,
}: {
  onResize: (deltaY: number) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    document.body.style.userSelect = "none"; // Prevent text selection
    const startY = e.clientY;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;
      onResize(deltaY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = ""; // Restore text selection
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className={`relative h-2 cursor-row-resize group ${"bg-slate-800 hover:bg-slate-700"} transition-colors ${
        isDragging ? "bg-blue-500" : ""
      }`}
      onMouseDown={handleMouseDown}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <GripHorizontal
          className={`w-4 h-4 ${"text-slate-600 group-hover:text-slate-400"} transition-colors ${
            isDragging ? "text-blue-300" : ""
          }`}
        />
      </div>
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500 opacity-20 animate-pulse" />
      )}
    </div>
  );
}

// Draggable Video Call Component with Smooth Movement
function VideoCallWindow() {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = dragRef.current?.getBoundingClientRect();
    if (rect) {
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      setDragOffset({ x: offsetX, y: offsetY });

      const handleMouseMove = (e: MouseEvent) => {
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;

        // Constrain to viewport
        const maxX = window.innerWidth - (isMinimized ? 200 : 280);
        const maxY = window.innerHeight - (isMinimized ? 60 : 200);

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
  };

  return (
    <div
      ref={dragRef}
      className={`fixed z-50 ${"bg-slate-800"} rounded-lg shadow-2xl border ${"border-slate-700"} overflow-hidden select-none ${
        isDragging
          ? "transition-none cursor-grabbing scale-105"
          : "transition-all duration-200 ease-out cursor-grab"
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: isMinimized ? "200px" : "280px",
        height: isMinimized ? "60px" : "200px",
        transform: isDragging ? "rotate(2deg)" : "rotate(0deg)",
      }}
    >
      <div
        className={`p-2 ${"bg-slate-700"} border-b ${"border-slate-600"} flex items-center justify-between cursor-grab active:cursor-grabbing`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-green-500" />
          <span className={`text-sm font-medium text-white`}>Video Call</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMinimized(!isMinimized)}
          className="h-6 w-6 p-0"
        >
          <span className="text-xs">{isMinimized ? "□" : "−"}</span>
        </Button>
      </div>

      {!isMinimized && (
        <>
          <div className="relative h-32 bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-1 w-full h-full p-2">
              <div className="bg-slate-700 rounded flex items-center justify-center relative overflow-hidden">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={users[0].avatar || "/placeholder.svg"} />
                  <AvatarFallback>AC</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-1 left-1 text-xs text-white bg-black bg-opacity-50 px-1 rounded">
                  You
                </div>
              </div>
              <div className="bg-slate-700 rounded flex items-center justify-center relative overflow-hidden">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={users[1].avatar || "/placeholder.svg"} />
                  <AvatarFallback>SK</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-1 left-1 text-xs text-white bg-black bg-opacity-50 px-1 rounded">
                  Sarah
                </div>
              </div>
            </div>
          </div>

          <div className={`p-2 bg-slate-800 flex justify-center gap-2`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMicOn(!isMicOn)}
              className={`h-8 w-8 p-0 transition-colors ${
                isMicOn
                  ? "text-green-500 hover:bg-green-500/10"
                  : "text-red-500 hover:bg-red-500/10"
              }`}
            >
              {isMicOn ? (
                <Mic className="w-4 h-4" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`h-8 w-8 p-0 transition-colors ${
                isVideoOn
                  ? "text-green-500 hover:bg-green-500/10"
                  : "text-red-500 hover:bg-red-500/10"
              }`}
            >
              {isVideoOn ? (
                <Video className="w-4 h-4" />
              ) : (
                <VideoOff className="w-4 h-4" />
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// Collaborative Cursor Component
function CollaborativeCursor({
  user,
  position,
}: {
  user: (typeof users)[0];
  position: { x: number; y: number };
}) {
  return (
    <div
      className="absolute pointer-events-none z-40 transition-all duration-100"
      style={{ left: position.x, top: position.y }}
    >
      <div
        className={`w-0.5 h-5 ${user.cursorColor} border-l-2 animate-pulse`}
      />
      <div
        className={`${user.color} text-white text-xs px-2 py-1 rounded-md mt-1 whitespace-nowrap shadow-lg`}
      >
        {user.name}
      </div>
    </div>
  );
}

export default function CollaborativeCodeEditor() {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(starterCode.javascript);
  const [isRunning, setIsRunning] = useState(false);
  const [inputHeight, setInputHeight] = useState(50); // Percentage of the right panel height
  const [editorWidth, setEditorWidth] = useState(70); // Percentage of the main container width
  const [inputValue, setInputValue] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    setCode(starterCode[language as keyof typeof starterCode]);
  };

  const runCode = async () => {
    setLoading(true);
    setOutput("");
    setIsRunning(true);

    try {
      const res = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: selectedLanguage,
          version: "*",
          files: [{ name: "main", content: code }],
          stdin: inputValue,
        }),
      });

      const data = await res.json();
      console.log("Full response:", data);

      if (!data.run) {
        setOutput(data.message || "Execution failed.");
        return;
      }

      const result =
        data.run.output || data.run.stdout || data.run.stderr || "No output";
      const time = data.run.time;
      const memory = data.run.memory;

      console.log("Execution time:", time);
      console.log("Memory used:", memory);

      setOutput(result);
    } catch (err) {
      setOutput("Error executing code: " + err);
    }
    setIsRunning(false);
    setLoading(false);
  };

  const handleVerticalResize = (deltaY: number) => {
    const containerHeight = window.innerHeight - 80; // Subtract header height
    const deltaPercentage = (deltaY / containerHeight) * 100;
    const newInputHeight = Math.max(
      20,
      Math.min(80, inputHeight + deltaPercentage)
    );
    setInputHeight(newInputHeight);
  };

  const handleHorizontalResize = (deltaX: number) => {
    const containerWidth = window.innerWidth;
    const deltaPercentage = (deltaX / containerWidth) * 100;
    const newEditorWidth = Math.max(
      30,
      Math.min(85, editorWidth + deltaPercentage)
    );
    setEditorWidth(newEditorWidth);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 bg-slate-950`}>
      {/* Header */}
      <header className={`border-b  bg-slate-900 border-slate-800 px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className={`text-xl font-bold text-white`}>CodeSync</h1>

            {/* Active Users */}
            <div className="flex items-center gap-2">
              <Users className={`w-4 h-4 text-gray-400`} />
              <div className="flex -space-x-2">
                {users.map((user) => (
                  <Avatar
                    key={user.id}
                    className="w-8 h-8 border-2 border-white"
                  >
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className={user.color}>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <Badge variant="secondary" className="ml-2">
                2 online
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <Select
              value={selectedLanguage}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger className={`w-40 bg-slate-800 border-slate-700`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="c">C</SelectItem>
                <SelectItem value="rust">Rust</SelectItem>
                <SelectItem value="go">Go</SelectItem>
              </SelectContent>
            </Select>

            {/* Run Button */}
            <Button
              onClick={runCode}
              disabled={isRunning}
              className="bg-green-600 hover:bg-green-700 text-white px-6"
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunning ? "Running..." : "Run"}
            </Button>

            {/* Share Button */}
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Code Editor Section */}
        <div
          className="flex flex-col min-w-0"
          style={{ width: `${editorWidth}%` }}
        >
          <div
            className={`border-b border-slate-800 bg-slate-900 px-4 py-2 flex items-center justify-between`}
          >
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium text-gray-300`}>
                {selectedLanguage}
              </span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />

              <span className={`text-xs text-gray-400`}>
                {code.split("\n").length} lines
              </span>
            </div>
          </div>

          <CodeEditor
            code={code}
            language={selectedLanguage}
            setCode={setCode}
          />
        </div>

        {/* Horizontal Resizable Divider */}
        <HorizontalResizableDivider onResize={handleHorizontalResize} />

        {/* Resizable Input and Output Panels */}
        <div
          className={`border-l border-slate-800 bg-slate-900 flex flex-col min-w-0`}
          style={{ width: `${100 - editorWidth}%` }}
        >
          {/* Input Panel */}
          <div
            className="flex flex-col min-h-0"
            style={{ height: `${inputHeight}%` }}
          >
            <div
              className={`border-b border-slate-800 px-4 py-3 flex items-center justify-between`}
            >
              <h3 className={`font-medium text-white`}>Input</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-white bg-gray-500"
                  onClick={() => setInputValue("")}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="flex-1 p-4 min-h-0">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter input for your program here..."
                className={`w-full h-full resize-none border rounded-md p-3 text-sm font-mono ${"bg-slate-800 border-slate-700 text-gray-100 placeholder-gray-500"} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                style={{
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  lineHeight: "1.4",
                }}
              />
            </div>
          </div>

          {/* Vertical Resizable Divider */}
          <VerticalResizableDivider onResize={handleVerticalResize} />

          {/* Output Panel */}
          <div
            className="flex flex-col min-h-0"
            style={{ height: `${100 - inputHeight}%` }}
          >
            <div
              className={`border-b border-slate-800 px-4 py-3 flex items-center justify-between`}
            >
              <h3 className={`font-medium text-white`}>Output</h3>
            </div>

            <div className="flex-1 p-4 overflow-auto min-h-0 ">
              <div className="bg-slate-800 border-slate-700 text-gray-100 placeholder-gray-500 rounded-md p-3 h-full">
                {isRunning ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    <span className={`text-sm ${"text-gray-400"}`}>
                      Executing code...
                    </span>
                  </div>
                ) : (
                  <div className={`font-mono text-sm ${"text-gray-100"}`}>
                    <div>{output}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Draggable Video Call Window */}
      {/* <VideoCallWindow /> */}
    </div>
  );
}
