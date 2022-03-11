import { Sms } from './sms.interface';
import { Totp } from './totp.interface';

export interface Factor {
    object: 'authentication_factor';
    id: string;
    created_at: string;
    updated_at: string;
    type: string;
    environment_id: string;
    sms: Sms;
    totp: Totp;
}
