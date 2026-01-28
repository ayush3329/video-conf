import React, { useEffect, useRef, useState } from "react";
import { Device } from "mediasoup-client";
import io, { Socket } from "socket.io-client";
import { AppDispatch, RootState } from "../../redux/states/store";
import { mediaState } from "../../types/redux-state-types";
import { useDispatch, useSelector } from "react-redux";
import { turnOffCamera, turnOffMic } from '../../redux/states/media-controls/mediaControlSlice';

interface SFUInterface {
  videoRef: any;
  roomId: string|null,
  username: string|null,
  socketRef: any
}

export default function SFUClient({videoRef, roomId, username, socketRef}: SFUInterface) {
  
  const dispatch = useDispatch<AppDispatch>()
  const mediaControl: mediaState = useSelector((state: RootState)=> state.media);

  const deviceRef = useRef(new Device()); // holds the Device object 
  const sendTransportRef = useRef(null); // send transport connection
  const recvTransportRef = useRef(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const consumersRef = useRef(new Map());

  // Track readiness to avoid race conditions
  const [isTransportReady, setIsTransportReady] = useState(false);
  

  const startVideoBroadcast = async () => {
    console.log("startBroadcast");
    // console.log("videoRef.current ", videoRef.current);
    // console.log("videoRef.current.srcObject ", videoRef.current.srcObject);
    if (!videoRef.current || !videoRef.current.srcObject) return;

    const stream = videoRef.current.srcObject as MediaStream;
    const track = stream.getVideoTracks()[0];

    try {
      await sendTransportRef.current.produce({ track });
      console.log("Publishing video...");
    } catch (err) {
      console.error("Failed to publish video", err);
    }
  };

  const startAudioBroadcast = async()=>{
       console.log("startAudioBroadcast");
    // console.log("videoRef.current ", videoRef.current);
    // console.log("videoRef.current.srcObject ", videoRef.current.srcObject);
    if (!videoRef.current || !videoRef.current.srcObject) return;

    const stream = videoRef.current.srcObject as MediaStream;
    const track = stream.getAudioTracks()[0];

    try {
      await sendTransportRef.current.produce({ track });
      console.log("Publishing Audio...");
    } catch (err) {
      console.error("Failed to publish audio", err);
    }
  }
  
  const turnOFFCamera = ()=>{
      console.log("Camera ",mediaControl)
      console.log(videoRef.current);
      const tracks = videoRef?.current?.srcObject?.getVideoTracks() || null;
      console.log("Camera Track ", tracks)
      if(tracks === null) return;
      tracks.forEach(track => {
        track.stop(); // Stops the hardware
        videoRef.current.removeTrack(track); // Removes from stream object
      });
      dispatch(turnOffCamera())

  }

  const turnOFFMic = ()=>{
      console.log("MIC ",mediaControl)
      const tracks = videoRef?.current?.srcObject?.getAudioTracks() || null;
      if(tracks === null) return;
      tracks.forEach(track => {
        track.stop(); // Stops the hardware
        videoRef.current.removeTrack(track); // Removes from stream object
      });
      dispatch(turnOffMic())
  }



  // Helper for async socket emits
  const emit = (type: string, data = {}) => {
    return new Promise((resolve) => {
      socketRef.current?.emit(type, data, resolve);
    });
  };

  const createSendTransport = async () => {

    const data: any = await emit("createWebRtcTransport", { sender: true, roomId: roomId });
    if (data.error) throw new Error(data.error);

    console.log("sender stream socket details ", data)
    /*
      data.params.id = It is the transport id of Transport Connection we opened at the server
    */

    const transport = deviceRef.current.createSendTransport(data.params);
    /*
     transport.id = It is the transport id of the Transport Connection we used to connect to 
     Transport Connection of server

     data.params.id === transport.id
    */

    sendTransportRef.current = transport;

    transport.on("connect", ({ dtlsParameters }, callback, errback) => {
      console.log("transport-connect ", dtlsParameters)
      emit("transport-connect", {
        dtlsParameters,
        transportId: transport.id,
      })
        .then(callback)
        .catch(errback);
    });

    transport.on("produce",({ kind, rtpParameters, appData }, callback, errback) => {
      
      console.log("kind ", kind);  
      // This event will tell the server, that you will receive streams at transport connection
      // trasnport.id
      emit("transport-produce", {
          kind,
          rtpParameters,
          transportId: transport.id, 

        }).then(({ id }: any) => callback({ id }))
        .catch(errback);
      }

    );

  };

  const createRecvTransport = async () => {
    const data: any = await emit("createWebRtcTransport", { sender: false, roomId: roomId });
    if (data.error) throw new Error(data.error);

    console.log("receiver stream socket details ", data)
    const transport = deviceRef.current.createRecvTransport(data.params);
    recvTransportRef.current = transport;

    transport.on("connect", ({ dtlsParameters }, callback, errback) => {
      emit("transport-connect", {
        dtlsParameters,
        transportId: transport.id,
      })
        .then(callback)
        .catch(errback);
    });
  };  

  const init = async () => {
    try {
      const routerRtpCapabilities = await emit("getRouterRtpCapabilities", {roomId: roomId});
      console.log("routerRtpCapabilities ", routerRtpCapabilities)

      {
        /*
        routerRtpCapabilities = {
          "codecs": [
            {kind: 'audio', mimeType: 'audio/opus', clockRate: 48000, channels: 2, other key-values}
            {kind: 'video', mimeType: 'video/VP8',  clockRate: 90000, other key-values}
            {kind: 'video', mimeType: 'video/rtx',  clockRate: 90000, other key-values}
          ],
        "headers": []
      }
        */
      }

      if (!deviceRef.current.loaded) {
        
        // here we are sending server's rtp capabilities to the mediasoup (Device Object) and then mediasoup internally 
        // communicate with browser and chooses one common codec which both server and client understand.
        await deviceRef.current.load({ routerRtpCapabilities: routerRtpCapabilities as any,});

        {
          /*

          console.log("deviceRef ", deviceRef.current.handlerName)
            handlerName -> it returns the name of the browser (like chrome111 etc)

          console.log("rtpCapabilities ", deviceRef.current.rtpCapabilities)
            rtpCapabilities -> it returns and object ( {codes: [], headers: []} ) which stores the common codec and header 
            browser and server have 

          console.log("canProduce ", deviceRef.current.canProduce("audio")) 
            canProduce("audio")-> it return true, if the audio codec of both server and browser matches


          console.log("canProduce ", deviceRef.current.canProduce("video"))
            canProduce("video")-> it return true, if the video codec of both server and browser matches

          */
        }
         
      }

      await createSendTransport();
      await createRecvTransport();
      setIsTransportReady(true); // Both send and receive Transport are ready
      

      const existingProducerIds: any = await emit("getProducers", { roomId });
      
      console.log("Existing producers:", existingProducerIds);
      
      for (const producerId of existingProducerIds) {
        // Create a consumer for each existing video/audio
        await consumeStream(producerId);
      }



    } catch (error) {
      console.error("Init failed:", error);
    }
  };

  const consumeStream = async (producerId: string) => {
    
    const { rtpCapabilities } = deviceRef.current;
    
    const data: any = await emit("consume", {
      producerId,
      rtpCapabilities,
      transportId: recvTransportRef.current.id,
      roomId: roomId
    });
    
    console.log("Consumer Data ", data)
    
    
    const consumer = await recvTransportRef.current.consume({
      id: data.params.id,
      producerId: data.params.producerId,
      kind: data.params.kind,
      rtpParameters: data.params.rtpParameters,
    });
    
    consumersRef.current.set(consumer.id, consumer);

    consumer.on("transportclose", () => {
      console.log(`Consumer ${consumer.id} transport closed`);
      consumersRef.current.delete(consumer.id);
    });

    console.log("Consumer Transport ", consumer);


    if (remoteVideoRef.current) {
      console.log("Remote Ref exist")
      
      let stream = remoteVideoRef.current.srcObject as MediaStream;
      if (!stream) {
        stream = new MediaStream();
        remoteVideoRef.current.srcObject = stream;
      }
      
      console.log("consumer ", consumer.track);

      stream.addTrack(consumer.track);

      if (remoteVideoRef.current.paused) {
        remoteVideoRef.current
          .play()
          .catch((e) => console.error("Play error:", e));
      }

      socketRef.current.emit("consumer-resume", { 
        serverConsumerId: data.params.id 
      });

    } else{
      console.log("Remote Ref does not exist")
    }
  };  



  useEffect(() => {
    // 1. Initialize Socket ONLY ONCE
    socketRef.current = io(`http://192.168.0.108:3000?username=${username}&roomId=${roomId}`);
    console.log("mediacontrols ", mediaControl)

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current?.id);
      
      if(videoRef.current){
        turnOFFCamera();
        turnOFFMic();
      }
      init();
    });

    socketRef.current.on("new-producer", ({ producerId }) => {
      consumeStream(producerId);
    });

    return () => {
      console.log("Disconnect ", mediaControl)
      socketRef.current?.disconnect();
    };
  }, []);


  // Watch for Toggle + Readiness
  useEffect(() => {
    console.log(mediaControl.camera, " ", isTransportReady);
    if (mediaControl.camera && isTransportReady) {
      console.log("My track ", videoRef.current)
      startVideoBroadcast();
    }
  }, [mediaControl.camera, isTransportReady]);

  useEffect(() => {
    console.log(mediaControl.mic, " ", isTransportReady);
    if (mediaControl.mic && isTransportReady) {
      startAudioBroadcast();
    }
  }, [mediaControl.mic, isTransportReady]);



  return (
    <div
      style={{
        // backgroundColor: "red",
        width: "100%",
        height: "90%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: "5rem",
      }}
    >

      <video ref={videoRef} autoPlay muted playsInline
        style={{ height: "100%", width: "40%", border: "2px solid red" }}
      />

      <video ref={remoteVideoRef} autoPlay playsInline
        style={{ height: "100%", width: "40%", border: "2px solid blue" }}
      />
    </div>
  );
}