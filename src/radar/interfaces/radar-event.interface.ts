export interface RadarChallengeCreatedEventData {
  type: 'email';
  radarChallengeId: string;
  userId: string;
  email: string;
}

export interface RadarChallengeCreatedEventResponseData {
  type: 'email';
  radar_challenge_id: string;
  user_id: string;
  email: string;
}
