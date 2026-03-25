/**
 * Course Database Service - TIER Golf
 *
 * Pre-populated golf course database with course ratings, slope ratings,
 * and hole-by-hole data for common Norwegian golf courses.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface CourseHole {
  holeNumber: number;
  par: number;
  strokeIndex: number; // Handicap index
  distanceYards: number;
  distanceMeters: number;
}

export interface CourseTee {
  name: string; // e.g., "Championship", "Men's", "Ladies'"
  color: string; // e.g., "Black", "White", "Yellow", "Red"
  courseRating: number;
  slopeRating: number;
  totalYards: number;
  totalMeters: number;
  holes: CourseHole[];
}

export interface GolfCourse {
  id: string;
  name: string;
  clubName: string;
  city: string;
  country: string;
  region?: string;
  holes: number; // 9 or 18
  par: number;
  tees: CourseTee[];
  amenities?: string[];
  website?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface CourseSearchResult {
  id: string;
  name: string;
  clubName: string;
  city: string;
  country: string;
  par: number;
}

// ============================================================================
// PRE-POPULATED COURSE DATA - NORWEGIAN COURSES
// ============================================================================

const NORWEGIAN_COURSES: GolfCourse[] = [
  {
    id: 'oslo-gk',
    name: 'Oslo Golfklubb',
    clubName: 'Oslo Golfklubb',
    city: 'Oslo',
    country: 'Norway',
    region: 'Oslo',
    holes: 18,
    par: 72,
    tees: [
      {
        name: 'Championship',
        color: 'Black',
        courseRating: 73.8,
        slopeRating: 138,
        totalYards: 6850,
        totalMeters: 6264,
        holes: [
          { holeNumber: 1, par: 4, strokeIndex: 7, distanceYards: 380, distanceMeters: 347 },
          { holeNumber: 2, par: 5, strokeIndex: 3, distanceYards: 530, distanceMeters: 485 },
          { holeNumber: 3, par: 3, strokeIndex: 15, distanceYards: 175, distanceMeters: 160 },
          { holeNumber: 4, par: 4, strokeIndex: 1, distanceYards: 445, distanceMeters: 407 },
          { holeNumber: 5, par: 4, strokeIndex: 11, distanceYards: 365, distanceMeters: 334 },
          { holeNumber: 6, par: 3, strokeIndex: 17, distanceYards: 155, distanceMeters: 142 },
          { holeNumber: 7, par: 5, strokeIndex: 5, distanceYards: 545, distanceMeters: 498 },
          { holeNumber: 8, par: 4, strokeIndex: 9, distanceYards: 410, distanceMeters: 375 },
          { holeNumber: 9, par: 4, strokeIndex: 13, distanceYards: 395, distanceMeters: 361 },
          { holeNumber: 10, par: 4, strokeIndex: 8, distanceYards: 385, distanceMeters: 352 },
          { holeNumber: 11, par: 4, strokeIndex: 2, distanceYards: 450, distanceMeters: 411 },
          { holeNumber: 12, par: 3, strokeIndex: 16, distanceYards: 185, distanceMeters: 169 },
          { holeNumber: 13, par: 5, strokeIndex: 6, distanceYards: 520, distanceMeters: 475 },
          { holeNumber: 14, par: 4, strokeIndex: 4, distanceYards: 435, distanceMeters: 398 },
          { holeNumber: 15, par: 4, strokeIndex: 12, distanceYards: 375, distanceMeters: 343 },
          { holeNumber: 16, par: 3, strokeIndex: 18, distanceYards: 165, distanceMeters: 151 },
          { holeNumber: 17, par: 5, strokeIndex: 10, distanceYards: 505, distanceMeters: 462 },
          { holeNumber: 18, par: 4, strokeIndex: 14, distanceYards: 430, distanceMeters: 393 },
        ],
      },
      {
        name: 'Men',
        color: 'White',
        courseRating: 71.5,
        slopeRating: 131,
        totalYards: 6350,
        totalMeters: 5806,
        holes: [
          { holeNumber: 1, par: 4, strokeIndex: 7, distanceYards: 355, distanceMeters: 325 },
          { holeNumber: 2, par: 5, strokeIndex: 3, distanceYards: 495, distanceMeters: 453 },
          { holeNumber: 3, par: 3, strokeIndex: 15, distanceYards: 160, distanceMeters: 146 },
          { holeNumber: 4, par: 4, strokeIndex: 1, distanceYards: 415, distanceMeters: 379 },
          { holeNumber: 5, par: 4, strokeIndex: 11, distanceYards: 340, distanceMeters: 311 },
          { holeNumber: 6, par: 3, strokeIndex: 17, distanceYards: 140, distanceMeters: 128 },
          { holeNumber: 7, par: 5, strokeIndex: 5, distanceYards: 510, distanceMeters: 466 },
          { holeNumber: 8, par: 4, strokeIndex: 9, distanceYards: 380, distanceMeters: 347 },
          { holeNumber: 9, par: 4, strokeIndex: 13, distanceYards: 370, distanceMeters: 338 },
          { holeNumber: 10, par: 4, strokeIndex: 8, distanceYards: 360, distanceMeters: 329 },
          { holeNumber: 11, par: 4, strokeIndex: 2, distanceYards: 420, distanceMeters: 384 },
          { holeNumber: 12, par: 3, strokeIndex: 16, distanceYards: 170, distanceMeters: 155 },
          { holeNumber: 13, par: 5, strokeIndex: 6, distanceYards: 485, distanceMeters: 443 },
          { holeNumber: 14, par: 4, strokeIndex: 4, distanceYards: 405, distanceMeters: 370 },
          { holeNumber: 15, par: 4, strokeIndex: 12, distanceYards: 350, distanceMeters: 320 },
          { holeNumber: 16, par: 3, strokeIndex: 18, distanceYards: 150, distanceMeters: 137 },
          { holeNumber: 17, par: 5, strokeIndex: 10, distanceYards: 475, distanceMeters: 434 },
          { holeNumber: 18, par: 4, strokeIndex: 14, distanceYards: 370, distanceMeters: 338 },
        ],
      },
    ],
    amenities: ['Driving Range', 'Pro Shop', 'Restaurant', 'Practice Green'],
    website: 'https://www.oslogolfklubb.no',
    coordinates: { lat: 59.9489, lng: 10.7833 },
  },
  {
    id: 'miklagard',
    name: 'Miklagard Golf',
    clubName: 'Miklagard Golf',
    city: 'Kløfta',
    country: 'Norway',
    region: 'Akershus',
    holes: 18,
    par: 72,
    tees: [
      {
        name: 'Championship',
        color: 'Black',
        courseRating: 74.2,
        slopeRating: 142,
        totalYards: 7150,
        totalMeters: 6538,
        holes: Array.from({ length: 18 }, (_, i) => ({
          holeNumber: i + 1,
          par: [4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 4, 3, 5, 4, 4, 3, 5, 4][i],
          strokeIndex: [5, 1, 15, 3, 7, 17, 9, 11, 13, 8, 2, 16, 6, 4, 10, 18, 12, 14][i],
          distanceYards: [410, 565, 195, 455, 400, 165, 555, 385, 420, 395, 465, 175, 540, 445, 380, 155, 525, 420][i],
          distanceMeters: Math.round([410, 565, 195, 455, 400, 165, 555, 385, 420, 395, 465, 175, 540, 445, 380, 155, 525, 420][i] * 0.9144),
        })),
      },
      {
        name: 'Men',
        color: 'White',
        courseRating: 72.0,
        slopeRating: 135,
        totalYards: 6600,
        totalMeters: 6035,
        holes: Array.from({ length: 18 }, (_, i) => ({
          holeNumber: i + 1,
          par: [4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 4, 3, 5, 4, 4, 3, 5, 4][i],
          strokeIndex: [5, 1, 15, 3, 7, 17, 9, 11, 13, 8, 2, 16, 6, 4, 10, 18, 12, 14][i],
          distanceYards: [380, 525, 175, 420, 370, 150, 515, 355, 390, 365, 430, 160, 500, 410, 350, 140, 490, 385][i],
          distanceMeters: Math.round([380, 525, 175, 420, 370, 150, 515, 355, 390, 365, 430, 160, 500, 410, 350, 140, 490, 385][i] * 0.9144),
        })),
      },
    ],
    amenities: ['Driving Range', 'Pro Shop', 'Restaurant', 'Hotel', 'Spa'],
    website: 'https://www.miklagard.no',
    coordinates: { lat: 60.0781, lng: 11.1442 },
  },
  {
    id: 'losby-gods',
    name: 'Losby Gods',
    clubName: 'Losby Gods Golf',
    city: 'Finstadjordet',
    country: 'Norway',
    region: 'Akershus',
    holes: 18,
    par: 72,
    tees: [
      {
        name: 'Championship',
        color: 'Black',
        courseRating: 73.5,
        slopeRating: 140,
        totalYards: 6950,
        totalMeters: 6355,
        holes: Array.from({ length: 18 }, (_, i) => ({
          holeNumber: i + 1,
          par: [4, 4, 5, 3, 4, 4, 3, 5, 4, 4, 5, 3, 4, 4, 3, 5, 4, 4][i],
          strokeIndex: [9, 3, 7, 17, 1, 11, 15, 5, 13, 10, 8, 18, 2, 6, 16, 4, 12, 14][i],
          distanceYards: [395, 445, 535, 175, 465, 380, 185, 560, 400, 405, 520, 165, 460, 415, 170, 545, 395, 435][i],
          distanceMeters: Math.round([395, 445, 535, 175, 465, 380, 185, 560, 400, 405, 520, 165, 460, 415, 170, 545, 395, 435][i] * 0.9144),
        })),
      },
    ],
    amenities: ['Driving Range', 'Pro Shop', 'Restaurant', 'Hotel', 'Wedding Venue'],
    website: 'https://www.losbygods.no',
    coordinates: { lat: 59.9372, lng: 11.0342 },
  },
  {
    id: 'bjaavann',
    name: 'Bjaavann Golfklubb',
    clubName: 'Bjaavann Golfklubb',
    city: 'Kristiansand',
    country: 'Norway',
    region: 'Agder',
    holes: 18,
    par: 72,
    tees: [
      {
        name: 'Men',
        color: 'White',
        courseRating: 71.2,
        slopeRating: 128,
        totalYards: 6200,
        totalMeters: 5669,
        holes: Array.from({ length: 18 }, (_, i) => ({
          holeNumber: i + 1,
          par: [4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 4, 3, 5, 4, 4, 3, 5, 4][i],
          strokeIndex: [7, 3, 17, 1, 9, 15, 5, 11, 13, 6, 2, 18, 8, 4, 12, 16, 10, 14][i],
          distanceYards: [365, 510, 160, 430, 375, 145, 525, 355, 385, 390, 445, 155, 500, 420, 350, 165, 480, 370][i],
          distanceMeters: Math.round([365, 510, 160, 430, 375, 145, 525, 355, 385, 390, 445, 155, 500, 420, 350, 165, 480, 370][i] * 0.9144),
        })),
      },
    ],
    amenities: ['Driving Range', 'Pro Shop', 'Restaurant'],
    coordinates: { lat: 58.1456, lng: 8.0231 },
  },
  {
    id: 'stavanger-gk',
    name: 'Stavanger Golfklubb',
    clubName: 'Stavanger Golfklubb',
    city: 'Stavanger',
    country: 'Norway',
    region: 'Rogaland',
    holes: 18,
    par: 72,
    tees: [
      {
        name: 'Championship',
        color: 'Black',
        courseRating: 72.8,
        slopeRating: 134,
        totalYards: 6700,
        totalMeters: 6126,
        holes: Array.from({ length: 18 }, (_, i) => ({
          holeNumber: i + 1,
          par: [4, 4, 5, 3, 4, 4, 3, 5, 4, 4, 5, 3, 4, 4, 3, 5, 4, 4][i],
          strokeIndex: [5, 1, 9, 17, 3, 7, 15, 11, 13, 4, 6, 18, 2, 8, 16, 10, 12, 14][i],
          distanceYards: [385, 455, 530, 180, 440, 395, 165, 545, 405, 400, 525, 170, 465, 385, 155, 520, 390, 420][i],
          distanceMeters: Math.round([385, 455, 530, 180, 440, 395, 165, 545, 405, 400, 525, 170, 465, 385, 155, 520, 390, 420][i] * 0.9144),
        })),
      },
      {
        name: 'Men',
        color: 'White',
        courseRating: 70.5,
        slopeRating: 127,
        totalYards: 6150,
        totalMeters: 5623,
        holes: Array.from({ length: 18 }, (_, i) => ({
          holeNumber: i + 1,
          par: [4, 4, 5, 3, 4, 4, 3, 5, 4, 4, 5, 3, 4, 4, 3, 5, 4, 4][i],
          strokeIndex: [5, 1, 9, 17, 3, 7, 15, 11, 13, 4, 6, 18, 2, 8, 16, 10, 12, 14][i],
          distanceYards: [355, 420, 495, 160, 405, 365, 150, 510, 375, 370, 490, 155, 430, 355, 140, 485, 360, 385][i],
          distanceMeters: Math.round([355, 420, 495, 160, 405, 365, 150, 510, 375, 370, 490, 155, 430, 355, 140, 485, 360, 385][i] * 0.9144),
        })),
      },
    ],
    amenities: ['Driving Range', 'Pro Shop', 'Restaurant', 'Practice Green'],
    coordinates: { lat: 58.9825, lng: 5.7531 },
  },
  {
    id: 'bergen-gk',
    name: 'Bergen Golfklubb',
    clubName: 'Bergen Golfklubb',
    city: 'Bergen',
    country: 'Norway',
    region: 'Vestland',
    holes: 18,
    par: 71,
    tees: [
      {
        name: 'Men',
        color: 'White',
        courseRating: 70.8,
        slopeRating: 130,
        totalYards: 6100,
        totalMeters: 5578,
        holes: Array.from({ length: 18 }, (_, i) => ({
          holeNumber: i + 1,
          par: [4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4][i],
          strokeIndex: [3, 15, 7, 1, 9, 17, 5, 11, 13, 2, 16, 8, 4, 6, 18, 10, 12, 14][i],
          distanceYards: [405, 175, 520, 440, 375, 155, 395, 510, 380, 430, 165, 495, 415, 385, 145, 365, 505, 390][i],
          distanceMeters: Math.round([405, 175, 520, 440, 375, 155, 395, 510, 380, 430, 165, 495, 415, 385, 145, 365, 505, 390][i] * 0.9144),
        })),
      },
    ],
    amenities: ['Driving Range', 'Pro Shop', 'Restaurant'],
    coordinates: { lat: 60.3833, lng: 5.3350 },
  },
  {
    id: 'trondheim-gk',
    name: 'Trondheim Golfklubb',
    clubName: 'Trondheim Golfklubb',
    city: 'Trondheim',
    country: 'Norway',
    region: 'Trøndelag',
    holes: 18,
    par: 72,
    tees: [
      {
        name: 'Men',
        color: 'White',
        courseRating: 71.0,
        slopeRating: 129,
        totalYards: 6250,
        totalMeters: 5715,
        holes: Array.from({ length: 18 }, (_, i) => ({
          holeNumber: i + 1,
          par: [4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 4, 3, 5, 4, 4, 3, 5, 4][i],
          strokeIndex: [7, 1, 17, 3, 9, 15, 5, 11, 13, 8, 2, 18, 6, 4, 10, 16, 12, 14][i],
          distanceYards: [370, 535, 165, 435, 380, 150, 530, 365, 395, 385, 450, 160, 515, 420, 355, 170, 500, 385][i],
          distanceMeters: Math.round([370, 535, 165, 435, 380, 150, 530, 365, 395, 385, 450, 160, 515, 420, 355, 170, 500, 385][i] * 0.9144),
        })),
      },
    ],
    amenities: ['Driving Range', 'Pro Shop', 'Restaurant', 'Practice Bunker'],
    coordinates: { lat: 63.4125, lng: 10.4228 },
  },
];

// Additional international courses for reference
const INTERNATIONAL_COURSES: GolfCourse[] = [
  {
    id: 'st-andrews-old',
    name: 'Old Course',
    clubName: 'St Andrews Links',
    city: 'St Andrews',
    country: 'Scotland',
    holes: 18,
    par: 72,
    tees: [
      {
        name: 'Championship',
        color: 'Black',
        courseRating: 76.3,
        slopeRating: 143,
        totalYards: 7305,
        totalMeters: 6681,
        holes: Array.from({ length: 18 }, (_, i) => ({
          holeNumber: i + 1,
          par: [4, 4, 4, 4, 5, 4, 4, 3, 4, 4, 3, 4, 4, 5, 4, 4, 4, 4][i],
          strokeIndex: [5, 13, 11, 9, 1, 3, 7, 17, 15, 6, 18, 8, 10, 2, 12, 14, 4, 16][i],
          distanceYards: [376, 453, 397, 480, 568, 416, 390, 175, 352, 386, 174, 348, 465, 618, 456, 423, 495, 357][i],
          distanceMeters: Math.round([376, 453, 397, 480, 568, 416, 390, 175, 352, 386, 174, 348, 465, 618, 456, 423, 495, 357][i] * 0.9144),
        })),
      },
    ],
    amenities: ['Pro Shop', 'Restaurant', 'Caddies', 'Clubhouse'],
    website: 'https://www.standrews.com',
    coordinates: { lat: 56.3437, lng: -2.8032 },
  },
];

// All courses combined
const ALL_COURSES: GolfCourse[] = [...NORWEGIAN_COURSES, ...INTERNATIONAL_COURSES];

// ============================================================================
// API METHODS
// ============================================================================

/**
 * Search courses by name, club name, or city
 */
export function searchCourses(query: string, limit = 10): CourseSearchResult[] {
  const normalizedQuery = query.toLowerCase().trim();

  if (normalizedQuery.length < 2) {
    return [];
  }

  const results = ALL_COURSES
    .filter(
      (course) =>
        course.name.toLowerCase().includes(normalizedQuery) ||
        course.clubName.toLowerCase().includes(normalizedQuery) ||
        course.city.toLowerCase().includes(normalizedQuery)
    )
    .slice(0, limit)
    .map((course) => ({
      id: course.id,
      name: course.name,
      clubName: course.clubName,
      city: course.city,
      country: course.country,
      par: course.par,
    }));

  return results;
}

/**
 * Get a course by ID
 */
export function getCourseById(id: string): GolfCourse | null {
  return ALL_COURSES.find((course) => course.id === id) || null;
}

/**
 * Get courses by region
 */
export function getCoursesByRegion(region: string): GolfCourse[] {
  return ALL_COURSES.filter(
    (course) => course.region?.toLowerCase() === region.toLowerCase()
  );
}

/**
 * Get courses by country
 */
export function getCoursesByCountry(country: string): GolfCourse[] {
  return ALL_COURSES.filter(
    (course) => course.country.toLowerCase() === country.toLowerCase()
  );
}

/**
 * Get all Norwegian courses
 */
export function getNorwegianCourses(): GolfCourse[] {
  return NORWEGIAN_COURSES;
}

/**
 * Get hole data for a specific course and tee
 */
export function getHoleData(
  courseId: string,
  teeName?: string
): CourseHole[] | null {
  const course = getCourseById(courseId);
  if (!course) return null;

  const tee = teeName
    ? course.tees.find((t) => t.name.toLowerCase() === teeName.toLowerCase())
    : course.tees[0];

  return tee?.holes || null;
}

/**
 * Get course rating and slope for a specific tee
 */
export function getCourseRating(
  courseId: string,
  teeName?: string
): { courseRating: number; slopeRating: number } | null {
  const course = getCourseById(courseId);
  if (!course) return null;

  const tee = teeName
    ? course.tees.find((t) => t.name.toLowerCase() === teeName.toLowerCase())
    : course.tees[0];

  if (!tee) return null;

  return {
    courseRating: tee.courseRating,
    slopeRating: tee.slopeRating,
  };
}

/**
 * Calculate expected strokes for a hole based on par and player handicap
 */
export function calculateExpectedStrokes(
  par: number,
  strokeIndex: number,
  handicap: number
): number {
  // Full strokes from handicap
  const fullStrokes = Math.floor(handicap / 18);
  // Extra strokes for harder holes
  const extraStroke = strokeIndex <= (handicap % 18) ? 1 : 0;

  return par + fullStrokes + extraStroke;
}

/**
 * Get all available tee options for a course
 */
export function getAvailableTees(courseId: string): string[] {
  const course = getCourseById(courseId);
  if (!course) return [];

  return course.tees.map((tee) => tee.name);
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const courseDatabase = {
  searchCourses,
  getCourseById,
  getCoursesByRegion,
  getCoursesByCountry,
  getNorwegianCourses,
  getHoleData,
  getCourseRating,
  calculateExpectedStrokes,
  getAvailableTees,
};

export default courseDatabase;
