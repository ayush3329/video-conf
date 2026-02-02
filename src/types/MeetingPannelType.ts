export interface SFUInterface {
  videoRef: React.RefObject<HTMLVideoElement|null>;
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