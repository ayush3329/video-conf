import { Socket } from "socket.io-client";

export interface SFUInterface {
  videoRef: React.RefObject<HTMLVideoElement|null>;
  roomId: string | null;
  username: string | null;
  socketRef: React.MutableRefObject<Socket | null>;
  streamRef: React.RefObject<MediaStream>
}

// Data structure for a remote user
export interface RemotePeer {

  socketId: string;
  username: string;
  
  videoPaused: boolean;
  audioPaused: boolean;

  videoStream: MediaStream | null;
  audioStream: MediaStream | null;

  videoConsumer: any | null; // Mediasoup consumer object
  audioConsumer: any | null; // Mediasoup consumer object
  
}