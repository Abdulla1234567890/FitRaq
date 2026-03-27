export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type JourneyTemplate = 'cycling' | 'foot';

export type ActivityType = {
  hero: {
    label: string;
  };
  icon: string;
  id: string;
  label: string;
  primaryLabels: [string, string, string];
  secondaryLabels: string[];
  template: JourneyTemplate;
};

export type Trail = {
  area: string;
  description: string;
  difficulty: string;
  distanceKm: number;
  estimatedTime: string;
  gallery: {
    caption: string;
    image: number;
  }[];
  id: string;
  route: Coordinate[];
  title: string;
  type: string;
};

export const ACTIVITY_TYPES: ActivityType[] = [
  {
    id: 'cycling',
    icon: 'bike-fast',
    label: 'Cycling',
    hero: {
      label: 'Speed km/h',
    },
    template: 'cycling',
    primaryLabels: ['Distance km', 'Ride time', 'AVG km/h'],
    secondaryLabels: ['Cadence rpm', 'Climb m'],
  },
  {
    id: 'running',
    icon: 'run-fast',
    label: 'Running',
    hero: {
      label: 'Pace /km',
    },
    template: 'foot',
    primaryLabels: ['Distance km', 'Run time', 'AVG pace'],
    secondaryLabels: ['Steps', 'Calories', 'Elevation m'],
  },
  {
    id: 'walking',
    icon: 'walk',
    label: 'Walking',
    hero: {
      label: 'Speed km/h',
    },
    template: 'foot',
    primaryLabels: ['Distance km', 'Walk time', 'AVG km/h'],
    secondaryLabels: ['Steps', 'Calories', 'Elevation m'],
  },
  {
    id: 'hiking',
    icon: 'hiking',
    label: 'Hiking',
    hero: {
      label: 'Speed km/h',
    },
    template: 'foot',
    primaryLabels: ['Distance km', 'Hike time', 'AVG km/h'],
    secondaryLabels: ['Steps', 'Calories', 'Elevation m'],
  },
];

export const TRAILS: Trail[] = [
  {
    id: 'run-downtown-loop',
    type: 'running',
    title: 'Downtown Speed Loop',
    area: 'Downtown Dubai',
    distanceKm: 6.4,
    estimatedTime: '34 min',
    difficulty: 'Moderate',
    description: 'Fast city loop with long straights and smooth pace segments.',
    gallery: [
      { image: require('@/assets/images/Downtown_Dubai.jpg'), caption: 'Skyline start' },
      { image: require('@/assets/images/Running.png'), caption: 'Straight pace segment' },
      { image: require('@/assets/images/Running.png'), caption: 'Finish beside the boulevard' },
    ],
    route: [
      { latitude: 25.2018, longitude: 55.2682 },
      { latitude: 25.2042, longitude: 55.2728 },
      { latitude: 25.2073, longitude: 55.2754 },
      { latitude: 25.209, longitude: 55.2798 },
      { latitude: 25.2114, longitude: 55.2834 },
    ],
  },
  {
    id: 'run-canal-tempo',
    type: 'running',
    title: 'Canal Tempo Route',
    area: 'Business Bay',
    distanceKm: 8.1,
    estimatedTime: '43 min',
    difficulty: 'Moderate',
    description: 'Waterfront route suited for tempo efforts and progression runs.',
    gallery: [
      { image: require('@/assets/images/Creek.jpg'), caption: 'Canal warm-up stretch' },
      { image: require('@/assets/images/Running.png'), caption: 'Tempo-ready waterfront lane' },
      { image: require('@/assets/images/Running.png'), caption: 'Night lights on the cool-down' },
    ],
    route: [
      { latitude: 25.1908, longitude: 55.2551 },
      { latitude: 25.1935, longitude: 55.2592 },
      { latitude: 25.1971, longitude: 55.2626 },
      { latitude: 25.2001, longitude: 55.2673 },
      { latitude: 25.2034, longitude: 55.2718 },
    ],
  },
  {
    id: 'walk-marina-stroll',
    type: 'walking',
    title: 'Marina Evening Stroll',
    area: 'Dubai Marina',
    distanceKm: 3.2,
    estimatedTime: '39 min',
    difficulty: 'Easy',
    description: 'Relaxed flat route with easy turns and steady walking segments.',
    gallery: [
      { image: require('@/assets/images/Walking.png'), caption: 'Waterfront entrance' },
      { image: require('@/assets/images/Walking.png'), caption: 'Easy shaded boardwalk' },
      { image: require('@/assets/images/Walking.png'), caption: 'Sunset finish by the marina' },
    ],
    route: [
      { latitude: 25.1976, longitude: 55.2641 },
      { latitude: 25.1985, longitude: 55.2664 },
      { latitude: 25.1994, longitude: 55.2689 },
      { latitude: 25.2008, longitude: 55.2702 },
      { latitude: 25.2021, longitude: 55.272 },
    ],
  },
  {
    id: 'walk-creek-boardwalk',
    type: 'walking',
    title: 'Creek Boardwalk',
    area: 'Al Seef',
    distanceKm: 4.5,
    estimatedTime: '55 min',
    difficulty: 'Easy',
    description: 'Scenic heritage walk with open views and slower cruising pace.',
    gallery: [
      { image: require('@/assets/images/Walking.png'), caption: 'Heritage side start' },
      { image: require('@/assets/images/Walking.png'), caption: 'Quiet creekside stretch' },
      { image: require('@/assets/images/Walking.png'), caption: 'Boardwalk finish with open views' },
    ],
    route: [
      { latitude: 25.2621, longitude: 55.3016 },
      { latitude: 25.2632, longitude: 55.3044 },
      { latitude: 25.2645, longitude: 55.3076 },
      { latitude: 25.2661, longitude: 55.3111 },
      { latitude: 25.2673, longitude: 55.3139 },
    ],
  },
  {
    id: 'cycle-al-qudra',
    type: 'cycling',
    title: 'Al Qudra Speed Track',
    area: 'Al Qudra',
    distanceKm: 15,
    estimatedTime: '30 min',
    difficulty: 'Moderate',
    description: 'Wide open ride with strong cadence sections and steady speed.',
    gallery: [
      { image: require('@/assets/images/Cycling.png'), caption: 'Open desert start' },
      { image: require('@/assets/images/Cycling.png'), caption: 'Long cadence-friendly straight' },
      { image: require('@/assets/images/Cycling.png'), caption: 'Fast return section' },
    ],
    route: [
      { latitude: 24.9152, longitude: 55.3731 },
      { latitude: 24.9195, longitude: 55.3792 },
      { latitude: 24.9242, longitude: 55.3866 },
      { latitude: 24.9298, longitude: 55.3928 },
      { latitude: 24.9344, longitude: 55.3999 },
    ],
  },
  {
    id: 'cycle-jumeirah-coast',
    type: 'cycling',
    title: 'Jumeirah Coast Ride',
    area: 'Jumeirah',
    distanceKm: 22.4,
    estimatedTime: '49 min',
    difficulty: 'Moderate',
    description: 'Coastal spin with cleaner straights and lighter turns.',
    gallery: [
      { image: require('@/assets/images/Cycling.png'), caption: 'Beachfront rollout' },
      { image: require('@/assets/images/Cycling.png'), caption: 'Coastal speed section' },
      { image: require('@/assets/images/Cycling.png'), caption: 'Smooth city return' },
    ],
    route: [
      { latitude: 25.1704, longitude: 55.2142 },
      { latitude: 25.1741, longitude: 55.2205 },
      { latitude: 25.1772, longitude: 55.2263 },
      { latitude: 25.1819, longitude: 55.2321 },
      { latitude: 25.1861, longitude: 55.2382 },
    ],
  },
  {
    id: 'hike-hatta-ridge',
    type: 'hiking',
    title: 'Hatta Ridge Trail',
    area: 'Hatta',
    distanceKm: 8.7,
    estimatedTime: '1h 42m',
    difficulty: 'Challenging',
    description: 'Rocky climbing trail with elevation and panoramic ridge views.',
    gallery: [
      { image: require('@/assets/images/Hiking.png'), caption: 'Trailhead approach' },
      { image: require('@/assets/images/Hiking.png'), caption: 'Ridge climb section' },
      { image: require('@/assets/images/Hiking.png'), caption: 'Panoramic lookout finish' },
    ],
    route: [
      { latitude: 24.8124, longitude: 56.1181 },
      { latitude: 24.8142, longitude: 56.1218 },
      { latitude: 24.8167, longitude: 56.1262 },
      { latitude: 24.8193, longitude: 56.1297 },
      { latitude: 24.8215, longitude: 56.1339 },
    ],
  },
  {
    id: 'hike-mountain-wadi',
    type: 'hiking',
    title: 'Mountain Wadi Trek',
    area: 'Ras Al Khaimah',
    distanceKm: 10.2,
    estimatedTime: '2h 08m',
    difficulty: 'Challenging',
    description: 'Longer trek with uneven terrain and stronger elevation gain.',
    gallery: [
      { image: require('@/assets/images/Hiking.png'), caption: 'Wadi entry point' },
      { image: require('@/assets/images/Hiking.png'), caption: 'Rocky ascent section' },
      { image: require('@/assets/images/Hiking.png'), caption: 'Summit-side traverse' },
    ],
    route: [
      { latitude: 25.9104, longitude: 56.1374 },
      { latitude: 25.9131, longitude: 56.1411 },
      { latitude: 25.9166, longitude: 56.1455 },
      { latitude: 25.9198, longitude: 56.1493 },
      { latitude: 25.923, longitude: 56.1541 },
    ],
  },
];
