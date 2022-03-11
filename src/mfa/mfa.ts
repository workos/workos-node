import { WorkOS } from '../workos';
import { ChallengeFactorOptions } from './interfaces/challenge-factor-options';
import { Challenge } from './interfaces/challenge.interface';
import { EnrollFactorOptions } from './interfaces/enroll-factor-options';
import { Factor } from './interfaces/factor.interface';
import { VerifyFactorOptions } from './interfaces/verify-factor-options';
import { VerifyResponse } from './interfaces/verify-factor-response';

export class MFA {
    constructor(private readonly workos: WorkOS) {}

    async deleteFactor(id: string) {
        await this.workos.delete(`/auth/factors/${id}`);
    }

    async getFactor(id: string){
       const { data } = await this.workos.get(`/auth/factors/${id}`);
       return data;
    }

    async enrollFactor(options: EnrollFactorOptions): Promise<Factor> {
        const { data } = await this.workos.post('/auth/factors/enroll', options);
        return data;
    }

    async challengeFactor(options: ChallengeFactorOptions): Promise<Challenge> {
        const { data } = await this.workos.post('/auth/factors/challenge', options);
        return data;
    }

    async verifyFactor(options: VerifyFactorOptions): Promise<VerifyResponse> {
        const { data } = await this.workos.post('/auth/factors/verify', options);
        return data;
    }
}
