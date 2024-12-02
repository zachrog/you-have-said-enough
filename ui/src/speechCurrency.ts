export type SpeechUser = {
  peerId: string;
  audioContext: AudioContext;
  stream: MediaStream;
  analyser: AnalyserNode;
  source: MediaStreamAudioSourceNode;
  speechData: Uint8Array;
  timeLeft: number;
  scalar: number; // Proportion between 0-1
  isTalking: boolean;
};

class SpeechCurrency {
  audioWindow = 5000;
  private lastSpeechSample: number = 0;
  private userMap: Map<string, SpeechUser> = new Map();
  constructor() {}

  clear() {
    this.userMap.forEach((user) => {
      user.audioContext.close().catch((e) => console.error(e));
    });
    this.userMap = new Map();
  }

  async addUser({ peerId, stream }: { peerId: string; stream: MediaStream }) {
    if (!stream.active) {
      // Remote streams have their audio tracks added later on
      await new Promise<void>((resolve) => {
        function WaitForAudioTracks() {
          resolve();
          stream.removeEventListener("audioTrackAdded", WaitForAudioTracks);
        }
        stream.addEventListener("audioTrackAdded", WaitForAudioTracks);
      });
    }
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    const speechData = new Uint8Array(analyser.fftSize);
    source.connect(analyser);

    this.userMap.set(peerId, {
      analyser,
      peerId,
      audioContext,
      source,
      stream,
      speechData,
      timeLeft: this.audioWindow,
      isTalking: false,
      scalar: 1,
    });
  }

  changeMic({ peerId }: { peerId: string }): void {
    // Only the local stream should need this as remote streams do not have audio tracks changee.
    const localUser = this.userMap.get(peerId);
    if (!localUser) {
      console.log("No local user to change mic for");
      return;
    }
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(localUser.stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    localUser.audioContext = audioContext;
    localUser.source = source;
    localUser.analyser = analyser;
  }

  removeUser(peerId: string) {
    const user = this.userMap.get(peerId);
    if (!user) {
      console.log(`No user to remove from speech history ${peerId}`);
      return;
    }

    user.audioContext.close().catch((e) => console.error(e));
    this.userMap.delete(peerId);
  }

  getRoomScale(): Map<string, SpeechUser> {
    const timeSinceLastSample = performance.now() - this.lastSpeechSample;
    const timeToDonate = timeSinceLastSample / (this.userMap.size - 1);

    // Check if each user is talking and donate time to other users if they are
    this.userMap.forEach((speakingUser) => {
      const bufferLength = speakingUser.analyser.fftSize;
      speakingUser.analyser.getByteTimeDomainData(speakingUser.speechData);

      // Calculate the average audio level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const value = speakingUser.speechData[i] / 128 - 1;
        sum += value * value;
      }
      const average = Math.sqrt(sum / bufferLength);

      const isTalking = average > 0.01;
      speakingUser.isTalking = isTalking;
      if (
        !speakingUser.isTalking ||
        speakingUser.timeLeft <= timeSinceLastSample
      ) {
        return;
      }

      // Donte time to each user
      this.userMap.forEach((peer) => {
        if (peer.peerId === speakingUser.peerId) {
          peer.timeLeft = peer.timeLeft - timeSinceLastSample;
          return;
        }
        peer.timeLeft = peer.timeLeft + timeToDonate;
      });
    });

    // Find the maximum time in the group
    let maxTimeLeft = 0;
    this.userMap.forEach((user) => {
      if (user.timeLeft > maxTimeLeft) maxTimeLeft = user.timeLeft;
    });

    // Set scalar values
    this.userMap.forEach((user) => {
      user.scalar = Math.min(Math.max(user.timeLeft / maxTimeLeft, 0), 1); // Clamp values betwen 0 and 1
    });

    this.lastSpeechSample = performance.now();
    return this.userMap;
  }
}

export const speechCurrency = new SpeechCurrency();

/*
Needs to be able to hold context of all participants 
Should be able to track what the scaling proportion is of all participants

# Speech currency. There is a total amount of speaking currency in the room. It is traded around as you talk.
3 people start the conversation and each have 5s of talking time

As one person speaks they donate all of their speech to others. Below is the "currency" of each member 

Person 1: 0s;
Person 2: 7.5s;
Person 3: 7.5s;

The only way to gain speech currency back is by having other people talk. Below is the currency if Person 2 were to talk for 5s.

Person 1: 2.5s;
Person 2: 2.5s;
Person 3: 10s;


The scaling prop
Person 3: 10s -> 100%;ortion can work in two different ways.
Option 1 is by saying the audio window is the maximum scaling percentage. If you go over the audioWindow then you just stay at 100%
Person 1: 2.5s -> 50%;
Person 2: 5.0s -> 100%;

Option 2 is by saying the scaling value of 100% is determined by whoever has the most speech in the room, everyone else is a percentage of that.
Person 1: 2.5s -> 25%;
Person 3: 3.333s -> 33.33%;
Person 2: 5.0s -> 50%;
Person 4: 10s -> 100%;


- Determine if user was talking
  - If user was not talking do nothing
  - If user was talking deduct the amount they were talking from themselves and give to all other members
- Once all times have been added find the person with the most speech.
- Divide each users speech by the user with the most speech to get scalar value.


*/
