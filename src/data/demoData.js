const IMG = (id) => `https://images.unsplash.com/${id}?w=800&auto=format&fit=crop`

export const storyArcs = [
  // ─── 1. Portland Weekend ───────────────────────────────────────────
  {
    id: 'portland-weekend',
    title: 'Portland Weekend',
    dateRange: {
      start: '2024-03-15',
      end: '2024-03-17',
    },
    coverPhotoIndex: 2,
    tags: ['travel', 'friends'],
    people: ['Maya', 'Jon'],
    primaryLocation: 'Portland, OR',
    mood: 'warm',
    connections: [
      { targetStoryId: 'summer-coast', reason: 'Maya and Jon appear in both' },
      { targetStoryId: 'first-snow-trip', reason: 'Jon appears in both' },
    ],
    photos: [
      {
        id: 'ptl-01',
        url: IMG('photo-1531971589569-0d9370cbe1e5'),
        timestamp: '2024-03-15T09:22:00',
        location: 'Portland, OR',
        people: [],
        cluster: 'arriving',
      },
      {
        id: 'ptl-02',
        url: IMG('photo-1541807120430-f3f78c281225'),
        timestamp: '2024-03-15T11:05:00',
        location: 'Old Town, Portland',
        people: ['Maya'],
        cluster: 'exploring',
      },
      {
        id: 'ptl-03',
        url: IMG('photo-1507699622108-4be3abd695ad'),
        timestamp: '2024-03-15T14:30:00',
        location: 'Portland, OR',
        people: [],
        cluster: 'exploring',
      },
      {
        id: 'ptl-04',
        url: IMG('photo-1517248135467-4c7edcad34c4'),
        timestamp: '2024-03-15T16:45:00',
        location: 'Hawthorne District, Portland',
        people: ['Maya', 'Jon'],
        cluster: 'exploring',
      },
      {
        id: 'ptl-05',
        url: IMG('photo-1476842634003-7dcca8f832de'),
        timestamp: '2024-03-16T10:15:00',
        location: 'East Portland',
        people: ['Jon'],
        cluster: 'day two',
      },
      {
        id: 'ptl-06',
        url: IMG('photo-1553531384-411a247ccd73'),
        timestamp: '2024-03-16T13:00:00',
        location: 'Willamette River, Portland',
        people: [],
        cluster: 'bridges',
      },
      {
        id: 'ptl-07',
        url: IMG('photo-1515896769750-31548aa180ed'),
        timestamp: '2024-03-16T13:20:00',
        location: 'Steel Bridge, Portland',
        people: ['Maya'],
        cluster: 'bridges',
      },
      {
        id: 'ptl-08',
        url: IMG('photo-1534430480872-3498386e7856'),
        timestamp: '2024-03-17T20:10:00',
        location: 'Downtown Portland',
        people: ['Maya', 'Jon'],
        cluster: 'last night',
      },
    ],
  },

  // ─── 2. The Apartment on Elm Street ────────────────────────────────
  {
    id: 'apartment-elm',
    title: 'The Apartment on Elm Street',
    dateRange: {
      start: '2024-01-08',
      end: '2024-12-19',
    },
    coverPhotoIndex: 0,
    tags: ['home', 'personal'],
    people: [],
    primaryLocation: 'San Francisco, CA',
    mood: 'calm',
    connections: [
      { targetStoryId: 'quiet-mornings', reason: 'Same location' },
      { targetStoryId: 'learning-to-cook', reason: 'Same location' },
    ],
    photos: [
      {
        id: 'apt-01',
        url: IMG('photo-1502672260266-1c1ef2d93688'),
        timestamp: '2024-01-08T15:30:00',
        location: 'San Francisco, CA',
        people: [],
        cluster: 'living room',
      },
      {
        id: 'apt-02',
        url: IMG('photo-1507003211169-0a1dd7228f2d'),
        timestamp: '2024-03-22T11:00:00',
        location: 'San Francisco, CA',
        people: [],
        cluster: 'bookshelves',
      },
      {
        id: 'apt-03',
        url: IMG('photo-1522708323590-d24dbb6b0267'),
        timestamp: '2024-05-14T08:45:00',
        location: 'San Francisco, CA',
        people: [],
        cluster: 'living room',
      },
      {
        id: 'apt-04',
        url: IMG('photo-1524758631624-e2822e304c36'),
        timestamp: '2024-07-30T16:20:00',
        location: 'San Francisco, CA',
        people: [],
        cluster: 'windows',
      },
      {
        id: 'apt-05',
        url: IMG('photo-1513694203232-719a280e022f'),
        timestamp: '2024-09-11T10:00:00',
        location: 'San Francisco, CA',
        people: [],
        cluster: 'bedroom',
      },
      {
        id: 'apt-06',
        url: IMG('photo-1463320726281-696a485928c7'),
        timestamp: '2024-12-19T14:15:00',
        location: 'San Francisco, CA',
        people: [],
        cluster: 'plants',
      },
    ],
  },

  // ─── 3. Learning to Cook, Slowly ───────────────────────────────────
  {
    id: 'learning-to-cook',
    title: 'Learning to Cook, Slowly',
    dateRange: {
      start: '2024-02-10',
      end: '2024-11-23',
    },
    coverPhotoIndex: 4,
    tags: ['food', 'personal'],
    people: ['Maya'],
    primaryLocation: 'San Francisco, CA',
    mood: 'warm',
    connections: [
      { targetStoryId: 'apartment-elm', reason: 'Same location' },
      { targetStoryId: 'portland-weekend', reason: 'Maya appears in both' },
    ],
    photos: [
      {
        id: 'cook-01',
        url: IMG('photo-1556909114-f6e7ad7d3136'),
        timestamp: '2024-02-10T18:30:00',
        location: 'San Francisco, CA',
        people: ['Maya'],
        cluster: 'prep work',
      },
      {
        id: 'cook-02',
        url: IMG('photo-1466637574441-749b8f19452f'),
        timestamp: '2024-03-28T17:45:00',
        location: 'San Francisco, CA',
        people: [],
        cluster: 'prep work',
      },
      {
        id: 'cook-03',
        url: IMG('photo-1528712306091-ed0763094c98'),
        timestamp: '2024-05-06T19:00:00',
        location: 'San Francisco, CA',
        people: [],
        cluster: 'prep work',
      },
      {
        id: 'cook-04',
        url: IMG('photo-1556910103-1c02745aae4d'),
        timestamp: '2024-07-14T20:15:00',
        location: 'San Francisco, CA',
        people: [],
        cluster: 'cooking',
      },
      {
        id: 'cook-05',
        url: IMG('photo-1473093295043-cdd812d0e601'),
        timestamp: '2024-08-19T19:45:00',
        location: 'San Francisco, CA',
        people: ['Maya'],
        cluster: 'plated dishes',
      },
      {
        id: 'cook-06',
        url: IMG('photo-1551183053-bf91a1d81141'),
        timestamp: '2024-10-03T20:00:00',
        location: 'San Francisco, CA',
        people: [],
        cluster: 'plated dishes',
      },
      {
        id: 'cook-07',
        url: IMG('photo-1476124369491-e7addf5db371'),
        timestamp: '2024-11-23T19:30:00',
        location: 'San Francisco, CA',
        people: ['Maya'],
        cluster: 'plated dishes',
      },
    ],
  },

  // ─── 4. Summer at the Coast ────────────────────────────────────────
  {
    id: 'summer-coast',
    title: 'Summer at the Coast',
    dateRange: {
      start: '2024-07-04',
      end: '2024-07-07',
    },
    coverPhotoIndex: 1,
    tags: ['travel', 'nature'],
    people: ['Maya', 'Jon', 'Alex'],
    primaryLocation: 'Big Sur, CA',
    mood: 'euphoric',
    connections: [
      { targetStoryId: 'portland-weekend', reason: 'Maya and Jon appear in both' },
      { targetStoryId: 'alexs-birthday', reason: 'Alex, Maya, and Jon appear in both' },
    ],
    photos: [
      {
        id: 'coast-01',
        url: IMG('photo-1519451241324-20b4ea2c4220'),
        timestamp: '2024-07-04T10:00:00',
        location: 'Big Sur, CA',
        people: [],
        cluster: 'the drive',
      },
      {
        id: 'coast-02',
        url: IMG('photo-1506905925346-21bda4d32df4'),
        timestamp: '2024-07-04T10:45:00',
        location: 'Bixby Creek Bridge, Big Sur',
        people: ['Maya'],
        cluster: 'the drive',
      },
      {
        id: 'coast-03',
        url: IMG('photo-1510414842594-a61c69b5ae57'),
        timestamp: '2024-07-04T11:15:00',
        location: 'Bixby Creek Bridge, Big Sur',
        people: ['Jon', 'Alex'],
        cluster: 'the drive',
      },
      {
        id: 'coast-04',
        url: IMG('photo-1504681869696-d977211a5f4c'),
        timestamp: '2024-07-04T15:30:00',
        location: 'McWay Falls, Big Sur',
        people: [],
        cluster: 'waterfall',
      },
      {
        id: 'coast-05',
        url: IMG('photo-1501785888041-af3ef285b470'),
        timestamp: '2024-07-05T09:00:00',
        location: 'Big Sur, CA',
        people: ['Maya', 'Jon'],
        cluster: 'hiking',
      },
      {
        id: 'coast-06',
        url: IMG('photo-1506744038136-46273834b3fb'),
        timestamp: '2024-07-05T11:20:00',
        location: 'Big Sur, CA',
        people: [],
        cluster: 'hiking',
      },
      {
        id: 'coast-07',
        url: IMG('photo-1414609245224-afa02bfb3fda'),
        timestamp: '2024-07-05T14:00:00',
        location: 'Bixby Creek, Big Sur',
        people: ['Alex'],
        cluster: 'exploring',
      },
      {
        id: 'coast-08',
        url: IMG('photo-1469474968028-56623f02e42e'),
        timestamp: '2024-07-06T08:30:00',
        location: 'Big Sur, CA',
        people: [],
        cluster: 'exploring',
      },
      {
        id: 'coast-09',
        url: IMG('photo-1507525428034-b723cf961d3e'),
        timestamp: '2024-07-06T19:45:00',
        location: 'Big Sur, CA',
        people: ['Maya', 'Jon', 'Alex'],
        cluster: 'golden hour',
      },
      {
        id: 'coast-10',
        url: IMG('photo-1500259571355-332da5cb07aa'),
        timestamp: '2024-07-07T07:15:00',
        location: 'Big Sur, CA',
        people: [],
        cluster: 'golden hour',
      },
    ],
  },

  // ─── 5. Alex's Birthday ───────────────────────────────────────────
  {
    id: 'alexs-birthday',
    title: "Alex's Birthday",
    dateRange: {
      start: '2024-09-21',
      end: '2024-09-21',
    },
    coverPhotoIndex: 2,
    tags: ['celebration', 'friends'],
    people: ['Alex', 'Maya', 'Jon'],
    primaryLocation: 'San Francisco, CA',
    mood: 'euphoric',
    connections: [
      { targetStoryId: 'summer-coast', reason: 'Alex, Maya, and Jon appear in both' },
      { targetStoryId: 'first-snow-trip', reason: 'Alex and Jon appear in both' },
    ],
    photos: [
      {
        id: 'bday-01',
        url: IMG('photo-1496024840928-4c417adf211d'),
        timestamp: '2024-09-21T17:00:00',
        location: 'Dolores Park, San Francisco',
        people: ['Alex', 'Maya', 'Jon'],
        cluster: 'rooftop gathering',
      },
      {
        id: 'bday-02',
        url: IMG('photo-1519671482749-fd09be7ccebf'),
        timestamp: '2024-09-21T17:45:00',
        location: 'Dolores Park, San Francisco',
        people: ['Maya', 'Jon'],
        cluster: 'rooftop gathering',
      },
      {
        id: 'bday-03',
        url: IMG('photo-1558301211-0d8c8ddee6ec'),
        timestamp: '2024-09-21T19:15:00',
        location: 'San Francisco, CA',
        people: ['Alex'],
        cluster: 'the cake',
      },
      {
        id: 'bday-04',
        url: IMG('photo-1464349095431-e9a21285b5f3'),
        timestamp: '2024-09-21T19:20:00',
        location: 'San Francisco, CA',
        people: [],
        cluster: 'the cake',
      },
      {
        id: 'bday-05',
        url: IMG('photo-1530103862676-de8c9debad1d'),
        timestamp: '2024-09-21T19:25:00',
        location: 'San Francisco, CA',
        people: ['Alex'],
        cluster: 'the cake',
      },
      {
        id: 'bday-06',
        url: IMG('photo-1528605248644-14dd04022da1'),
        timestamp: '2024-09-21T21:30:00',
        location: 'San Francisco, CA',
        people: ['Alex', 'Maya', 'Jon'],
        cluster: 'toasts',
      },
    ],
  },

  // ─── 6. Quiet Mornings ────────────────────────────────────────────
  {
    id: 'quiet-mornings',
    title: 'Quiet Mornings',
    dateRange: {
      start: '2024-01-14',
      end: '2024-10-06',
    },
    coverPhotoIndex: 3,
    tags: ['personal', 'solo'],
    people: [],
    primaryLocation: 'San Francisco, CA',
    mood: 'calm',
    connections: [
      { targetStoryId: 'apartment-elm', reason: 'Same location' },
      { targetStoryId: 'learning-to-cook', reason: 'Same location' },
    ],
    photos: [
      {
        id: 'quiet-01',
        url: IMG('photo-1434030216411-0b793f4b4173'),
        timestamp: '2024-01-14T07:15:00',
        location: 'San Francisco, CA',
        people: [],
        cluster: 'journaling',
      },
      {
        id: 'quiet-02',
        url: IMG('photo-1495474472287-4d71bcdd2085'),
        timestamp: '2024-03-09T06:50:00',
        location: 'San Francisco, CA',
        people: [],
        cluster: 'sunrise coffee',
      },
      {
        id: 'quiet-03',
        url: IMG('photo-1512820790803-83ca734da794'),
        timestamp: '2024-05-21T07:30:00',
        location: 'San Francisco, CA',
        people: [],
        cluster: 'reading',
      },
      {
        id: 'quiet-04',
        url: IMG('photo-1544787219-7f47ccb76574'),
        timestamp: '2024-08-03T07:00:00',
        location: 'San Francisco, CA',
        people: [],
        cluster: 'reading',
      },
      {
        id: 'quiet-05',
        url: IMG('photo-1506880018603-83d5b814b5a6'),
        timestamp: '2024-10-06T08:20:00',
        location: 'San Francisco, CA',
        people: [],
        cluster: 'reading',
      },
    ],
  },

  // ─── 7. First Snow Trip ───────────────────────────────────────────
  {
    id: 'first-snow-trip',
    title: 'First Snow Trip',
    dateRange: {
      start: '2024-12-20',
      end: '2024-12-23',
    },
    coverPhotoIndex: 0,
    tags: ['travel', 'nature', 'friends'],
    people: ['Jon', 'Alex'],
    primaryLocation: 'Lake Tahoe, CA',
    mood: 'warm',
    connections: [
      { targetStoryId: 'alexs-birthday', reason: 'Alex and Jon appear in both' },
      { targetStoryId: 'portland-weekend', reason: 'Jon appears in both' },
    ],
    photos: [
      {
        id: 'snow-01',
        url: IMG('photo-1418985991508-e47386d96a71'),
        timestamp: '2024-12-20T11:00:00',
        location: 'Lake Tahoe, CA',
        people: [],
        cluster: 'the lake',
      },
      {
        id: 'snow-02',
        url: IMG('photo-1491002052546-bf38f186af56'),
        timestamp: '2024-12-20T13:30:00',
        location: 'Lake Tahoe, CA',
        people: ['Jon'],
        cluster: 'the lake',
      },
      {
        id: 'snow-03',
        url: IMG('photo-1477601263568-180e2c6d046e'),
        timestamp: '2024-12-20T15:00:00',
        location: 'Lake Tahoe, CA',
        people: ['Alex'],
        cluster: 'the lake',
      },
      {
        id: 'snow-04',
        url: IMG('photo-1478131143081-80f7f84ca84d'),
        timestamp: '2024-12-21T09:15:00',
        location: 'Lake Tahoe, CA',
        people: [],
        cluster: 'forest walks',
      },
      {
        id: 'snow-05',
        url: IMG('photo-1516483638261-f4dbaf036963'),
        timestamp: '2024-12-21T11:45:00',
        location: 'Lake Tahoe, CA',
        people: ['Jon', 'Alex'],
        cluster: 'forest walks',
      },
      {
        id: 'snow-06',
        url: IMG('photo-1510798831971-661eb04b3739'),
        timestamp: '2024-12-22T10:00:00',
        location: 'Lake Tahoe, CA',
        people: [],
        cluster: 'the cabin',
      },
      {
        id: 'snow-07',
        url: IMG('photo-1482192505345-5655af888cc4'),
        timestamp: '2024-12-22T16:30:00',
        location: 'Lake Tahoe, CA',
        people: ['Jon'],
        cluster: 'the cabin',
      },
      {
        id: 'snow-08',
        url: IMG('photo-1542314831-068cd1dbfeeb'),
        timestamp: '2024-12-23T19:00:00',
        location: 'Lake Tahoe, CA',
        people: ['Jon', 'Alex'],
        cluster: 'the cabin',
      },
    ],
  },
]

// ─── Loose Photos (unassigned to any story) ──────────────────────────
export const loosePhotos = [
  {
    id: 'loose-01',
    url: IMG('photo-1569880153113-76e33fc52d5f'),
    timestamp: '2024-04-12T16:20:00',
    location: 'Mission District, San Francisco',
    people: [],
    cluster: null,
  },
  {
    id: 'loose-02',
    url: IMG('photo-1514888286974-6c03e2ca1dba'),
    timestamp: '2024-06-01T18:45:00',
    location: 'San Francisco, CA',
    people: [],
    cluster: null,
  },
  {
    id: 'loose-03',
    url: IMG('photo-1507400492013-162706c8c05e'),
    timestamp: '2024-08-15T19:30:00',
    location: 'Ocean Beach, San Francisco',
    people: [],
    cluster: null,
  },
  {
    id: 'loose-04',
    url: IMG('photo-1521587760476-6c12a4b040da'),
    timestamp: '2024-10-28T14:10:00',
    location: 'San Francisco, CA',
    people: [],
    cluster: null,
  },
  {
    id: 'loose-05',
    url: IMG('photo-1501630834273-4b5604d2ee31'),
    timestamp: '2024-11-15T08:00:00',
    location: 'San Francisco, CA',
    people: [],
    cluster: null,
  },
]

// ─── Cluster Annotations ─────────────────────────────────────────────
// Ambient "whispered" context for each cluster within a story
export const clusterAnnotations = {
  'portland-weekend': {
    arriving: 'first photos of the trip — shot from the train',
    exploring: 'all taken within 2 hours of each other',
    'day two': 'overcast morning light',
    bridges: 'both shot within 20 minutes',
    'last night': 'the only nighttime shots from the trip',
  },
  'apartment-elm': {
    'living room': 'afternoon light through the west window',
    bookshelves: 'the collection keeps growing',
    windows: 'golden hour, facing the street',
    bedroom: 'the quietest corner of the apartment',
    plants: 'the survivors, end of year',
  },
  'learning-to-cook': {
    'prep work': 'three different attempts at the same recipe',
    cooking: 'first time using the cast iron',
    'plated dishes': 'each one slightly better than the last',
  },
  'summer-coast': {
    'the drive': 'all 3 shot from the passenger seat',
    waterfall: 'McWay Falls — everyone else had left',
    hiking: '2 of 2 include Maya and Jon',
    exploring: 'afternoon wandering, no plan',
    'golden hour': 'the light lasted exactly 12 minutes',
  },
  'alexs-birthday': {
    'rooftop gathering': 'all taken before the sun set',
    'the cake': 'three shots in 10 minutes — the candles kept going out',
    toasts: 'the last photo of the night',
  },
  'quiet-mornings': {
    journaling: 'the first entry of the year',
    'sunrise coffee': '6:50 AM, no filter needed',
    reading: 'same chair, three different seasons',
  },
  'first-snow-trip': {
    'the lake': 'all taken the first afternoon',
    'forest walks': '2 of 2 include Jon and Alex',
    'the cabin': 'the warmest photos despite the cold',
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────

/** All unique people across the dataset */
export const allPeople = [...new Set(storyArcs.flatMap((s) => s.people))]

/** All unique tags across the dataset */
export const allTags = [...new Set(storyArcs.flatMap((s) => s.tags))]

/** Total photo count */
export const totalPhotos =
  storyArcs.reduce((sum, s) => sum + s.photos.length, 0) + loosePhotos.length

/** Lookup a story by ID */
export const getStoryById = (id) => storyArcs.find((s) => s.id === id)

/** Get all stories a person appears in */
export const getStoriesForPerson = (name) =>
  storyArcs.filter((s) => s.people.includes(name))

/** Get connected stories for a given story */
export const getConnectedStories = (storyId) => {
  const story = getStoryById(storyId)
  if (!story) return []
  return story.connections.map((conn) => ({
    ...conn,
    story: getStoryById(conn.targetStoryId),
  }))
}
