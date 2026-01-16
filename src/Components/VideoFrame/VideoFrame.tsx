import React, { useEffect, useRef, useState } from "react";
import { Device } from "mediasoup-client";
import io, { Socket } from "socket.io-client";
import { RootState } from "../../redux/states/store";
import { mediaState } from "../../types/redux-state-types";
import { useSelector } from "react-redux";

export default function SFUClient({videoRef}: {videoRef: any;}) {
  const mediaControl: mediaState = useSelector((state: RootState)=> state.media);
  const socketRef = useRef<Socket | null>(null); //holds the websocket connection
  const deviceRef = useRef(new Device()); //holds the Device object 
  const sendTransportRef = useRef(null);
  const recvTransportRef = useRef(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Track readiness to avoid race conditions
  const [isTransportReady, setIsTransportReady] = useState(false);

  // Helper for async socket requests
  const request = (type: string, data = {}) => {
    return new Promise((resolve) => {
      socketRef.current?.emit(type, data, resolve);
    });
  };

  const createSendTransport = async () => {
    const data: any = await request("createWebRtcTransport", { sender: true });
    if (data.error) throw new Error(data.error);

    const transport = deviceRef.current.createSendTransport(data.params);
    sendTransportRef.current = transport;

    transport.on("connect", ({ dtlsParameters }, callback, errback) => {
      request("transport-connect", {
        dtlsParameters,
        transportId: transport.id,
      })
        .then(callback)
        .catch(errback);
    });

    transport.on(
      "produce",
      ({ kind, rtpParameters, appData }, callback, errback) => {
        request("transport-produce", {
          kind,
          rtpParameters,
          transportId: transport.id,
        })
          .then(({ id }: any) => callback({ id }))
          .catch(errback);
      }
    );
  };

  const createRecvTransport = async () => {
    if (data.error) throw new Error(data.error);

    const transport = deviceRef.current.createRecvTransport(data.params);
    recvTransportRef.current = transport;

    transport.on("connect", ({ dtlsParameters }, callback, errback) => {
      request("transport-connect", {
        dtlsParameters,
        transportId: transport.id,
      })
        .then(callback)
        .catch(errback);
    });
  };  

  const init = async () => {
    try {
      const routerRtpCapabilities = await request("getRouterRtpCapabilities");

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

      setIsTransportReady(true); // Signal ready!
    } catch (error) {
      console.error("Init failed:", error);
    }
  };

  const consumeStream = async (producerId: string) => {
    const { rtpCapabilities } = deviceRef.current;

    const data: any = await request("consume", {
      producerId,
      rtpCapabilities,
      transportId: recvTransportRef.current.id,
    });

    const consumer = await recvTransportRef.current.consume({
      id: data.params.id,
      producerId: data.params.producerId,
      kind: data.params.kind,
      rtpParameters: data.params.rtpParameters,
    });

    const stream = new MediaStream();
    stream.addTrack(consumer.track);

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
      // Important: Play the video explicitly after assigning stream
      remoteVideoRef.current
        .play()
        .catch((e) => console.error("Play error:", e));
    }
  };  

  const startBroadcast = async () => {
    console.log("startBroadcast");
    console.log("videoRef.current ", videoRef.current);
    console.log("videoRef.current.srcObject ", videoRef.current.srcObject);
    if (!videoRef.current || !videoRef.current.srcObject) return;

    const stream = videoRef.current.srcObject as MediaStream;
    const track = stream.getVideoTracks()[0];

    try {
      await sendTransportRef.current.produce({ track });
      console.log("Publishing video...");
    } catch (err) {
      console.error("Publishing failed", err);
    }
  };


  useEffect(() => {
    // 1. Initialize Socket ONLY ONCE
    socketRef.current = io("http://localhost:3000");

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current?.id);
      init();
    });

    socketRef.current.on("new-producer", ({ producerId }) => {
      consumeStream(producerId);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  

  // Watch for Toggle + Readiness
  useEffect(() => {
    console.log(mediaControl.camera, " ", isTransportReady);
    if (mediaControl.camera && isTransportReady) {
      startBroadcast();
    }
  }, [mediaControl.camera, isTransportReady]);



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
