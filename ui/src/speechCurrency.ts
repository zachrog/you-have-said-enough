type SpeechUser = {
  peerId: string;
  audioContext: AudioContext;
  stream: MediaStream;
  analyser: AnalyserNode;
  source: MediaStreamAudioSourceNode;
  speechData: Uint8Array;
};

type SpeechOutput = {
  scalar: number; // Proportion between 0-1
  isTalking: boolean;
  peerId: string;
};

class SpeechCurrency {
  private userMap: Map<string, SpeechUser> = new Map();
  constructor() {}

  reset() {}

  speak() {}

  addUser({ peerId, stream }: { peerId: string; stream: MediaStream }) {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    stream.addEventListener("audioTrackAdded", () => {
      // console.log("Audio track replace detected");
      // Should We do something when the user changes microphones?
    });
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
    });

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

  getRoomScale(): Map<string, SpeechOutput> {
    const roomScale: Map<string, SpeechOutput> = new Map();
    this.userMap.forEach((user) => {
      const bufferLength = user.analyser.fftSize;
      user.analyser.getByteTimeDomainData(user.speechData);

      // Calculate the average audio level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const value = user.speechData[i] / 128 - 1;
        sum += value * value;
      }
      const average = Math.sqrt(sum / bufferLength);

      const isTalking = average > 0.01;
      roomScale.set(user.peerId, { isTalking, peerId: user.peerId, scalar: 1 });
    });
    return roomScale;
  }

  speechTick() {}
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


The scaling proportion can work in two different ways.
Option 1 is by saying the audio window is the maximum scaling percentage. If you go over the audioWindow then you just stay at 100%
Person 1: 2.5s -> 50%;
Person 2: 5.0s -> 100%;
Person 3: 10s -> 100%;

Option 2 is by saying the scaling value of 100% is determined by whoever has the most speech in the room, everyone else is a percentage of that.
Person 1: 2.5s -> 25%;
Person 3: 3.333s -> 33.33%;
Person 2: 5.0s -> 50%;
Person 4: 10s -> 100%;








Could make Video Component "smart" or "dumb"
Dumb
- stream, local, scaling proportion, isTalking

Smart
- stream, local, AudioStyle?(Speech currency, or time based)

If dumb then it should be easier to reuse the video component but then all of the logic of creating audio windows gets moved to the parent which is not ideal.

*/
