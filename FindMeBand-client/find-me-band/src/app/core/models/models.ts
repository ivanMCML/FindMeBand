import {
  ApplicationStatus,
  EventStatus,
  InstrumentType,
  MediaType,
  OpportunityType,
  PerformerType
} from './enums';

export interface Profile {
  id: number;
  userId: string;
  firstName: string;
  lastName: string;
  userName: string;
  description?: string;
  createdAt: string;
}

export interface Musician extends Profile {
  performerId?: number;
  performer?: Performer;
  instruments: PlaysInstrument[];
  bandMemberships: BandMember[];
}

export interface Organizer extends Profile {
  events: Event[];
}

export interface Performer {
  id: number;
  musicianId?: number;
  bandId?: number;
  averageRating: number;
  numberOfReviews: number;
  genres: PlaysGenre[];
  locations: Location[];
}

export interface Band {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  performerId: number;
  performer?: Performer;
  members: BandMember[];
  followers: Follow[];
  posts: Post[];
}

export interface BandMember {
  id: number;
  musicianId: number;
  bandId: number;
  instrument: string;
  joinedDate: string;
  leftDate?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Instrument {
  id: number;
  name: string;
  instrumentType: InstrumentType;
}

export interface PlaysGenre {
  performerId: number;
  genreId: number;
  genre?: Genre;
}

export interface PlaysInstrument {
  musicianId: number;
  instrumentId: number;
  instrument?: Instrument;
}

export interface Post {
  id: number;
  content: string;
  createdAt: string;
  profileId?: number;
  bandId?: number;
  profile?: Profile;
  band?: Band;
  media: PostMedia[];
}

export interface PostMedia {
  id: number;
  postId: number;
  mediaType: MediaType;
  url: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  scheduledAt: string;
  createdAt: string;
  budgetMin?: number;
  budgetMax?: number;
  requiredPerformers: number;
  preferredPerformerType?: PerformerType;
  minReviewRequired?: number;
  status: EventStatus;
  organizerId: number;
  genreId?: number;
}

export interface EventApplication {
  id: number;
  eventId: number;
  performerId: number;
  appliedAt: string;
  message?: string;
  status: ApplicationStatus;
}

export interface Opportunity {
  id: number;
  type: OpportunityType;
  description: string;
  performerId: number;
  instrumentId?: number;
  genreId?: number;
  applications: OpportunityApplication[];
}

export interface OpportunityApplication {
  id: number;
  opportunityId: number;
  performerId: number;
  appliedAt: string;
  message?: string;
  status: ApplicationStatus;
}

export interface Follow {
  id: number;
  followerId: number;
  followeeProfileId?: number;
  followeeBandId?: number;
}

export interface Review {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewerProfileId: number;
  performerId: number;
}

export interface Location {
  id: number;
  performerId: number;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}
