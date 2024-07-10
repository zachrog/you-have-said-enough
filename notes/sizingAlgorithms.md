# Standard Video Size. Speech Compared to all others. Inversely proportional to total time talked

Analyze how many seconds someone is speaking over a certain window, in this case 30s. Example calculation below.

TimeSpentTalking/TotalTime
Person 1: 21s/30s
Person 2: 15s/30s
Person 3: 0s/30s
Person 4: 0s/30s

Add total time spent talking for all participants together
21s + 15s + 0s + 0s = 36s of talking

Determine percentage of total time talked that a person was talking
21/36=0.5833
15/36=0.4166
0/36=0
0/36=0

Create an inverse proportion
1 - 0.5833 = .4166
1 - 0.4166 = .5833
1 - 0 = 1
1 - 0 = 1

Apply These values as scalars to video size and volume
Person 1 size: 41.66% of normal
Person 2 size: 58.33% of normal
Person 3 size: 100% of normal
Person 4 size: 100% of normal

## Implications

- More difficult to implement as there needs to be a central statistics gathering area.
- If many people are speaking at once they would balance each other out.

# Standard Video size. Time talking only compared to total time.

TimeSpentTalking/TotalTime
Person 1: 21s/30s
Person 2: 15s/30s
Person 3: 0s/30s
Person 4: 0s/30s

Determine percentage baseed on total time
21/30=0.7
15/30=0.5
0/30=0
0/30=0

Create an inverseProportion
1 - 0.7 = 0.3
1 - 0.5 = 0.5
1 - 0 = 1
1 - 0 = 1

Apply These values as scalars to video size and volume
Person 1 size: 0.3% of normal
Person 2 size: 0.5% of normal
Person 3 size: 100% of normal
Person 4 size: 100% of normal

## Implications

- Simple to implement as you would not need to gather statistics from all video feeds to determine size

# Apply the scaling value for the entire duration.

Monitor speech over 30s.

Determine percentage of total time talked that a person was talking
21/30=0.7

Create an inverseProportion
1 - 0.7 = 0.3

Apply the scaling dduring the next monitoring window
So apply 0.3 scaling to audio/video during next session.

# Hogger/Facilitator

- One person talking for all the time is bad, they are hogging the airtime and need to be debuffed
- A contributor that talks a lot, but also gets other people to contribute is perhaps a good thing.
- Someone facilitating conversation can remain a loud/large particpant

- To implement you can build some sort of conversation graph:
- Time spent talking continuously accumulates. When the talking finishes that accumlation is packaged and becomes a node
- it gets attached to the next N number of talkers.
- Nodes outside the window get removed from the graph
- Assess the graph in some way XD to see who the hogs/facilators are and debuff accordingly
- In some way : divide time by connectedness, and do and weighted average of all participants
