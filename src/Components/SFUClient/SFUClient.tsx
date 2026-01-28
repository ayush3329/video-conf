// import React, { useEffect, useRef, useState, useMemo } from "react";
// import { Device } from "mediasoup-client";
// import io, { Socket } from "socket.io-client";
// import { AppDispatch, RootState } from "../../redux/states/store";
// import { mediaState } from "../../types/redux-state-types";
// import { useDispatch, useSelector } from "react-redux";
// import { turnOffCamera, turnOffMic } from '../../redux/states/media-controls/mediaControlSlice';
// import './VideoGrid.css';

// interface SFUInterface {
//   videoRef: React.RefObject<HTMLVideoElement|null>;
//   roomId: string | null;
//   username: string | null;
//   socketRef: React.MutableRefObject<Socket | null>;
// }

// // Helper component for remote videos
// const RemoteVideoTile = ({ stream, username }: { stream: MediaStream | null, username: string }) => {
//   const videoRef = useRef<HTMLVideoElement>(null);

//   useEffect(() => {
//     if (videoRef.current && stream) {
//       videoRef.current.srcObject = stream;
//     }
//   }, [stream]);

//   return (
//     <div className="video-tile">
//       {stream ? (
//         <video ref={videoRef} autoPlay playsInline className="video-element" />
//       ) : (
//         <div className="no-video-placeholder">
//             <div className="avatar">{username.charAt(0).toUpperCase()}</div>
//         </div>
//       )}
//       <span className="user-label">{username}</span>
//     </div>
//   );
// };

// export default function SFUClient({ videoRef, roomId, username, socketRef }: SFUInterface) {

//   const dispatch = useDispatch<AppDispatch>();
//   const mediaControl: mediaState = useSelector((state: RootState) => state.media);

//   const deviceRef = useRef(new Device());

//   // Transports
//   const sendTransportRef = useRef<any>(null);
//   const recvTransportRef = useRef<any>(null);
  
//   // Track Producers to close them explicitly
//   const videoProducerRef = useRef<any>(null);
//   const audioProducerRef = useRef<any>(null);
//   const screenProducerRef = useRef<any>(null);

//   // STATE
//   const [peers, setPeers] = useState<{ socketId: string; username: string }[]>([]);
//   // Store streams mapped by Socket ID
//   const [remoteStreams, setRemoteStreams] = useState<{ socketId: string; stream: MediaStream }[]>([]);
//   const [isTransportReady, setIsTransportReady] = useState(false);

//   // --- Dynamic Grid Calculation ---
//   const totalTiles = peers.length + 1; // Peers + Local
  
//   const gridStyle = useMemo(() => {
//     const cols = Math.ceil(Math.sqrt(totalTiles));
//     const rows = Math.ceil(totalTiles / cols);
//     return {
//       gridTemplateColumns: `repeat(${cols}, 1fr)`,
//       gridTemplateRows: `repeat(${rows}, 1fr)`
//     };
//   }, [totalTiles]);

//   // --- Broadcasting Logic ---

//   const startVideoBroadcast = async () => {

//     if (!videoRef.current?.srcObject || !sendTransportRef.current) return;
    
//     // Prevent creating duplicate producers
//     if (videoProducerRef.current && !videoProducerRef.current.closed) return;

//     const stream = videoRef.current.srcObject as MediaStream;
//     const videoTrack = stream.getVideoTracks()[0];
//     if (!videoTrack) return;

//     try {
//       const producer = await sendTransportRef.current.produce({ 
//         track: videoTrack,
//         appData: {
//           kind: "video"
//         }
//        });

//       videoProducerRef.current = producer;
      
//       producer.on("trackended", () => {
//          console.log("Video track ended");
//          // Optional: handle track ending naturally
//       });

//       producer.on("transportclose", () => {
//          console.log("Video transport closed");
//       });

//     } catch (err) {
//       console.error("Failed to publish video", err);
//     }
//   };

//   const startAudioBroadcast = async () => {
//     if (!videoRef.current?.srcObject || !sendTransportRef.current) return;
//     if (audioProducerRef.current && !audioProducerRef.current.closed) return;

//     const stream = videoRef.current.srcObject as MediaStream;
//     const audioTrack = stream.getAudioTracks()[0];
//     if (!audioTrack) return;

//     try {
//       const producer = await sendTransportRef.current.produce({ 
//         track: audioTrack,
//         appData: {
//           kind: "audio"
//         }
//       });
//       audioProducerRef.current = producer;
//     } catch (err) {
//       console.error("Failed to publish audio", err);
//     }
//   };

//   const stopHardwareTrack = (kind: 'video' | 'audio') => {
//     const stream = videoRef.current?.srcObject as MediaStream;
//     if (!stream) return;
    
//     const tracks = kind === 'video' ? stream.getVideoTracks() : stream.getAudioTracks();
//     tracks.forEach(track => {
//       track.stop();
//       // Don't remove track from stream immediately if you want to keep the local preview object alive, 
//       // but usually for a clean cut:
//       stream.removeTrack(track); 
//     });
//   };

//   const handleTurnOffCamera = async () => {
//     // 1. Close Mediasoup Producer
//     if (videoProducerRef.current) {
//       videoProducerRef.current.close();
//       await emit("close-producer", { producerId: videoProducerRef.current.id });
//       videoProducerRef.current = null;
//     }

//     // 2. Stop Hardware
//     stopHardwareTrack('video');
    
//     // 3. Update Redux
//     dispatch(turnOffCamera());
//   };

//   const handleTurnOffMic = async () => {
//     if (audioProducerRef.current) {
//       audioProducerRef.current.close();
//       await emit("close-producer", { producerId: audioProducerRef.current.id });
//       audioProducerRef.current = null;
//     }
//     stopHardwareTrack('audio');
//     dispatch(turnOffMic());
//   };

//   const emit = (type: string, data = {}) => {
//     return new Promise((resolve) => {
//       socketRef.current?.emit(type, data, resolve);
//     });
//   };

//   const createSendTransport = async () => {
//     const data: any = await emit("createWebRtcTransport", { sender: true, roomId });
//     if (data.error) throw new Error(data.error);

//     // Creating a producerTransport on Client side
//     const transport = deviceRef.current.createSendTransport(data.params);
//     sendTransportRef.current = transport;

//     transport.on("connect", ({ dtlsParameters }, callback, errback) => {
//       emit("producer-transport-connect", { dtlsParameters, transportId: transport.id })
//         .then(callback).catch(errback);
//     });

//     transport.on("produce", ({ kind, rtpParameters, appData }, callback, errback) => {
//       console.log("AppData ", appData, kind)
//       emit("transport-produce", { kind: appData.kind, rtpParameters, transportId: transport.id })
//         .then(({ id }: any) => callback({ id }))
//         .catch(errback);
//     });
//   };

//   const createRecvTransport = async () => {
//     const data: any = await emit("createWebRtcTransport", { sender: false, roomId });
//     if (data.error) throw new Error(data.error);

//     const transport = deviceRef.current.createRecvTransport(data.params);
//     recvTransportRef.current = transport;

//     console.log("Server Consumer Transport Id ", data.params.id);
//     console.log("Client Consumer Transport Id ", transport.id);

//     transport.on("connect", ({ dtlsParameters }, callback, errback) => {
//       emit("consumer-transport-connect", { dtlsParameters, transportId: transport.id })
//         .then(callback).catch(errback);
//     });
//   };

//   const init = async () => {
//     try {

//       const routerRtpCapabilities = await emit("getRouterRtpCapabilities", { roomId });
//       if (!deviceRef.current.loaded) {
//         await deviceRef.current.load({ routerRtpCapabilities: routerRtpCapabilities as any });
//       }

//       await createSendTransport();
//       await createRecvTransport();
//       setIsTransportReady(true);

//       // Get existing producers with their socketIDs
//       const existingProducers: any = await emit("getProducers", { roomId });
//       for (const producerData of existingProducers) {
//         await consumeStream(producerData.producerId, producerData.socketId);
//       }
//     } catch (error) {
//       console.error("Init failed:", error);
//     }
//   };

//   const consumeStream = async (producerId: string, socketId: string, kind: string) => {

//     const { rtpCapabilities } = deviceRef.current;
    
//     const data: any = await emit("consume", {
//       producerId, //It represent the stream which we want to consume
//       rtpCapabilities,
//       transportId: recvTransportRef.current.id, // This is the transport id of server consumerTransport. We will create consumer inside it
//       roomId, 
//       kind
//     });

//     console.log("Consume Response from server ", data);

//     if (data.error) {
//       console.error("Consume failed", data.error);
//       return;
//     }

//     // Now we will create a consumer on client side
//     const consumer = await recvTransportRef.current.consume({
//       id: data.params.id,
//       producerId: data.params.producerId,
//       kind: data.params.kind,
//       rtpParameters: data.params.rtpParameters,
//     });

//     const stream = new MediaStream();
//     stream.addTrack(consumer.track);

//     if (consumer.kind === 'video') {
//         console.log("Video Stream Comming");
//         // Update stream for specific socketId
//         setRemoteStreams(prev => {
//             // Remove existing stream for this user if any (to replace)
//             const filtered = prev.filter(p => p.socketId !== socketId);
//             return [...filtered, { socketId, stream }];
//         });
//     } else {
//         console.log("Audio Stream Comming");
//         const audioElem = new Audio();
//         audioElem.srcObject = stream;
//         audioElem.play().catch(e => console.error("Audio play failed", e));
//     }

//     socketRef.current?.emit("consumer-resume", { serverConsumerId: data.params.id });
//   };

//   // --- Socket Setup ---
//   useEffect(() => {
    
//       socketRef.current = io(`https://0dce5e9268ca.ngrok-free.app`,{
//         query: { username, roomId },
//         extraHeaders: {
//           "ngrok-skip-browser-warning": "69420"
//         }
//       });

//       socketRef.current.on("connect", () => {
//         console.log("Socket connected");
//         init();
//       });

//       socketRef.current.on("all-users", (users: { socketId: string, username: string }[]) => {
//          console.log("Received all users", users);
//          setPeers(users);
//       });

//       // socketRef.current.on("user-joined", (user: { socketId: string, username: string }) => {
//       //    console.log("User joined", user);
//       //    setPeers(prev => [...prev, user]);
//       // });

//       // socketRef.current.on("user-left", ({ socketId }: { socketId: string }) => {
//       //    console.log("User left", socketId);
//       //    setPeers(prev => prev.filter(p => p.socketId !== socketId));
//       //    setRemoteStreams(prev => prev.filter(s => s.socketId !== socketId));
//       // });

//       socketRef.current.on("new-producer", ({ producerId, socketId, kind }) => {
//         consumeStream(producerId, socketId, kind);
//       });

//       // socketRef.current.on("producer-closed", ({ producerId, socketId }) => {
//       //    // If a remote user turns off video, remove that stream from state
//       //    // so the UI falls back to the Avatar placeholder
//       //    setRemoteStreams(prev => {
//       //       const target = prev.find(s => s.socketId === socketId);
//       //        // Note: We need to distinguish audio vs video closure if possible, 
//       //        // but here we just remove the entry if it matches.
//       //        // Ideally we check if the stream has no tracks left.
//       //        return prev.filter(s => s.socketId !== socketId); 
//       //    });
//       // });
    
//     return () => {
//       socketRef.current?.disconnect();
//     };
//   }, []);

//   // --- Media Controls Monitoring ---
//   useEffect(() => {
//     if (mediaControl.camera && isTransportReady) startVideoBroadcast();
//   }, [mediaControl.camera, isTransportReady]);

//   useEffect(() => {
//     if (mediaControl.mic && isTransportReady) startAudioBroadcast();
//   }, [mediaControl.mic, isTransportReady]);

//   return (
//     <div className="sfu-container">
//       <div className="video-grid" style={gridStyle}>
        
//         {/* Local User Tile */}
//         <div className="video-tile" style={{ border: "2px solid #8ab4f8" }}>
//           <video ref={videoRef} autoPlay muted playsInline />
//           {/* {mediaControl.camera ? (
//           ) : (
//               <div className="no-video-placeholder">
//                   <div className="avatar">You</div>
//               </div>
//           )} */}
//           <span className="user-label">You ({username})</span>
//         </div>

//         {/* Remote Users Tiles: Iterate over PEERS, not streams */}
//         {peers.map((peer) => {
//             const peerStreamEntry = remoteStreams.find(s => s.socketId === peer.socketId);
//             return (
//                 <RemoteVideoTile 
//                     key={peer.socketId} 
//                     stream={peerStreamEntry ? peerStreamEntry.stream : null} 
//                     username={peer.username} 
//                 />
//             );
//         })}

//       </div>
      
//       {/* <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: 'flex', gap: '10px' }}>
//          <button onClick={handleTurnOffCamera}>Toggle Cam</button>
//          <button onClick={handleTurnOffMic}>Toggle Mic</button>
//       </div> */}
//     </div>
//   );
// }




import React, { useEffect, useRef, useState, useMemo } from "react";
import { Device } from "mediasoup-client";
import io, { Socket } from "socket.io-client";
import { AppDispatch, RootState } from "../../redux/states/store";
import { mediaState } from "../../types/redux-state-types";
import { useDispatch, useSelector } from "react-redux";
import { turnOffCamera, turnOffMic } from '../../redux/states/media-controls/mediaControlSlice';
import './VideoGrid.css';
import RemoteVideoTile from "./Tile";

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
  videoStream: MediaStream | null;
  audioStream: MediaStream | null;
  videoConsumer: any | null; // Mediasoup consumer object
  audioConsumer: any | null; // Mediasoup consumer object
}


export default function SFUClient({ videoRef, roomId, username, socketRef }: SFUInterface) {

  const dispatch = useDispatch<AppDispatch>();
  const mediaControl: mediaState = useSelector((state: RootState) => state.media);

  const deviceRef = useRef(new Device());

  // Transports
  const sendTransportRef = useRef<any>(null);
  const recvTransportRef = useRef<any>(null);
  
  // Track Producers to close them explicitly
  const videoProducerRef = useRef<any>(null);
  const audioProducerRef = useRef<any>(null);

  // STATE: Stores all data about remote users (Username + Streams + Consumers)
  const [remoteUsers, setRemoteUsers] = useState<RemotePeer[]>([]);
  const [isTransportReady, setIsTransportReady] = useState(false);

  // --- Dynamic Grid Calculation ---
  const totalTiles = remoteUsers.length + 1; // Peers + Local
  
  const gridStyle = useMemo(() => {
    const cols = Math.ceil(Math.sqrt(totalTiles));
    const rows = Math.ceil(totalTiles / cols);
    return {
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`
    };
  }, [totalTiles]);

  // --- Helper: Socket Emit ---
  const emit = (type: string, data = {}) => {
    return new Promise((resolve) => {
      socketRef.current?.emit(type, data, resolve);
    });
  };
  
  // --- Broadcasting Logic ---
  
  const startVideoBroadcast = async () => {
    if (!videoRef.current?.srcObject || !sendTransportRef.current) return;
    if (videoProducerRef.current && !videoProducerRef.current.closed) return;

    const stream = videoRef.current.srcObject as MediaStream;
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;

    try {
      // 1. Creating VideoProducer
      const videoProducer = await sendTransportRef.current.produce({ 
        track: videoTrack,
        appData: { kind: "video" }
       });

      videoProducerRef.current = videoProducer;
      
      videoProducer.on("transportclose", () => {
         console.log("Video transport closed");
         videoProducerRef.current = null;
      });

      videoProducer.on("trackended", () => {
        console.log("Track ended");
        // Handle unexpected track end (e.g. device unplugged)
      });

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
  
  const startScreenBroadcast = async()=>{

  }


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
      videoProducerRef.current.close();
      // Server listener for this is commented out in your server code, but good to have
      await emit("close-producer", { producerId: videoProducerRef.current.id });
      videoProducerRef.current = null;
    }
    stopHardwareTrack('video');
    dispatch(turnOffCamera());
  };

  const handleTurnOffMic = async () => {
    if (audioProducerRef.current) {
      audioProducerRef.current.close();
      await emit("close-producer", { producerId: audioProducerRef.current.id });
      audioProducerRef.current = null;
    }
    stopHardwareTrack('audio');
    dispatch(turnOffMic());
  };

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
        await consumeStream(producerData.producerId, producerData.socketId, producerData.kind);
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
      transportId: recvTransportRef.current.id,
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
        }];
    });
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

  // --- Socket Setup ---
  useEffect(() => {
    
      socketRef.current = io(`https://0dce5e9268ca.ngrok-free.app`,{
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
             audioConsumer: null
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
             audioConsumer: null
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
    
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // --- Media Controls Monitoring ---
  useEffect(() => {
    if (mediaControl.camera && isTransportReady) startVideoBroadcast();
    // Logic to handle turning OFF camera is inside startVideoBroadcast checks or needs explicit "else" here if toggled frequently
    else if (!mediaControl.camera && videoProducerRef.current) handleTurnOffCamera();
  }, [mediaControl.camera, isTransportReady]);

  useEffect(() => {
    if (mediaControl.mic && isTransportReady) startAudioBroadcast();
    else if (!mediaControl.mic && audioProducerRef.current) handleTurnOffMic();
  }, [mediaControl.mic, isTransportReady]);

  return (
    <div className="sfu-container">
      <div className="video-grid" style={gridStyle}>
        
        {/* Local User Tile */}
        <div className="video-tile" style={{ border: "2px solid #8ab4f8" }}>
          <video ref={videoRef} autoPlay muted playsInline />
          <span className="user-label">You ({username})</span>
        </div>

        {/* Remote Users Tiles */}
        {remoteUsers.map((user) => (
            <div key={user.socketId}>
                {/* VIDEO TILE */}
                <RemoteVideoTile 
                    stream={user.videoStream} 
                    username={user.username} 
                />
                
                {/* AUDIO ELEMENT (HIDDEN) */}
                {/* This fixes the ghost audio issue. React manages this tag. */}
                {user.audioStream && (
                    <audio 
                        autoPlay 
                        ref={(ref) => { if(ref && user.audioStream) ref.srcObject = user.audioStream }} 
                    />
                )}
            </div>
        ))}

      </div>
    </div>
  );
}



























