import { Sms, SmsResponse } from '../interfaces';

export const deserializeSms = (sms: SmsResponse): Sms => ({
  phoneNumber: sms.phone_number,
});
