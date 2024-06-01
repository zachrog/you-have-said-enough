import { sendWebSocket } from "./socketClient";

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

export const rTCPeerConnnection = new RTCPeerConnection(servers);

rTCPeerConnnection.addEventListener("connectionstatechange", () => {
  console.log("connectionstate:", rTCPeerConnnection.connectionState);
});

rTCPeerConnnection.addEventListener("icecandidate", (event) => {
  if (event.candidate) {
    sendWebSocket({ action: "newIceCandidate", data: event.candidate });
  }
});
