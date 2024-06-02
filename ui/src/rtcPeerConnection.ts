import { sendWebSocket } from "./socketClient";

type VideoPeerConnection = {
  peerId: string;
  remoteMediaStream: MediaStream;
  rtcPeerConnection: RTCPeerConnection;
};

class RtcPeerConnectionManager {
  private videoPeerConnections: Map<string, VideoPeerConnection> = new Map();
  private iceServers = {
    iceServers: [
      {
        urls: [
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };
  private localMediaStream: MediaStream;

  constructor() {}

  setLocalMediaStream({
    localMediaStream,
  }: {
    localMediaStream: MediaStream;
  }): void {
    this.localMediaStream = localMediaStream;
  }

  getLocalMediaStream(): MediaStream {
    return this.localMediaStream;
  }

  get({ peerId }: { peerId: string }): RTCPeerConnection {
    const peerConnection = this.videoPeerConnections.get(peerId);
    if (!peerConnection) {
      throw new Error(`Could net get peer connection: ${peerId}`);
    }
    return peerConnection.rtcPeerConnection;
  }

  createRtcPeerConnection({
    peerId,
    myConnectionId,
  }: {
    peerId: string;
    myConnectionId: string;
  }): RTCPeerConnection {
    const rtcPeerConnection = new RTCPeerConnection(this.iceServers);
    this.localMediaStream.getTracks().forEach((track) => {
      rtcPeerConnection.addTrack(track, this.localMediaStream);
    });

    rtcPeerConnection.addEventListener("icecandidate", (event) => {
      console.log("e found ice candy");
      if (event.candidate) {
        sendWebSocket({
          action: "newIceCandidate",
          to: peerId,
          from: myConnectionId,
          data: event.candidate,
        });
      }
    });

    rtcPeerConnection.addEventListener("connectionstatechange", () => {
      console.log("stateChange: ", rtcPeerConnection.connectionState);
      console.log(rtcPeerConnection);
    });

    const remoteMediaStream = new MediaStream();
    this.videoPeerConnections.set(peerId, {
      peerId,
      rtcPeerConnection,
      remoteMediaStream,
    });

    rtcPeerConnection.ontrack = (event) => {
      console.log(`ontrack event. peerId: ${peerId}`);
      event.streams[0].getTracks().forEach((track) => {
        remoteMediaStream.addTrack(track);
      });
    };

    return rtcPeerConnection;
  }

  getRemoteMediaStreams(): MediaStream[] {
    return Array.from(this.videoPeerConnections).map(
      ([_peerId, peerConnection]) => peerConnection.remoteMediaStream
    );
  }
}

export const rtcPeerConnectionManager = new RtcPeerConnectionManager();
