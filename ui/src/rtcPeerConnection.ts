import { sendWebSocket } from "./socketClient";

class RtcPeerConnectionManager {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private _peerConnectionListeners: ((
    rtcPeerConnection: RTCPeerConnection
  ) => void)[] = [];
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

  constructor() {}

  get({ peerId }: { peerId: string }): RTCPeerConnection {
    const peerConnection = this.peerConnections.get(peerId);
    if (!peerConnection) {
      throw new Error(`Could net get peer connection: ${peerId}`);
    }
    return peerConnection;
  }

  async createRtcPeerConnection({
    peerId,
    myConnectionId,
  }: {
    peerId: string;
    myConnectionId: string;
  }): Promise<RTCPeerConnection> {
    const rTCPeerConnection = new RTCPeerConnection(this.iceServers);

    rTCPeerConnection.onicecandidate = (event) => {
      console.log("e found ice candy");
      if (event.candidate) {
        sendWebSocket({
          action: "newIceCandidate",
          to: peerId,
          from: myConnectionId,
          data: event.candidate,
        });
      }
    };

    this.peerConnections.set(peerId, rTCPeerConnection);
    await Promise.all(
      this._peerConnectionListeners.map((fun) => fun(rTCPeerConnection))
    );
    return rTCPeerConnection;
  }

  async onCreateRtcPeerConnection(
    listener: (rtcPeerConnection: RTCPeerConnection) => void
  ) {
    this._peerConnectionListeners.push(listener);
  }
}

export const rtcPeerConnectionManager = new RtcPeerConnectionManager();
