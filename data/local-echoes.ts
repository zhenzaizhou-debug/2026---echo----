import type { LocalEcho } from '@/types/echo';

// Local-only fixtures. The later data adapter can replace this module with
// spatial Supabase queries without changing the scene components.
export const LOCAL_ECHOES: LocalEcho[] = [
  { id: 'e01', content: '有些答案，也许只能交给时间。', position: [7.2, 0.04, -108], rotation: 0.08, fade: 0.12, kind: 'stranger' },
  { id: 'e02', content: '如果最后我只是一个普通人怎么办？', position: [12.4, 0.04, -101], rotation: 0.12, fade: 0.22, kind: 'stranger' },
  { id: 'e03', content: '我越来越害怕父母老去。', position: [5.2, 0.038, -94], rotation: -0.16, fade: 0.48, kind: 'stranger' },
  { id: 'e04', content: '离开故乡已经三年，我依然不知道哪里算家。', position: [10.1, 0.04, -87], rotation: 0.04, fade: 0.14, kind: 'historical', era: '1893' },
  { id: 'e05', content: '我不知道以后会不会后悔今天的选择。', position: [14.3, 0.037, -80], rotation: -0.05, fade: 0.34, kind: 'stranger' },
  { id: 'e06', content: '是不是所有的路，都要走过才知道错没错。', position: [6.5, 0.039, -73], rotation: 0.09, fade: 0.67, kind: 'stranger' },
  { id: 'e07', content: '母亲的信越来越短，我却迟迟没有回乡。', position: [11.7, 0.041, -66], rotation: -0.12, fade: 0.3, kind: 'historical', era: '1912' },
  { id: 'e08', content: '我害怕时间比我走得更快。', position: [4.7, 0.036, -59], rotation: 0.15, fade: 0.12, kind: 'stranger' },
  { id: 'e09', content: '今天看起来和昨天一样，可我已经不是昨天的我。', position: [13.8, 0.039, -52], rotation: -0.09, fade: 0.58, kind: 'stranger' },
  { id: 'e10', content: '海那边也有人在想同一个问题吗？', position: [8.6, 0.041, -45], rotation: 0.07, fade: 0.2, kind: 'stranger' },
  { id: 'e11', content: '弟弟已经比我离家时还要高了。', position: [15.2, 0.038, -38], rotation: -0.04, fade: 0.4, kind: 'historical', era: '1937' },
  { id: 'e12', content: '要怎样才算没有辜负这一生？', position: [5.8, 0.04, -31], rotation: 0.13, fade: 0.74, kind: 'stranger' },
  { id: 'e13', content: '我以为长大以后，就会知道答案。', position: [11.1, 0.038, -7], rotation: -0.11, fade: 0.25, kind: 'stranger' },
  { id: 'e14', content: '船明日启程。今夜的月亮和故乡一样。', position: [7.5, 0.041, -2], rotation: 0.05, fade: 0.51, kind: 'historical', era: '1871' },
  { id: 'e15', content: '如果没有人记得，一件事还算发生过吗？', position: [14.2, 0.039, 2], rotation: -0.14, fade: 0.16, kind: 'stranger' },
  { id: 'e16', content: '有些人没有正式告别，就再也见不到了。', position: [6.8, 0.04, 6], rotation: -0.08, fade: 0.08, kind: 'stranger' },
];
