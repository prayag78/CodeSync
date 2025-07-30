"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Play,
  Users,
  Share2,
  GripHorizontal,
  GripVertical,
  Copy,
  Phone,
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
import VideoCall from "@/components/video-call";
import { useStore } from "@/hooks/store";
import { getSocket } from "@/lib/socket-client";
import { starterCode, users } from "@/lib/constants";

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

export default function CollaborativeCodeEditor() {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(starterCode.javascript);
  const [isRunning, setIsRunning] = useState(false);
  const [inputHeight, setInputHeight] = useState(50); // Percentage of the right panel height
  const [editorWidth, setEditorWidth] = useState(70); // Percentage of the main container width
  const [inputValue, setInputValue] = useState("");
  const [output, setOutput] = useState("");
  const [isVideoCallVisible, setIsVideoCallVisible] = useState(false);
  const { roomId } = useStore();

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      // You could add a toast notification here
      console.log("Room ID copied to clipboard");
    } catch (err) {
      console.error("Failed to copy room ID:", err);
    }
  };

  const handleLanguageChange = (language: string) => {
    const socket = getSocket();
    socket.emit("change-language", { language, roomId });

    // Safely update current user’s view
    if (starterCode.hasOwnProperty(language)) {
      setSelectedLanguage(language);
      setCode(starterCode[language as keyof typeof starterCode]);
    } else {
      console.warn("Unsupported language:", language);
    }
  };

  const runCode = async () => {
    setOutput("");
    setIsRunning(true);
    const socket = getSocket();
    socket.emit("execution-status", { roomId, isRunning: true });

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

      const socket = getSocket();
      socket.emit("run-code", {
        roomId,
        output: result,
        language: selectedLanguage,
        input: inputValue,
        code: code,
      });

      setOutput(result);
    } catch (err) {
      setOutput("Error executing code: " + err);
      const socket = getSocket();
      socket.emit("run-code", {
        roomId,
        output: "Error executing code: " + err,
        language: selectedLanguage,
        input: inputValue,
        code: code,
      });
    }
    socket.emit("execution-status", { roomId, isRunning: false });
    setIsRunning(false);
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

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);

    const socket = getSocket();
    socket.emit("code-changed", { roomId, code: newCode });
  };

  const handleInputChange = (newInput: string) => {
    setInputValue(newInput);
    const socket = getSocket();
    socket.emit("input-changed", { roomId, input: newInput });
  };

  useEffect(() => {
    const socket = getSocket();

    const handleLanguageUpdate = (language: string) => {
      console.log("📡 Received language update:", language);
      if (starterCode.hasOwnProperty(language)) {
        setSelectedLanguage(language);
        setCode(starterCode[language as keyof typeof starterCode]);
      } else {
        console.warn("Unsupported language received:", language);
      }
    };

    socket.on("language-changed", handleLanguageUpdate);

    return () => {
      socket.off("language-changed", handleLanguageUpdate);
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();

    const handleCodeChanged = ({ code }: { code: string }) => {
      setCode(code);
    };

    socket.on("code-changed", handleCodeChanged);

    return () => {
      socket.off("code-changed", handleCodeChanged);
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();

    const handleInputChanged = ({ input }: { input: string }) => {
      setInputValue(input);
    };

    socket.on("input-changed", handleInputChanged);

    return () => {
      socket.off("input-changed", handleInputChanged);
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();

    const handleCodeRun = ({
      output,
      language,
      code,
      input,
    }: {
      output: string;
      language: string;
      code: string;
      input: string;
    }) => {
      console.log("Received code run result");

      setSelectedLanguage(language);
      setCode(code);
      setInputValue(input);
      setOutput(output);
      setIsRunning(false);
    };

    socket.on("code-run", handleCodeRun);

    return () => {
      socket.off("code-run", handleCodeRun);
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();
    const handleExecutionStatus = ({ isRunning }: { isRunning: boolean }) => {
      setIsRunning(isRunning);
    };
    socket.on("execution-status", handleExecutionStatus);
    return () => {
      socket.off("execution-status", handleExecutionStatus);
    };
  }, []);

  // Handle user join/leave events
  useEffect(() => {
    const socket = getSocket();
    const { addParticipant } =
      useStore.getState();

    const handleUserJoined = ({
      userId,
    }: {
      userId: string;
    }) => {
      console.log("User joined:", userId);
      addParticipant({
        id: userId,
        name: "Remote User",
        color: "bg-green-500",
      });
    };

    const handleUserLeft = ({ userId }: { userId: string }) => {
      console.log("User left:", userId);
      // For simplicity, we'll clear all participants when someone leaves
      // clearParticipants();
    };

    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);

    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
    };
  }, []);

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
                Room ID: {roomId}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyRoomId}
                  className="h-6 w-6 p-0 ml-2"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </Button>
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <Select
              value={selectedLanguage}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger
                className={`w-40 bg-slate-800 border-slate-700 text-white`}
              >
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

            {/* Video Call Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVideoCallVisible(!isVideoCallVisible)}
              className={isVideoCallVisible ? "bg-green-600 text-white" : ""}
            >
              <Phone className="w-4 h-4 mr-2" />
              {isVideoCallVisible ? "Hide Call" : "Video Call"}
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
          <CodeEditor
            code={code}
            language={selectedLanguage}
            setCode={handleCodeChange}
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
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Enter input for your program here..."
                className={`w-full h-full resize-none   border rounded-md p-3 text-sm font-mono ${"bg-slate-800 border-slate-700 text-gray-100 placeholder-gray-500"} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
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

      {/* Video Call Component */}
      <VideoCall
        isVisible={isVideoCallVisible}
        onToggle={() => setIsVideoCallVisible(false)}
      />
    </div>
  );
}
