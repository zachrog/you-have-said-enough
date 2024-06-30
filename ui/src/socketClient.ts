export type ClientWebsocketMessage = {
  action:
    | "newOffer"
    | "newAnswer"
    | "newIceCandidate"
    | "yourConnectionId"
    | "newUserJoined";
  to: string;
  from: string;
  data: any;
};
