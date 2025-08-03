"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Play,
  Users,
  // Share2,
  GripHorizontal,
  GripVertical,
  Phone,
  ChevronDown,
  ChevronUp,
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
import { CopyButton } from "@/components/ui/copy";

// Horizontal Resizable Divider Component (for editor/panels split)
function HorizontalResizableDivider({
  onResize,
  isMobile = false,
}: {
  onResize: (deltaX: number) => void;
  isMobile?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return; // Disable on mobile
    setIsDragging(true);
    document.body.style.userSelect = "none";
    const startX = e.clientX;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      onResize(deltaX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className={`relative cursor-col-resize group bg-slate-800 hover:bg-slate-700 transition-colors ${
        isDragging ? "bg-blue-500" : ""
      } ${isMobile ? "w-full h-1" : "w-2"}`}
      onMouseDown={handleMouseDown}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <GripVertical
          className={`text-slate-600 group-hover:text-slate-400 transition-colors ${
            isDragging ? "text-blue-300" : ""
          } ${isMobile ? "w-6 h-6" : "w-4 h-4"}`}
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
  isMobile = false,
}: {
  onResize: (deltaY: number) => void;
  isMobile?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return; // Disable on mobile
    setIsDragging(true);
    document.body.style.userSelect = "none";
    const startY = e.clientY;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;
      onResize(deltaY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className={`relative cursor-row-resize group bg-slate-800 hover:bg-slate-700 transition-colors ${
        isDragging ? "bg-blue-500" : ""
      } ${isMobile ? "h-1 w-full" : "h-2"}`}
      onMouseDown={handleMouseDown}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <GripHorizontal
          className={`text-slate-600 group-hover:text-slate-400 transition-colors ${
            isDragging ? "text-blue-300" : ""
          } ${isMobile ? "w-6 h-6" : "w-4 h-4"}`}
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
  const [inputHeight, setInputHeight] = useState(50);
  const [editorWidth, setEditorWidth] = useState(70);
  const [inputValue, setInputValue] = useState("");
  const [output, setOutput] = useState("");
  const [isVideoCallVisible, setIsVideoCallVisible] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVerticalLayout, setIsVerticalLayout] = useState(false);
  const { roomId } = useStore();

  // Detect mobile device and screen size
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);
      setIsVerticalLayout(isMobileDevice);

      // Reset layout for mobile
      if (isMobileDevice) {
        setEditorWidth(100);
        setInputHeight(50);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLanguageChange = (language: string) => {
    const socket = getSocket();
    socket.emit("change-language", { language, roomId });

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
      //console.log("Full response:", data);

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
    if (isMobile) return;
    const containerHeight = window.innerHeight - (isHeaderCollapsed ? 60 : 120);
    const deltaPercentage = (deltaY / containerHeight) * 100;
    const newInputHeight = Math.max(
      20,
      Math.min(80, inputHeight + deltaPercentage)
    );
    setInputHeight(newInputHeight);
  };

  const handleHorizontalResize = (deltaX: number) => {
    if (isMobile) return;
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
      //console.log("📡 Received language update:", language);
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
      //console.log("Received code run result");

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
    const { addParticipant } = useStore.getState();

    const handleUserJoined = ({ userId }: { userId: string }) => {
      //console.log("User joined:", userId);
      addParticipant({
        id: userId,
        name: "Remote User",
        color: "bg-green-500",
      });
    };

    const handleUserLeft = ({ userId }: { userId: string }) => {
      console.log("User left:", userId);
    };

    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);

    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
    };
  }, []);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-900">
      {/* Responsive Header */}
      <header
        className={`border-b bg-gray-900 border-slate-800 transition-all duration-300 ${
          isHeaderCollapsed ? "h-16" : "h-auto"
        } ${isMobile ? "mb-1 px-3" : ""}`}
      >
        <div className={`${isMobile ? "px-2 py-1" : "px-4 sm:px-6 py-4"}`}>
          {/* Mobile Header */}
          <div className="flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                {isHeaderCollapsed ? (
                  <ChevronDown className="w-4 h-4 text-gray-300" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-gray-300" />
                )}
              </Button>
              <h1 className="text-lg font-bold text-white">CodeSync</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={runCode}
                disabled={isRunning}
                size="sm"
                className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-3 py-2"
              >
                <Play className="w-4 h-4" />
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={() => setIsVideoCallVisible(!isVideoCallVisible)}
                className={`rounded-lg px-3 py-2 ${
                  isVideoCallVisible
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-800 hover:bg-gray-700 text-white"
                }`}
              >
                <Phone className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className={`${isHeaderCollapsed ? "hidden" : "block"} lg:block`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <h1 className="text-xl font-bold text-white hidden sm:block">
                  CodeSync
                </h1>

                {/* Active Users */}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <div className="flex -space-x-2">
                    {users.map((user) => (
                      <Avatar
                        key={user.id}
                        className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white"
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
                  <Badge
                    variant="secondary"
                    className="ml-2 text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">Room ID: </span>
                    <span className="sm:hidden">ID: </span>
                    {roomId}
                    <CopyButton value={roomId} />
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Language Selector */}
                <Select
                  value={selectedLanguage}
                  onValueChange={handleLanguageChange}
                >
                  <SelectTrigger className="w-full sm:w-40 bg-gray-700 border-slate-700 text-white">
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

                {/* Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="default"
                    onClick={runCode}
                    disabled={isRunning}
                    className="bg-gray-700 hover:bg-gray-800 text-white px-4 sm:px-6 flex-1 sm:flex-none"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">
                      {isRunning ? "Running..." : "Run"}
                    </span>
                    <span className="sm:hidden">
                      {isRunning ? "..." : "Run"}
                    </span>
                  </Button>

                  {/* <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button> */}

                  <Button
                    variant="default"
                    onClick={() => setIsVideoCallVisible(!isVideoCallVisible)}
                    className="bg-gray-700 text-white hover:bg-gray-800"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    {isVideoCallVisible ? "Hide Call" : "Video Call"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div
        className={`flex transition-all duration-300 ${
          isVerticalLayout ? "flex-col" : "flex-row"
        } h-[calc(100vh-${
          isHeaderCollapsed ? "64px" : "120px"
        })] lg:h-[calc(100vh-80px)] ${
          isMobile ? "gap-2 p-3 overflow-auto" : ""
        }`}
        style={{
          scrollbarWidth: isMobile ? "thin" : "auto",
          scrollbarColor: isMobile ? "#66fff033 #121212" : "auto",
        }}
      >
        {/* Code Editor Section */}
        <div
          className={`flex flex-col min-w-0 ${
            isVerticalLayout ? "h-1/2" : ""
          } ${isMobile ? "rounded-lg overflow-hidden" : ""}`}
          style={{
            width: isVerticalLayout ? "100%" : `${editorWidth}%`,
            height: isVerticalLayout ? "50%" : "100%",
          }}
        >
          <div className="flex-1 min-h-0 overflow-hidden">
            <CodeEditor
              code={code}
              language={selectedLanguage}
              setCode={handleCodeChange}
            />
          </div>
        </div>

        {/* Horizontal Resizable Divider */}
        {!isVerticalLayout && (
          <HorizontalResizableDivider
            onResize={handleHorizontalResize}
            isMobile={isMobile}
          />
        )}

        {/* Vertical Resizable Divider for mobile */}
        {isVerticalLayout && (
          <VerticalResizableDivider
            onResize={handleVerticalResize}
            isMobile={isMobile}
          />
        )}

        {/* Resizable Input and Output Panels */}
        <div
          className={`border-l border-slate-800 bg-slate-900 flex flex-col min-w-0 ${
            isVerticalLayout ? "h-1/2" : ""
          } ${isMobile ? "rounded-lg" : ""}`}
          style={{
            width: isVerticalLayout ? "100%" : `${100 - editorWidth}%`,
            height: isVerticalLayout ? "50%" : "100%",
          }}
        >
          {/* Input Panel */}
          <div
            className="flex flex-col min-h-0"
            style={{ height: isVerticalLayout ? "50%" : `${inputHeight}%` }}
          >
            <div className="border-b border-slate-800 px-4 py-3 flex items-center justify-between">
              <h3 className="font-medium text-white text-sm sm:text-base">
                Input
              </h3>
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

            <div className="flex-1 p-2 sm:p-4 min-h-0">
              <textarea
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Enter input for your program here..."
                className="w-full h-full resize-none border rounded-md p-2 sm:p-3 text-xs sm:text-sm font-mono bg-slate-800 border-slate-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                style={{
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  lineHeight: "1.4",
                  overflow: isMobile ? "auto" : "hidden",
                  scrollbarWidth: isMobile ? "thin" : "auto",
                  scrollbarColor: isMobile ? "#66fff033 #121212" : "auto",
                }}
              />
            </div>
          </div>

          {/* Vertical Resizable Divider */}
          {!isVerticalLayout && (
            <VerticalResizableDivider
              onResize={handleVerticalResize}
              isMobile={isMobile}
            />
          )}

          {/* Output Panel */}
          <div
            className="flex flex-col min-h-0"
            style={{
              height: isVerticalLayout ? "50%" : `${100 - inputHeight}%`,
            }}
          >
            <div className="border-b border-slate-800 px-4 py-3 flex items-center justify-between">
              <h3 className="font-medium text-white text-sm sm:text-base">
                Output
              </h3>
            </div>

            <div className="flex-1 p-2 sm:p-4 overflow-auto min-h-0">
              <div
                className="bg-slate-800 border-slate-700 text-gray-100 placeholder-gray-500 rounded-md p-2 sm:p-3 h-full"
                style={{
                  scrollbarWidth: isMobile ? "thin" : "auto",
                  scrollbarColor: isMobile ? "#66fff033 #121212" : "auto",
                }}
              >
                {isRunning ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs sm:text-sm text-gray-400">
                      Executing code...
                    </span>
                  </div>
                ) : (
                  <div className="font-mono text-xs sm:text-sm text-gray-100">
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
