# Data Merging

实现一个`Data Merging`函数，可以将传入的`list`数组`user`值相同的对象，将他们的属性合并在一起

如将下面的`list`进行合并

```ts
[
  { user: 8, duration: 50, equipment: ['bench'] },
  { user: 7, duration: 150, equipment: ['dumbbell'] },
  { user: 1, duration: 10, equipment: ['barbell'] },
  { user: 7, duration: 100, equipment: ['bike', 'kettlebell'] },
  { user: 7, duration: 200, equipment: ['bike'] },
  { user: 2, duration: 200, equipment: ['treadmill'] },
  { user: 2, duration: 200, equipment: ['bike'] },
];

mergeData(sessions);
// [
//   { user: 8, duration: 50, equipment: ['bench'] },
//   { user: 7, duration: 450, equipment: ['bike', 'dumbbell', 'kettlebell'] },
//   { user: 1, duration: 10, equipment: ['barbell'] },
//   { user: 2, duration: 400, equipment: ['bike', 'treadmill'] },
// ];

```

## Solution

本题的关键在于使用一个`map`结构将其合并之后的数据存储起来，在遍历时首先判断当前对象是否存在，如果不存在，则添加到`map`中，如果存在，则将其取出并与当前的数据进行合并，然后继续保存在`map`中

```ts
type Session = { user: number; duration: number; equipment: Array<string> };

export default function mergeData(sessions: Array<Session>): Array<Session> {
  const results: Array<{
    user: number;
    duration: number;
    equipment: Set<string>;
  }> = [];
  const sessionsForUser = new Map();

  sessions.forEach((session) => {
    if (sessionsForUser.has(session.user)) {
      const userSession = sessionsForUser.get(session.user);
      userSession.duration += session.duration;
      session.equipment.forEach((equipment) => {
        userSession.equipment.add(equipment);
      });
    } else {
      const clonedSession = {
        ...session,
        equipment: new Set(session.equipment),
      };
      sessionsForUser.set(session.user, clonedSession);
      results.push(clonedSession);
    }
  });

  // Sort equipment of each session and convert back into array.
  return results.map((session) => ({
    ...session,
    equipment: Array.from(session.equipment).sort(),
  }));
}

```
