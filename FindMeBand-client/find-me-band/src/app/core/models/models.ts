import { ApplicationStatus, EventStatus, InstrumentType, MediaType, OpportunityType, PerformerType } from './enums';

export interface Genre {
  id: number;
  name: string;
}

export interface Instrument {
  id: number;
  name: string;
  type: InstrumentType;
}

export interface PlaysInstrument {
  id: number;
  musicianId: number;
  instrument: Instrument;
  skillLevel: number;
  yearsOfExperience: number;
  isPrimary: boolean;
}

export interface PlaysGenre {
  id: number;
  performerId: number;
  genre: Genre;
  skillLevel: number;
}

export interface Location {
  id: number;
  performerId: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface Review {
  id: number;
  reviewerId: number;
  performerId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PostMedia {
  id: number;
  postId: number;
  url: string;
  type: MediaType;
}

export interface Post {
  id: number;
  profileId: number;
  content: string;
  createdAt: string;
  media: PostMedia[];
}

export interface Performer {
  id: number;
  averageRating: number;
  numberOfReviews: number;
  genres: PlaysGenre[];
  locations: Location[];
  reviews: Review[];
}

export interface Musician {
  id: number;
  userId: string;
  firstName: string;
  lastName: string;
  userName: string;
  description: string;
  createdAt: string;
  performerId?: number;
  performer?: Performer;
  instruments: PlaysInstrument[];
  bandMemberships: BandMember[];
}

export interface Band {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  performerId?: number;
  performer?: Performer;
  members: BandMember[];
  posts: Post[];
}

export interface BandMember {
  id: number;
  musicianId: number;
  bandId: number;
  joinedDate: string;
  leftDate?: string;
  instrument?: Instrument;
  musician?: Musician;
  band?: Band;
}

export interface Organizer {
  id: number;
  userId: string;
  firstName: string;
  lastName: string;
  userName: string;
  description: string;
  createdAt: string;
  events: Event[];
}

export interface Event {
  id: number;
  organizerId: number;
  organizer?: Organizer;
  title: string;
  description: string;
  scheduledAt: string;
  createdAt: string;
  location: string;
  latitude: number;
  longitude: number;
  budgetMin?: number;
  budgetMax?: number;
  requiredPerformers?: number;
  preferredPerformerType?: PerformerType;
  minReviewRequired?: number;
  status: EventStatus;
  genre?: Genre;
  applications: EventApplication[];
}

export interface EventApplication {
  id: number;
  performerId: number;
  eventId: number;
  appliedAt: string;
  message: string;
  status: ApplicationStatus;
  performer?: Performer;
  event?: Event;
}

export interface Opportunity {
  id: number;
  authorId: number;
  author?: Performer;
  type: OpportunityType;
  description?: string;
  instrument?: Instrument;
  genre?: Genre;
  applications: OpportunityApplication[];
}

export interface OpportunityApplication {
  id: number;
  applicantId: number;
  opportunityId: number;
  appliedAt: string;
  message: string;
  applicant?: Performer;
  opportunity?: Opportunity;
}

export interface Profile {
  id: number;
  userId: string;
  firstName: string;
  lastName: string;
  userName: string;
  description: string;
  createdAt: string;
  posts: Post[];
}
