import { SocketClient } from "@/socketClient";

export type VideoPeerConnection = {
  peerId: string;
  remoteMediaStream: MediaStream;
  rtcPeerConnection: RTCPeerConnection;
  remoteIceCandidates: RTCIceCandidateInit[];
  readyToForwardRemoteIceCandidates: boolean;
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
  private localMediaStream: MediaStream; // Ignore for now. We should create this ASAP
  listeners: Function[] = [];

  constructor() {}

  setLocalMediaStream({
    localMediaStream,
  }: {
    localMediaStream: MediaStream;
  }): void {
    this.localMediaStream = localMediaStream;
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
    roomId,
    socketClient,
  }: {
    peerId: string;
    myConnectionId: string;
    roomId: string;
    socketClient: SocketClient;
  }): RTCPeerConnection {
    const rtcPeerConnection = new RTCPeerConnection(this.iceServers);
    this.localMediaStream.getTracks().forEach((track) => {
      rtcPeerConnection.addTrack(track, this.localMediaStream);
    });

    rtcPeerConnection.addEventListener("icecandidate", async (event) => {
      if (event.candidate) {
        socketClient.sendMessage({
          roomId: roomId,
          action: "newIceCandidate",
          to: peerId,
          from: myConnectionId,
          data: event.candidate,
        });
      }
    });

    rtcPeerConnection.addEventListener("connectionstatechange", () => {
      if (rtcPeerConnection.connectionState === "failed") {
        rtcPeerConnection.close();
        this.videoPeerConnections.delete(peerId);
        for (let index = 0; index < this.listeners.length; index++) {
          const listener = this.listeners[index];
          listener();
        }
      }
    });

    const remoteMediaStream = new MediaStream();
    this.videoPeerConnections.set(peerId, {
      peerId,
      rtcPeerConnection,
      remoteMediaStream,
      readyToForwardRemoteIceCandidates: false,
      remoteIceCandidates: [],
    });
    this.listeners.forEach((listener) => listener());

    rtcPeerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteMediaStream.addTrack(track);
        const eventName =
          track.kind === "audio" ? "audioTrackAdded" : "videoTrackAdded";
        remoteMediaStream.dispatchEvent(new Event(eventName));
      });
    };

    return rtcPeerConnection;
  }

  getPeerConnections() {
    return Array.from(this.videoPeerConnections).map(
      ([_peerId, peerConnection]) => peerConnection
    );
  }

  setReadyToForwardRemoteIceCandidates({
    peerId,
    isReady,
  }: {
    peerId: string;
    isReady: boolean;
  }) {
    const rtcPeerConnection = this.videoPeerConnections.get(peerId);
    if (!rtcPeerConnection) {
      throw new Error("could not get video peer connection ");
    }
    rtcPeerConnection.readyToForwardRemoteIceCandidates = isReady;
  }

  addIceCandidates({
    peerId,
    iceCandidate,
  }: {
    peerId: string;
    iceCandidate: RTCIceCandidateInit;
  }) {
    const rtcPeerConnection = this.videoPeerConnections.get(peerId);
    if (!rtcPeerConnection) {
      throw new Error("could not get video peer connection ");
    }
    rtcPeerConnection.remoteIceCandidates.push(iceCandidate);
  }

  closePeerConnection(peerId: string) {
    const peerConnection = this.videoPeerConnections.get(peerId);
    if (!peerConnection) {
      console.log("No peer connection to close: ", peerId);
      return;
    }

    peerConnection.rtcPeerConnection.close();
    this.videoPeerConnections.delete(peerId);
    this.listeners.forEach((listener) => listener());

  }

  async drainIceCandidates({ peerId }: { peerId: string }): Promise<void> {
    const peer = this.videoPeerConnections.get(peerId);
    if (!peer) {
      throw new Error("could not get video peer connection ");
    }
    if (!peer.readyToForwardRemoteIceCandidates) return;
    await Promise.all(
      peer.remoteIceCandidates.map(async (iceCandidate) => {
        try {
          await peer.rtcPeerConnection.addIceCandidate(iceCandidate);
        } catch (e) {
          console.log("ice candidate error:", e);
        }
      })
    );
    peer.remoteIceCandidates = [];
  }
}

export const rtcPeerConnectionManager = new RtcPeerConnectionManager();
