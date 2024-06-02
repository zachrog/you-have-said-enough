import { sendWebSocket } from "./socketClient";

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

export const rTCPeerConnections: Map<string, RTCPeerConnection> = new Map();

export function createRTCPeerConnection(
  peerId: string,
  myConnectionId: string
) {
  const rTCPeerConnection = new RTCPeerConnection(servers);

  rTCPeerConnection.addEventListener("icecandidate", (event) => {
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
  rTCPeerConnections.set(peerId, rTCPeerConnection);
  return rTCPeerConnection;
}
