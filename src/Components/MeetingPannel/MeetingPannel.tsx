import React, { useEffect, useRef, useState, useMemo } from "react";
import { Device } from "mediasoup-client";
import io, { Socket } from "socket.io-client";
import { AppDispatch, RootState } from "../../redux/states/store";
import { mediaState } from "../../types/redux-state-types";
import { useDispatch, useSelector } from "react-redux";
import { turnOffCamera, turnOffMic } from '../../redux/states/media-controls/mediaControlSlice';
import HostVideoTile from "../VideoTile/HostVideoTile/HostVideoTile";
import RemoteUsersVideoTile from "../VideoTile/RemoteUsersVideoTile/RemoteUsersVideoTile";
import {getUserColor} from "../../utility/utility"

interface SFUInterface {
  videoRef: React.RefObject<HTMLVideoElement|null>;
  roomId: string | null;
  username: string | null;
  socketRef: React.MutableRefObject<Socket | null>;
}

// Data structure for a remote user
interface RemotePeer {

  socketId: string;
  username: string;
  
  videoPaused: boolean;
  audioPaused: boolean;

  videoStream: MediaStream | null;
  audioStream: MediaStream | null;

  videoConsumer: any | null; // Mediasoup consumer object
  audioConsumer: any | null; // Mediasoup consumer object
  
}


export default function MeetingPannel({ videoRef, roomId, username, socketRef }: SFUInterface) {

  const dispatch = useDispatch<AppDispatch>();
  const mediaControl: mediaState = useSelector((state: RootState) => state.media);

  // State Variable
  const [tileSize, setTileSize] = useState({ width: 909, height: 511.3125 });
  const [remoteUsers, setRemoteUsers] = useState<RemotePeer[]>([]);
  const [isTransportReady, setIsTransportReady] = useState(false);

  //Refs
  const deviceRef = useRef(new Device()); //Holds mediasoup Device Object (very important for entire video Calling)
  const containerRef = useRef(null);
  const sendTransportRef = useRef<any>(null); //Producer Transport Ref
  const recvTransportRef = useRef<any>(null); //Consumer Transport Ref
  const videoProducerRef = useRef<any>(null);  
  const audioProducerRef = useRef<any>(null);

  

  // Helper Function
  const calculateLayout = () => {
      const UserCount = remoteUsers.length + 1;
      if (UserCount === 0 || !containerRef.current) return;
      const CONTAINER_PADDING = 32;
      const GAP = 16;
      const containerWidth = containerRef.current.clientWidth - CONTAINER_PADDING;
      const containerHeight = containerRef.current.clientHeight - CONTAINER_PADDING;
      let bestWidth = 0; 
      let bestHeight = 0;

      for (let cols = 1; cols <= UserCount; cols++) {
        const rows = Math.ceil(UserCount / cols);
        const contentWidth = containerWidth - ((cols - 1) * GAP);
        const maxTileWidth = contentWidth / cols;
        const contentHeight = containerHeight - ((rows - 1) * GAP);
        const maxTileHeight = contentHeight / rows;

        let w = maxTileWidth;
        let h = w * (9 / 16);
        if (h > maxTileHeight) {
          h = maxTileHeight;
          w = h * (16 / 9);
        }
        if (w > bestWidth) { bestWidth = w; bestHeight = h; }
      }
      console.log(bestHeight, bestWidth)
      setTileSize({ width: bestWidth, height: bestHeight });
  };

  const emit = (type: string, data = {}) => {
    return new Promise((resolve) => {
      socketRef.current?.emit(type, data, resolve);
    });
  };

  
  const startVideoBroadcast = async () => {
    if (!videoRef.current?.srcObject || !sendTransportRef.current) return;

    const stream = videoRef.current.srcObject as MediaStream;
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;

    // IF PRODUCER EXISTS: Don't just resume, REPLACE the track
    if (videoProducerRef.current && !videoProducerRef.current.closed) {
        console.log("Replacing track on existing producer...");
        
        // replaceTrack is the proper way to swap the dead track with the new hardware track
        await videoProducerRef.current.replaceTrack({ track: videoTrack });
        
        // Now resume the SFU transmission
        await videoProducerRef.current.resume();
        emit("resume-stream", { kind: "video" });
        return;
    }

    // FIRST TIME PRODUCING:
    try {
      const videoProducer = await sendTransportRef.current.produce({ 
        track: videoTrack,
        appData: { kind: "video" }
      });
      videoProducerRef.current = videoProducer;
      // ... rest of your existing logic
    } catch (err) {
      console.error("Failed to publish video", err);
    }
  };

  const startAudioBroadcast = async () => {
    if (!videoRef.current?.srcObject || !sendTransportRef.current) return;
    if (audioProducerRef.current && !audioProducerRef.current.closed) return;

    const stream = videoRef.current.srcObject as MediaStream;
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;

    try {
      const producer = await sendTransportRef.current.produce({ 
        track: audioTrack,
        appData: { kind: "audio" }
      });
      audioProducerRef.current = producer;
    } catch (err) {
      console.error("Failed to publish audio", err);
    }
  };
  
  const stopHardwareTrack = (kind: 'video' | 'audio') => {
    const stream = videoRef.current?.srcObject as MediaStream;
    if (!stream) return;
    const tracks = kind === 'video' ? stream.getVideoTracks() : stream.getAudioTracks();
    tracks.forEach(track => {
        track.stop();
        stream.removeTrack(track); 
    });
  };

  const handleTurnOffCamera = async () => {
    if (videoProducerRef.current) {
      await videoProducerRef.current.pause();
      await emit("pause-producer", { kind: "video" });
    }    
    // stopHardwareTrack('video');
    dispatch(turnOffCamera());
  };

  const handleTurnOffMic = async () => {
    // Fix This function, same as handleTurnOffCamera
    if (audioProducerRef.current) {
      audioProducerRef.current.close();
      await emit("close-producer", { producerId: audioProducerRef.current.id });
      audioProducerRef.current = null;
    }
    stopHardwareTrack('audio');
    dispatch(turnOffMic());
  };



  // Handle audio/video stream pausing of Remote users
  const pauseRemoteStream = (socketId: string, kind: string)=>{
    // pause video stream of a remote user with socket id "socketId"
    setRemoteUsers((prev)=> prev.map(user=> {
      if(user.socketId === socketId) {
        return {
          ...user,
          videoStream: null,
          videoPaused: kind === "video" ? true : user.videoPaused,
          audioPaused: kind === "audio" ? true : user.audioPaused,
        };
      }
      return user
    }))
  }

  const resumeRemoteStream = (socketId: string, kind: string)=>{
    setRemoteUsers((prev)=> prev.map(user=>{
      if(user.socketId === socketId){
        return {
          ...user,
          videoStream: new MediaStream([user.videoConsumer.track]),
          videoPaused: kind === "video" ? false : user.videoPaused,
          audioPaused: kind === "audio" ? false : user.audioPaused,
        }
      }
      return user
    }))
  }

  
  // --- Transport Creation ---
  const createProduceTransport = async () => {

    // 1. Requesting server to create producerTransport for client
    const data: any = await emit("createWebRtcTransport", { sender: true, roomId });
    if (data.error) throw new Error(data.error);

    // 2. Once server successfully created ProducerTransport. Now we will create producerTransport on client with the same
    // id as server's producerTranport
    const transport = deviceRef.current.createSendTransport(data.params);
    sendTransportRef.current = transport;

    console.log("Client producerTransport Created with id ", transport.id)

    // 3. The moment we create videoProducer/audioProducer/screenProducer, "connect" event will fire
    // This will create a desired producer on the server and connect it with client's 
    // audioProducer/videProducer/screenProdcuer
    transport.on("connect", ({ dtlsParameters }, callback, errback) => {
      emit("producer-transport-connect", { dtlsParameters, transportId: transport.id })
        .then(callback).catch(errback);
    });

    // 4. Once client starts producing media, "produce" event will fire
    transport.on("produce", ({ rtpParameters, appData }, callback, errback) => {
      emit("transport-produce", { kind: appData.kind, rtpParameters, transportId: transport.id })
        .then(({ id }: any) => callback({ id }))
        .catch(errback);
    });
  };

  const createConsumeTransport = async () => {
    const data: any = await emit("createWebRtcTransport", { sender: false, roomId });
    if (data.error) throw new Error(data.error);

    const transport = deviceRef.current.createRecvTransport(data.params);
    recvTransportRef.current = transport;

    console.log("Client consumerTransport Created with id ", transport.id)

    // EVENT: consumer-transport-connect
    transport.on("connect", ({ dtlsParameters }, callback, errback) => {
      emit("consumer-transport-connect", { dtlsParameters, transportId: transport.id })
        .then(callback).catch(errback);
    });
  };

  const init = async () => {
    try {
      const routerRtpCapabilities = await emit("getRouterRtpCapabilities", { roomId });
      if (!deviceRef.current.loaded) {
        await deviceRef.current.load({ routerRtpCapabilities: routerRtpCapabilities as any });
      }

      await createProduceTransport();
      await createConsumeTransport();
      setIsTransportReady(true);

      // Get existing producers
      const existingProducers: any = await emit("getProducers", { roomId });
      // Loop through and consume them
      // NOTE: Your server should return { producerId, socketId, kind }
      for (const producerData of existingProducers) {
        await consumeStream(producerData, socketRef.current?.id, producerData.kind);
      }
    } catch (error) {
      console.error("Init failed:", error);
    }
  };

  
  // --- CORE: Consume Logic ---
  const consumeStream = async (producerId: string, socketId: string, kind: string) => {
    const { rtpCapabilities } = deviceRef.current;
    
    const data: any = await emit("consume", {
      producerId, 
      rtpCapabilities,
      roomId, 
      kind
    });

    if (data.error) {
      console.error("Consume failed", data.error);
      return;
    }

    const consumer = await recvTransportRef.current.consume({
      id: data.params.id,
      producerId: data.params.producerId,
      kind: data.params.kind,
      rtpParameters: data.params.rtpParameters,
    });
    const stream = new MediaStream([consumer.track]);

    // Resume on server
    socketRef.current?.emit("consumer-resume", { serverConsumerId: data.params.id, kind });

    // UPDATE STATE: Add the stream/consumer to the correct user
    setRemoteUsers(prev => {
        const existingUser = prev.find(u => u.socketId === socketId);
        // If user exists, update their streams
        if (existingUser) {
            return prev.map(u => {
                if (u.socketId === socketId) {
                    return {
                        ...u,
                        videoStream: kind === 'video' ? stream : u.videoStream,
                        audioStream: kind === 'audio' ? stream : u.audioStream,
                        videoConsumer: kind === 'video' ? consumer : u.videoConsumer,
                        audioConsumer: kind === 'audio' ? consumer : u.audioConsumer,
                        
                        videoPaused: kind === "video" ? false : true,
                        audioPaused: kind === "video" ? false : true,
                    };
                }
                return u;
            });
        }

        // If user doesn't exist (edge case if user-joined event lagged), create new
        return [...prev, {
            socketId,
            username: "Unknown", // Ideally passed from server
            videoStream: kind === 'video' ? stream : null,
            audioStream: kind === 'audio' ? stream : null,
            videoConsumer: kind === 'video' ? consumer : null,
            audioConsumer: kind === 'audio' ? consumer : null,
            videoPaused: kind === "video" ? false : true,
            audioPaused: kind === "video" ? false : true,
        }];
    });
    
    setInterval(async () => {
      try {
        const stats = await consumer.getStats();
        
        // stats is a Map-like object. We iterate through it:
        stats.forEach(report => {
          if (report.type === 'inbound-rtp') {
            console.log(`Packets Received: ${report.packetsReceived}`);
            console.log(`Current Bitrate: ${report.bitrate} bps`);
            
            if (report.packetsReceived === 0) {
              console.warn("No packets arriving despite consumer being active.");
            }
          }
        });
      } catch (error) {
        console.error("Could not get consumer stats", error);
      }
    }, 2000);

  };
 
  // --- CORE: Cleanup Logic ---
  const closeConsumer = (socketId: string, kind: string) => {
      setRemoteUsers(prev => prev.map(user => {
          if (user.socketId === socketId) {
              const newUser = { ...user };
              
              if (kind === 'video') {
                  newUser.videoConsumer?.close(); // Close Mediasoup Consumer
                  newUser.videoConsumer = null;
                  newUser.videoStream = null;
              } else {
                  newUser.audioConsumer?.close(); // Close Mediasoup Consumer
                  newUser.audioConsumer = null;
                  newUser.audioStream = null;
              }
              return newUser;
          }
          return user;
      }));
  };

  const removePeer = (socketId: string) => {
      setRemoteUsers(prev => {
          const user = prev.find(u => u.socketId === socketId);
          if (user) {
              user.videoConsumer?.close();
              user.audioConsumer?.close();
          }
          return prev.filter(u => u.socketId !== socketId);
      });
  };



  // Effects
  useEffect(() => {
    
      socketRef.current = io(`https://f77b41ee9948.ngrok-free.app`,{
        query: { username, roomId },
        extraHeaders: { "ngrok-skip-browser-warning": "69420" }
      });

      socketRef.current.on("connect", () => {
        console.log("Socket connected");
        init();
      });

      // 1. Handle New User Join (Create Placeholder)
      socketRef.current.on("all-users", (users: { socketId: string, username: string }[]) => {
         const initialPeers: RemotePeer[] = users.map(u => ({
             socketId: u.socketId,
             username: u.username,
             videoStream: null,
             audioStream: null,
             videoConsumer: null,
             audioConsumer: null,
             audioPaused: true,
             videoPaused: true
         }));
         setRemoteUsers(initialPeers);
      });

      socketRef.current.on("user-joined", (user: { socketId: string, username: string }) => {
         setRemoteUsers(prev => [...prev, {
             socketId: user.socketId,
             username: user.username,
             videoStream: null,
             audioStream: null,
             videoConsumer: null,
             audioConsumer: null,
             audioPaused: true,
             videoPaused: true
         }]);
      });

      // 2. Handle User Leaving
      socketRef.current.on("user-left", ({ socketId }: { socketId: string }) => {
         removePeer(socketId);
      });

      // 3. Handle New Stream Available
      socketRef.current.on("new-producer", ({ producerId, socketId, kind }) => {
        consumeStream(producerId, socketId, kind);
      });

      // 4. Handle Stream Closed (Mute/Camera Off)
      // Make sure your server emits this event!
      socketRef.current.on("producer-closed", ({ socketId, kind }) => {
         closeConsumer(socketId, kind);
      });

      // 5. Remote Producers are paused
      socketRef.current.on("remote-producer-paused", ({socketId, kind})=>{
        pauseRemoteStream(socketId, kind);
      })

      // 6. Remote stream Resumed
      socketRef.current.on("remote-stream-resumed", ({socketId, kind})=>{
        resumeRemoteStream(socketId, kind);
      })
    
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (mediaControl.camera && isTransportReady) startVideoBroadcast();
    // Logic to handle turning OFF camera is inside startVideoBroadcast checks or needs explicit "else" here if toggled frequently
    else if (!mediaControl.camera && videoProducerRef.current) handleTurnOffCamera();
  }, [mediaControl.camera, isTransportReady]);

  useEffect(() => {
    if (mediaControl.mic && isTransportReady) startAudioBroadcast();
    else if (!mediaControl.mic && audioProducerRef.current) handleTurnOffMic();
  }, [mediaControl.mic, isTransportReady]);

  useEffect(()=>{
    if(remoteUsers.length>0){
      calculateLayout();
      window.addEventListener('resize', calculateLayout);
      return () => window.removeEventListener('resize', calculateLayout);
    }
  }, [remoteUsers])

  return (
    <div className='main-section' ref={containerRef}>

          <HostVideoTile 
            avatarColor={getUserColor(socketRef.current?.id || "You")}
            remoteUser={remoteUsers.length}
            height={tileSize.height}
            width={tileSize.width}
            username="You"
            videoRef={videoRef}
          />

        {/* Remote Users Tiles */}
        {remoteUsers.map((user) => (
            <RemoteUsersVideoTile 
                videoPaused={user.videoPaused}
                avatarColor={getUserColor(user.socketId)}
                key={user.socketId}
                height={tileSize.height}
                width={tileSize.width}
                stream={user.videoStream} 
                audioStream={user.audioStream} // Pass audio inside
                username={user.username} 
            />
        ))}

    </div>
  );
}

