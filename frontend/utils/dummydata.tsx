// src/utils/dummyData.js
export const stories = [
  {
    id: 1,
    name: 'Your Story',
    image: { uri: 'https://randomuser.me/api/portraits/women/44.jpg' },
    isLive: false,
    hasUnseen: false,
  },
  {
    id: 2,
    name: 'Emma',
    image: { uri: 'https://randomuser.me/api/portraits/women/68.jpg' },
    isLive: true,
    hasUnseen: true,
  },
  {
    id: 3,
    name: 'Chris',
    image: { uri: 'https://randomuser.me/api/portraits/men/32.jpg' },
    isLive: false,
    hasUnseen: true,
  },
  {
    id: 4,
    name: 'Jennifer',
    image: { uri: 'https://randomuser.me/api/portraits/women/65.jpg' },
    isLive: false,
    hasUnseen: false,
  },
  {
    id: 5,
    name: 'Tom',
    image: { uri: 'https://randomuser.me/api/portraits/men/75.jpg' },
    isLive: true,
    hasUnseen: true,
  },
];

export const trendingCelebrities = [
  {
    id: 1,
    name: 'Tom H.',
    image: { uri: 'https://www.placecage.com/200/200' },
  },
  {
    id: 2,
    name: 'Beyoncé',
    image: { uri: 'https://www.placecage.com/201/201' },
  },
  {
    id: 3,
    name: 'Dwayne J.',
    image: { uri: 'https://www.placecage.com/202/202' },
  },
  {
    id: 4,
    name: 'Taylor S.',
    image: { uri: 'https://www.placecage.com/203/203' },
  },
  {
    id: 5,
    name: 'Leonardo D.',
    image: { uri: 'https://www.placecage.com/204/204' },
  },
];

export const events = [
  {
    id: 1,
    title: 'Movie Premiere',
    date: '2023-06-15T19:00:00',
    location: 'Hollywood, CA',
    image: { uri: 'https://picsum.photos/600/400?random=1' },
    attending: 1245,
  },
  {
    id: 2,
    title: 'Music Awards',
    date: '2023-06-20T20:00:00',
    location: 'Los Angeles, CA',
    image: { uri: 'https://picsum.photos/600/400?random=2' },
    attending: 3560,
  },
];

export const posts = [
  {
    id: 1,
    user: {
      id: 1,
      name: 'Jennifer L.',
      avatar: { uri: 'https://randomuser.me/api/portraits/women/44.jpg' },
      verified: true,
    },
    content: 'Just finished shooting my new movie! Can\'t wait for you all to see it.',
    image: { uri: 'https://picsum.photos/600/600?random=3' },
    likes: 2456,
    comments: 189,
    shares: 56,
    timeAgo: '2h ago',
  },
  {
    id: 2,
    user: {
      id: 2,
      name: 'Chris E.',
      avatar: { uri: 'https://randomuser.me/api/portraits/men/32.jpg' },
      verified: false,
    },
    content: 'Had an amazing time at the charity event yesterday. Thanks to everyone who came out to support!',
    image: null,
    likes: 876,
    comments: 45,
    shares: 12,
    timeAgo: '5h ago',
  },
  {
    id: 3,
    user: {
      id: 3,
      name: 'Emma W.',
      avatar: { uri: 'https://randomuser.me/api/portraits/women/68.jpg' },
      verified: true,
    },
    content: 'New single dropping next week! Here\'s a little preview...',
    image: { uri: 'https://picsum.photos/600/600?random=4' },
    likes: 5321,
    comments: 423,
    shares: 210,
    timeAgo: '1d ago',
  },
];