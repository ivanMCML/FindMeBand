export enum ApplicationStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2
}

export enum EventStatus {
  Open = 0,
  Closed = 1,
  Canceled = 2
}

export enum InstrumentType {
  Keys = 0,
  Strings = 1,
  Percussion = 2,
  Wind = 3,
  Other = 4
}

export enum MediaType {
  Image = 0,
  Video = 1
}

export enum OpportunityType {
  MusicianLookingForMusician = 0,
  MusicianLookingForBand = 1,
  BandLookingForMusician = 2
}

export enum PerformerType {
  Musician = 0,
  Band = 1
}
