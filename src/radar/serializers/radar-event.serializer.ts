import {
  RadarChallengeCreatedEventData,
  RadarChallengeCreatedEventResponseData,
} from '../interfaces/radar-event.interface';

export const deserializeRadarChallengeCreatedEvent = (
  data: RadarChallengeCreatedEventResponseData,
): RadarChallengeCreatedEventData => ({
  type: data.type,
  radarChallengeId: data.radar_challenge_id,
  userId: data.user_id,
  email: data.email,
});
