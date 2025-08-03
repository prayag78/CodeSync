"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, X } from "lucide-react";
import { getSocket } from "@/lib/socket-client";
import { useStore } from "@/hooks/store";

interface VideoCallProps {
  isVisible: boolean;
  onToggle: () => void;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  color: string;
}

export default function VideoCall({ isVisible, onToggle }: VideoCallProps) {
  const { roomId, currentUser, participants } = useStore();
  const [isInCall, setIsInCall] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isCallRequested, setIsCallRequested] = useState(false);
  const [isCallRequesting, setIsCallRequesting] = useState(false);
  const [remoteUser, setRemoteUser] = useState<User | null>(null);
  const [callStatus, setCallStatus] = useState<string>("");

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef(getSocket());

  const createPeerConnection = useCallback(() => {
    const configuration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    };

    const pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", {
          roomId,
          candidate: event.candidate,
          fromUserId: currentUser.id,
        });
      }
    };

    pc.ontrack = (event) => {
      //console.log("Received remote track:", event.streams[0]);
      remoteStreamRef.current = event.streams[0];
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setIsCallActive(true);
        setCallStatus("Connected");
      }
    };

    pc.oniceconnectionstatechange = () => {
      //console.log("ICE connection state:", pc.iceConnectionState);
      if (pc.iceConnectionState === "connected") {
        setCallStatus("Connected");
        setIsCallActive(true);
      } else if (
        pc.iceConnectionState === "disconnected" ||
        pc.iceConnectionState === "failed"
      ) {
        setCallStatus("Disconnected");
        setIsCallActive(false);
        // Don't call handleEndCall here to avoid circular dependency
        setIsInCall(false);
        setIsCallRequested(false);
        setIsCallRequesting(false);
        setRemoteUser(null);
      }
    };

    return pc;
  }, [roomId, currentUser.id]);
  
  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoOn,
        audio: isMicOn,
      });

      localStreamRef.current = stream;

      // Add tracks to peer connection if it exists
      if (peerConnectionRef.current) {
        // Remove existing tracks first to avoid duplicates
        const senders = peerConnectionRef.current.getSenders();
        senders.forEach((sender) => {
          if (sender.track) {
            peerConnectionRef.current?.removeTrack(sender);
          }
        });

        stream.getTracks().forEach((track) => {
          peerConnectionRef.current?.addTrack(track, stream);
        });
      }

      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      setCallStatus("Error accessing camera/microphone");
      // Don't call handleEndCall here to avoid circular dependency
      setIsInCall(false);
      setIsCallActive(false);
      setIsCallRequested(false);
      setIsCallRequesting(false);
      setRemoteUser(null);
      return null;
    }
  }, [isVideoOn, isMicOn]);

  const handleCallRequest = useCallback(async () => {
    setIsCallRequesting(true);
    setCallStatus("Requesting call...");

    socketRef.current.emit("call-request", {
      roomId,
      fromUserId: currentUser.id,
    });
  }, [roomId, currentUser.id]);

  const handleCallAccept = useCallback(async () => {
    setIsCallRequested(false);
    setIsInCall(true); // Call is accepted from UI perspective
    setCallStatus("Call accepted. Waiting for remote media...");

    // Emit call-accept to the initiator
    socketRef.current.emit("call-accept", {
      roomId,
      fromUserId: currentUser.id,
    });

    // Start local stream immediately, so it's ready when the offer comes
    await startLocalStream();

    // Do NOT create peer connection or offer here. Wait for the offer from the initiator.
  }, [roomId, currentUser.id, startLocalStream]);

  const handleCallReject = useCallback(() => {
    setIsCallRequested(false);
    setCallStatus("Call rejected");

    socketRef.current.emit("call-reject", {
      roomId,
      fromUserId: currentUser.id,
    });
  }, [roomId, currentUser.id]);

  const handleEndCall = useCallback(() => {
    setIsInCall(false);
    setIsCallActive(false);
    setIsCallRequested(false);
    setIsCallRequesting(false);
    setRemoteUser(null);
    setCallStatus("Call ended");

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Clear video elements
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    remoteStreamRef.current = null;

    socketRef.current.emit("call-end", {
      roomId,
      fromUserId: currentUser.id,
    });
  }, [roomId, currentUser.id]);

  const toggleMic = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  }, []);

  // Socket event listeners
  useEffect(() => {
    const socket = socketRef.current;

    const handleCallRequest = ({ fromUserId }: { fromUserId: string }) => {
      setIsCallRequested(true);
      // Try to find the remote user from participants
      const remoteParticipant = participants.find((p) => p.id === fromUserId);
      setRemoteUser({
        id: fromUserId,
        name: remoteParticipant?.name || "Remote User",
        color: remoteParticipant?.color || "bg-blue-500",
      });
      setCallStatus("Incoming call...");
    };

    const handleCallAcceptedByRemote = async ({
      fromUserId,
    }: {
      fromUserId: string;
    }) => {
      //console.log("Call accepted by remote user:", fromUserId);
      setIsCallRequesting(false); // Stop the loader for the initiator
      setIsInCall(true); // Call is now established from UI perspective
      setCallStatus("Call accepted. Establishing media...");

      // Find the remote user from participants
      const remoteParticipant = participants.find((p) => p.id === fromUserId);
      setRemoteUser({
        id: fromUserId,
        name: remoteParticipant?.name || "Remote User",
        color: remoteParticipant?.color || "bg-blue-500",
      });

      // Initiator now starts local stream, creates PC, creates offer, and sends offer
      const stream = await startLocalStream();
      if (!stream) return;

      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call-offer", {
        roomId,
        offer,
        fromUserId: currentUser.id,
      });
    };

    const handleCallReject = () => {
      setIsCallRequesting(false);
      setCallStatus("Call rejected");
    };

    const handleCallEnd = () => {
      setIsInCall(false);
      setIsCallActive(false);
      setIsCallRequested(false);
      setIsCallRequesting(false);
      setRemoteUser(null);
      setCallStatus("Call ended by remote user");

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      remoteStreamRef.current = null;
    };

    const handleCallOffer = async ({
      offer,
      fromUserId,
    }: {
      offer: RTCSessionDescriptionInit;
      fromUserId: string;
      fromSocketId: string;
    }) => {
      console.log("Received call offer from:", fromUserId);
      const stream = await startLocalStream();
      if (!stream) return;

      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      // Add local stream tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Set remote description
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      // Create and send answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("call-answer", {
        roomId,
        answer,
        fromUserId: currentUser.id,
      });
    };

    const handleCallAnswer = async ({
      answer,
      fromUserId,
    }: {
      answer: RTCSessionDescriptionInit;
      fromUserId: string;
    }) => {
      console.log("Received call answer from:", fromUserId);
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    };

    const handleIceCandidate = async ({
      candidate,
    }: {
      candidate: RTCIceCandidateInit;
      fromUserId: string;
    }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    };

    socket.on("call-request", handleCallRequest);
    socket.on("call-accept", handleCallAcceptedByRemote);
    socket.on("call-reject", handleCallReject);
    socket.on("call-end", handleCallEnd);
    socket.on("call-offer", handleCallOffer);
    socket.on("call-answer", handleCallAnswer);
    socket.on("ice-candidate", handleIceCandidate);

    return () => {
      socket.off("call-request", handleCallRequest);
      socket.off("call-accept", handleCallAcceptedByRemote);
      socket.off("call-reject", handleCallReject);
      socket.off("call-end", handleCallEnd);
      socket.off("call-offer", handleCallOffer);
      socket.off("call-answer", handleCallAnswer);
      socket.off("ice-candidate", handleIceCandidate);
    };
  }, [
    startLocalStream,
    createPeerConnection,
    roomId,
    currentUser.id,
    participants,
    handleEndCall,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  // Restore remote video when component becomes visible
  useEffect(() => {
    if (
      isVisible &&
      isCallActive &&
      remoteStreamRef.current &&
      remoteVideoRef.current
    ) {
      // If we have an active call and the component becomes visible,
      // restore the remote video stream
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [isVisible, isCallActive]);

  if (!isVisible) return null;

  return (
    <div className="fixed left-1/2 -translate-x-1/2 top-1 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-100" />
            <span className="text-sm font-medium text-white">Video Call</span>
            {callStatus && (
              <Badge variant="secondary" className="text-xs">
                {callStatus}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Video Container */}
        <div className="p-4">
          <div className="mb-4">
            {/* Remote Video Only */}
            <div className="relative bg-gray-800 rounded overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-40 object-cover transform scale-x-[-1]"
              />
              {!isCallActive && (
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                  <div className="text-center">
                    <Avatar className="w-16 h-16 mx-auto mb-2">
                      <AvatarFallback
                        className={`${
                          remoteUser?.color || "bg-blue-500"
                        } text-white text-lg`}
                      >
                        {remoteUser?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "RU"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm text-gray-400">
                      {remoteUser?.name || "Remote User"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {isCallRequesting
                        ? "Requesting call..."
                        : isCallRequested
                        ? "Incoming call..."
                        : "Waiting for connection..."}
                    </div>
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                {remoteUser?.name || "Remote User"}
              </div>
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex justify-center gap-2">
            {!isInCall && !isCallRequested && !isCallRequesting && (
              <Button
                onClick={handleCallRequest}
                className="bg-gray-700 hover:bg-gray-800 text-white"
                size="sm"
              >
                <Phone className="w-4 h-4 mr-1" />
                Start Call
              </Button>
            )}

            {isCallRequested && (
              <>
                <Button
                  onClick={handleCallAccept}
                  className="bg-gray-700 hover:bg-gray-800 text-white"
                  size="sm"
                >
                  <Phone className="w-4 h-4 mr-1" />
                  Accept
                </Button>
                <Button
                  onClick={handleCallReject}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                >
                  <PhoneOff className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </>
            )}

            {isCallRequesting && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-400">
                  Requesting call...
                </span>
              </div>
            )}

            {isInCall && (
              <>
                <Button
                  onClick={toggleMic}
                  variant={isMicOn ? "default" : "destructive"}
                  size="sm"
                >
                  {isMicOn ? (
                    <Mic className="w-4 h-4" />
                  ) : (
                    <MicOff className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={toggleVideo}
                  variant={isVideoOn ? "default" : "destructive"}
                  size="sm"
                >
                  {isVideoOn ? (
                    <Video className="w-4 h-4" />
                  ) : (
                    <VideoOff className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={handleEndCall}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                >
                  <PhoneOff className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
