/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faSpinner,
  faChevronLeft,
  faPaperclip,
  faCheckDouble,
  faCheck,
  faUser,
  faUserTie,
  faVideo,
  faVideoSlash,
  faMicrophone,
  faMicrophoneSlash,
  faPhoneSlash,
  faExpand,
  faCompress,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import TimeAgo from "react-timeago";

const Job_Provider_Chat_Page = () => {
  const { chatRoomId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const messagesEndRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  // Chat state management
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [chatRoom, setChatRoom] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [typingStatus, setTypingStatus] = useState(null);
  const [socket, setSocket] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // WebRTC Video call state
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [hasVideoDevices, setHasVideoDevices] = useState(false);
  const [hasAudioDevices, setHasAudioDevices] = useState(false);
  const [callStartTime, setCallStartTime] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState(null);

  // Configuration
  const BASE_URL = "http://127.0.0.1:8000/chat/";
  const token = localStorage.getItem("token");

  // ICE servers configuration
  const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ];

  // Check media devices availability
  const checkMediaDevices = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.warn("Media Devices API not supported");
        return;
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const audioDevices = devices.filter(device => device.kind === 'audioinput');

      setHasVideoDevices(videoDevices.length > 0);
      setHasAudioDevices(audioDevices.length > 0);

      if (videoDevices.length === 0) {
        setIsVideoEnabled(false);
      }
      if (audioDevices.length === 0) {
        setIsAudioEnabled(false);
      }
    } catch (err) {
      console.error("Error enumerating devices:", err);
    }
  };

  // Initialize media stream with proper error handling
  const initializeMediaStream = async (video = true, audio = true) => {
    try {
      if (!hasVideoDevices && !hasAudioDevices) {
        throw new Error("No media devices available");
      }

      const constraints = {
        video: hasVideoDevices && video,
        audio: hasAudioDevices && audio
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (err) {
      console.error("Error getting media stream:", err);
      
      let errorMessage = "Could not access media devices: ";
      if (err.name === 'NotAllowedError') {
        errorMessage += "Permissions denied. Please allow camera/microphone access.";
      } else if (err.name === 'NotFoundError') {
        errorMessage += "No media devices found.";
      } else if (err.name === 'NotReadableError') {
        errorMessage += "Camera/microphone is already in use by another application.";
      } else {
        errorMessage += err.message;
      }

      setError(errorMessage);
      return null;
    }
  };

  // Clean up media streams and peer connection
  const cleanupMediaStream = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  // Create peer connection
  const createPeerConnection = () => {
    try {
      const peerConnection = new RTCPeerConnection({ iceServers });
      peerConnectionRef.current = peerConnection;
      
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.send(JSON.stringify({
            type: "ice_candidate",
            candidate: event.candidate,
            chat_room_id: chatRoomId,
            target_user_id: incomingCallData?.caller_id || otherUser?.id
          }));
        }
      };

      peerConnection.ontrack = (event) => {
        console.log("Remote stream received");
        const [stream] = event.streams;
        setRemoteStream(stream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      };

      peerConnection.onconnectionstatechange = () => {
        console.log("Connection state changed:", peerConnection.connectionState);
        if (peerConnection.connectionState === 'connected') {
          setIsConnecting(false);
          setCallStartTime(new Date());
        } else if (peerConnection.connectionState === 'disconnected' || 
                   peerConnection.connectionState === 'failed') {
          endVideoCall();
        }
      };

      peerConnection.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", peerConnection.iceConnectionState);
        if (peerConnection.iceConnectionState === 'failed') {
          // Restart ICE
          peerConnection.restartIce();
        }
      };

      return peerConnection;
    } catch (error) {
      console.error("Error creating peer connection:", error);
      setError("Failed to create peer connection");
      return null;
    }
  };

  // Answer video call
  const answerVideoCall = async () => {
    if (!incomingCallData) return;
    
    try {
      setIsConnecting(true);
      setError(null);

      // Get user media
      const stream = await initializeMediaStream(isVideoEnabled, isAudioEnabled);
      if (!stream) {
        setIsConnecting(false);
        return;
      }

      // Create peer connection
      const peerConnection = createPeerConnection();
      if (!peerConnection) {
        setIsConnecting(false);
        return;
      }

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Set remote description from the offer
      await peerConnection.setRemoteDescription(incomingCallData.offer);

      // Create answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      // Send answer through WebSocket
      if (socket) {
        socket.send(JSON.stringify({
          type: "video_call_answer",
          answer: answer,
          chat_room_id: chatRoomId,
          target_user_id: incomingCallData.caller_id
        }));
      }

      setIsVideoCallActive(true);
      setIsIncomingCall(false);
      setCallStartTime(new Date());
    } catch (error) {
      console.error('Error answering call:', error);
      setError('Failed to answer video call. Please try again.');
      setIsConnecting(false);
      endVideoCall();
    }
  };

  // Handle incoming call answer
  const handleCallAnswer = async (answerData) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(answerData.answer);
      }
    } catch (error) {
      console.error('Error handling call answer:', error);
      setError('Failed to establish video call connection');
    }
  };

  // Handle ICE candidate
  const handleIceCandidate = async (candidateData) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(candidateData.candidate);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  // End video call
  const endVideoCall = () => {
    setIsVideoCallActive(false);
    setIsIncomingCall(false);
    setIncomingCallData(null);
    setCallStartTime(null);
    setIsConnecting(false);
    
    // Send end call signal
    if (socket && otherUser) {
      socket.send(JSON.stringify({
        type: "video_call_end",
        chat_room_id: chatRoomId,
        target_user_id: otherUser.id
      }));
    }
    
    cleanupMediaStream();
  };

  // Decline incoming call
  const declineCall = () => {
    setIsIncomingCall(false);
    setIncomingCallData(null);
    
    if (socket && incomingCallData) {
      socket.send(JSON.stringify({
        type: "video_call_declined",
        chat_room_id: chatRoomId,
        target_user_id: incomingCallData.caller_id
      }));
    }
  };

  // Toggle video
  const toggleVideo = async () => {
    if (!localStream || !hasVideoDevices) return;
    
    try {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    } catch (error) {
      console.error('Error toggling video:', error);
      setError('Failed to toggle video.');
    }
  };

  // Toggle audio
  const toggleAudio = async () => {
    if (!localStream || !hasAudioDevices) return;
    
    try {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    } catch (error) {
      console.error('Error toggling audio:', error);
      setError('Failed to toggle audio.');
    }
  };

  // Toggle fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  // Format call duration
  const formatCallDuration = () => {
    if (!callStartTime) return "00:00";
    const seconds = Math.floor((Date.now() - callStartTime.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Initialize current user
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (!userData) {
      navigate("/login");
      return;
    }

    try {
      const parsedData = JSON.parse(userData);
      const user = parsedData.user || parsedData;

      if (!user?.id) {
        throw new Error("Invalid user data - missing user ID");
      }

      const userObj = {
        id: user.id,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        role: user.role || "job_seeker",
        profile_picture: user.profile_picture || null,
      };

      setCurrentUser(userObj);
      checkMediaDevices();

      return () => {
        cleanupMediaStream();
      };
    } catch (err) {
      console.error("Error parsing user data:", err);
      navigate("/login");
    }
  }, [navigate, token]);

  // WebSocket connection management
  useEffect(() => {
    if (!chatRoomId || !currentUser) return;

    const wsUrl = `ws://${window.location.hostname}:8000/ws/chat/${chatRoomId}/`;
    const ws = new WebSocket(`${wsUrl}?token=${token}`);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setSocket(ws);
      ws.send(JSON.stringify({
        type: "join",
        user_id: currentUser.id.toString(),
      }));
    };

    ws.onmessage = async (e) => {
      const data = JSON.parse(e.data);
      console.log("WebSocket message received:", data);

      switch (data.type) {
        case "chat_message": {
          const formattedMessage = {
            ...data.message,
            sender: data.message.sender || {
              id: data.message.sender_id,
              first_name: data.message.sender_name?.split(" ")[0] || "",
              last_name: data.message.sender_name?.split(" ")[1] || "",
            },
            created_at: data.message.created_at || new Date().toISOString(),
            is_read: data.message.is_read || false,
          };
          setMessages((prev) => [...prev, formattedMessage]);
          if (formattedMessage.sender.id !== currentUser.id) {
            markMessageAsRead(formattedMessage.id);
          }
          break;
        }
        case "typing_status":
          if (data.user_id !== currentUser.id) {
            setTypingStatus(`${otherUser?.first_name || "User"} is typing...`);
            setTimeout(() => setTypingStatus(null), 2000);
          }
          break;
        case "video_call_offer":
          if (data.caller_id !== currentUser.id) {
            setIncomingCallData(data);
            setIsIncomingCall(true);
          }
          break;
        case "video_call_answer":
          if (peerConnectionRef.current) {
            handleCallAnswer(data);
          }
          break;
        case "ice_candidate":
          if (peerConnectionRef.current) {
            handleIceCandidate(data);
          }
          break;
        case "video_call_end":
          endVideoCall();
          break;
        case "video_call_declined":
          setError("Call was declined");
          endVideoCall();
          break;
        default:
          console.log("Unhandled message type:", data.type);
      }
      scrollToBottom();
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setSocket(null);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setError("WebSocket connection error. Please refresh the page.");
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [chatRoomId, currentUser, token, otherUser]);

  // Fetch chat data
  const fetchChatData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const roomRes = await axios.get(`${BASE_URL}rooms/${chatRoomId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChatRoom(roomRes.data);

      const otherParticipant =
        roomRes.data.client.id === currentUser.id
          ? roomRes.data.lawyer
          : roomRes.data.client;

      setOtherUser({
        id: otherParticipant.id,
        first_name: otherParticipant.full_name.split(" ")[0] || "",
        last_name: otherParticipant.full_name.split(" ")[1] || "",
        email: otherParticipant.email || "",
        role: otherParticipant.role,
        phone_number: otherParticipant.phone_number || otherParticipant.phone || "",
      });

      const messagesRes = await axios.get(
        `${BASE_URL}rooms/${chatRoomId}/messages/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages(messagesRes.data || []);

      try {
        await axios.post(
          `${BASE_URL}rooms/${chatRoomId}/mark-read/`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (readError) {
        console.error("Error marking messages as read:", readError);
      }
    } catch (error) {
      console.error("Error fetching chat data:", error);
      setError(
        error.response?.data?.message ||
          "Failed to load chat. Please try again."
      );
      navigate("/customer/cases");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!chatRoomId || !currentUser) return;
    fetchChatData();
  }, [chatRoomId, currentUser, token, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      setError(null);

      const formData = new FormData();
      formData.append("content", newMessage);
      if (attachment) {
        formData.append("attachment", attachment);
      }

      await axios.post(
        `${BASE_URL}rooms/${chatRoomId}/messages/create/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setNewMessage("");
      setAttachment(null);
      setAttachmentPreview(null);
      fetchChatData(); // Refresh messages
    } catch (error) {
      console.error("Error sending message:", error);
      setError(
        error.response?.data?.message || 
        error.response?.data?.detail || 
        "Failed to send message. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (isTyping) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "typing",
          is_typing: isTyping,
          chat_room_id: chatRoomId,
        })
      );
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      await axios.post(
        `${BASE_URL}messages/${messageId}/mark-read/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("File size too large. Maximum 10MB allowed.");
      return;
    }

    setAttachment(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachmentPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        <p className="mt-4 text-gray-600">Loading chat...</p>
      </div>
    );
  }

  if (!currentUser || !chatRoom) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Video Call Interface */}
      {isVideoCallActive && (
        <div className={`fixed inset-0 z-50 bg-black ${isFullScreen ? 'z-50' : ''}`}>
          <div className="relative w-full h-full">
            {/* Remote participant video */}
            <div className="w-full h-full">
              {remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white">
                  <div className="text-center">
                    <p>Waiting for participant to join...</p>
                    {callStartTime && (
                      <div className="text-xl mt-2">
                        {formatCallDuration()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Local video (picture-in-picture) */}
            {localStream && (
              <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Call controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black bg-opacity-50 rounded-full px-6 py-3">
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full ${isVideoEnabled ? 'bg-gray-600' : 'bg-red-600'} text-white hover:bg-opacity-80`}
                disabled={!hasVideoDevices}
                title={hasVideoDevices ? "Toggle video" : "No video devices available"}
              >
                <FontAwesomeIcon icon={isVideoEnabled ? faVideo : faVideoSlash} />
              </button>
              
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full ${isAudioEnabled ? 'bg-gray-600' : 'bg-red-600'} text-white hover:bg-opacity-80`}
                disabled={!hasAudioDevices}
                title={hasAudioDevices ? "Toggle audio" : "No audio devices available"}
              >
                <FontAwesomeIcon icon={isAudioEnabled ? faMicrophone : faMicrophoneSlash} />
              </button>
              
              <button
                onClick={toggleFullScreen}
                className="p-3 rounded-full bg-gray-600 text-white hover:bg-opacity-80"
                title={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                <FontAwesomeIcon icon={isFullScreen ? faCompress : faExpand} />
              </button>
              
              <button
                onClick={endVideoCall}
                className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700"
                title="End call"
              >
                <FontAwesomeIcon icon={faPhoneSlash} />
              </button>
            </div>

            {/* Call info */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg px-4 py-2 text-white">
              <div className="text-sm">
                {otherUser?.first_name} {otherUser?.last_name}
              </div>
              {callStartTime && (
                <div className="text-xs opacity-75">
                  {formatCallDuration()}
                </div>
              )}
              {!isVideoEnabled && hasVideoDevices && (
                <div className="text-xs text-yellow-300 mt-1">
                  <FontAwesomeIcon icon={faExclamationTriangle} /> Video is disabled
                </div>
              )}
              {!isAudioEnabled && hasAudioDevices && (
                <div className="text-xs text-yellow-300 mt-1">
                  <FontAwesomeIcon icon={faExclamationTriangle} /> Audio is disabled
                </div>
              )}
              {!hasVideoDevices && (
                <div className="text-xs text-yellow-300 mt-1">
                  <FontAwesomeIcon icon={faExclamationTriangle} /> No video devices found
                </div>
              )}
              {!hasAudioDevices && (
                <div className="text-xs text-yellow-300 mt-1">
                  <FontAwesomeIcon icon={faExclamationTriangle} /> No audio devices found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Incoming Call Modal */}
      {isIncomingCall && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="mb-4">
                <FontAwesomeIcon icon={faVideo} className="text-4xl text-green-600 mb-2" />
                <h3 className="text-lg font-semibold">Incoming Video Call</h3>
                <p className="text-gray-600">
                  {incomingCallData?.caller_name || `${otherUser?.first_name} ${otherUser?.last_name}`} is calling...
                </p>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={answerVideoCall}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full"
                >
                  <FontAwesomeIcon icon={faVideo} className="mr-2" />
                  Answer
                </button>
                
                <button
                  onClick={declineCall}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full"
                >
                  <FontAwesomeIcon icon={faPhoneSlash} className="mr-2" />
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-700 p-3 rounded-lg shadow-lg z-50 flex items-center max-w-md">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="ml-4 text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Chat header */}
      <div className="bg-red-800 text-white p-4 flex items-center justify-between shadow-md">
        <button
          onClick={() => navigate("/customer/cases")}
          className="flex items-center hover:bg-red-700 p-2 rounded"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="mr-2" />
          {t("Back")}
        </button>

        <div className="flex items-center">
          <div className="relative">
            {otherUser?.role === "lawyer" ? (
              <FontAwesomeIcon
                icon={faUserTie}
                className="w-8 h-8 rounded-full bg-white text-red-800 p-2"
              />
            ) : (
              <FontAwesomeIcon
                icon={faUser}
                className="w-8 h-8 rounded-full bg-white text-red-800 p-2"
              />
            )}
          </div>
          <div className="ml-3">
            <h2 className="font-semibold">
              {otherUser?.first_name} {otherUser?.last_name}
            </h2>
            <p className="text-xs opacity-80">
              {otherUser?.role === "lawyer" ? "Lawyer" : "Client"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div>
            <p className="text-sm">Case: {chatRoom?.case_number || "N/A"}</p>
          </div>
        </div>

        <div className="text-xs flex items-center">
          {socket ? (
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
              Connected
            </span>
          ) : (
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>
              Disconnected
            </span>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg mb-2">No messages yet</p>
            <p className="text-sm">Start the conversation with your lawyer</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex mb-4 ${
                message.sender.id === currentUser.id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 ${
                  message.sender.id === currentUser.id
                    ? "bg-red-100 text-gray-800"
                    : "bg-white text-gray-800 shadow"
                }`}
              >
                {message.sender.id !== currentUser.id && (
                  <div className="font-semibold text-sm mb-1">
                    {message.sender.first_name} {message.sender.last_name}
                  </div>
                )}

                {message.content && (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}

                {message.attachment && (
                  <div className="mt-2">
                    {message.attachment_type === "image" ? (
                      <img
                        src={message.attachment}
                        alt="Attachment"
                        className="max-w-full h-auto rounded max-h-64 cursor-pointer"
                        onClick={() =>
                          window.open(message.attachment, "_blank")
                        }
                      />
                    ) : (
                      <a
                        href={message.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <FontAwesomeIcon icon={faPaperclip} className="mr-1" />
                        {message.attachment_name || "Download file"}
                      </a>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-end mt-1 space-x-1 text-xs text-gray-500">
                  <TimeAgo date={message.created_at} />
                  {message.sender.id === currentUser.id && (
                    <span className="ml-1">
                      {message.is_read ? (
                        <FontAwesomeIcon
                          icon={faCheckDouble}
                          className="text-blue-500"
                        />
                      ) : (
                        <FontAwesomeIcon icon={faCheck} />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {typingStatus && (
          <div className="flex justify-start mb-4">
            <div className="bg-white text-gray-800 rounded-lg p-3 shadow">
              <div className="flex items-center">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <span className="ml-2 text-sm">{typingStatus}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message input area */}
      <div className="bg-white border-t p-4 shadow-md">
        {error && (
          <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        {attachmentPreview && (
          <div className="relative mb-2">
            <img
              src={attachmentPreview}
              alt="Preview"
              className="h-20 w-20 object-cover rounded border"
            />
            <button
              onClick={removeAttachment}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
              aria-label="Remove attachment"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex items-center">
          <label className="cursor-pointer mr-2 hover:text-red-600 transition-colors">
            <FontAwesomeIcon icon={faPaperclip} className="text-gray-600" />
            <input
              type="file"
              onChange={handleAttachmentChange}
              className="hidden"
              accept="image/*, .pdf, .doc, .docx"
              aria-label="Attach file"
            />
          </label>

          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping(e.target.value.length > 0);
              }}
              onKeyPress={handleKeyPress}
              onBlur={() => handleTyping(false)}
              placeholder={t("Type your message...")}
              className="w-full border text-gray-700 rounded-lg py-2 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows="1"
              disabled={isSending}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={isSending || !newMessage.trim()}
            className="ml-2 bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50 hover:bg-red-700 transition-colors"
            aria-label="Send message"
          >
            {isSending ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faPaperPlane} />
            )}
          </button>
        </div>
      </div>

      {/* CSS for typing animation */}
      <style jsx>{`
        .typing-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #9CA3AF;
          margin: 0 1px;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dot:nth-child(1) {
          animation-delay: -0.32s;
        }

        .typing-dot:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};


export default Job_Provider_Chat_Page;

