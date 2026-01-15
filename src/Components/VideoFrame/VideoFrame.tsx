import React, { useEffect, useRef, useState } from "react";
import { Device } from "mediasoup-client";
import io, { Socket } from "socket.io-client";
import { RootState } from "../../redux/states/store";
import { mediaState } from "../../types/redux-state-types";
import { useSelector } from "react-redux";

export default function SFUClient({videoRef}: {videoRef: any;}) {
  const mediaControl: mediaState = useSelector((state: RootState)=> state.media);
  const socketRef = useRef<Socket | null>(null); //holds the websocket connection
  const deviceRef = useRef(new Device());
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
    const data: any = await request("createWebRtcTransport", { sender: false });
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
      console.log("routerRtpCapabilities ",routerRtpCapabilities);

      if (!deviceRef.current.loaded) {
        await deviceRef.current.load({ routerRtpCapabilities: routerRtpCapabilities as any,});
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
