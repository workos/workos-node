import { deserializeFactor } from './authentication-factor.serializer';
import { AuthenticationFactorResponse } from '../interfaces/authentication-factor.interface';
import listFactorsFixture from '../fixtures/list-factors.json';

describe('deserializeFactor', () => {
  it('deserializes totp, sms, and generic_otp factors', () => {
    const factors = listFactorsFixture.data.map((factor) =>
      deserializeFactor(factor as AuthenticationFactorResponse),
    );

    expect(factors).toEqual([
      {
        object: 'authentication_factor',
        id: 'auth_factor_1234',
        createdAt: '2022-03-15T20:39:19.892Z',
        updatedAt: '2022-03-15T20:39:19.892Z',
        type: 'totp',
        totp: {
          issuer: 'WorkOS',
          user: 'some_user',
        },
        userId: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
      },
      {
        object: 'authentication_factor',
        id: 'auth_factor_5678',
        createdAt: '2022-03-15T20:39:19.892Z',
        updatedAt: '2022-03-15T20:39:19.892Z',
        type: 'sms',
        sms: {
          phoneNumber: '+15555555555',
        },
        userId: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
      },
      {
        object: 'authentication_factor',
        id: 'auth_factor_9012',
        createdAt: '2022-03-15T20:39:19.892Z',
        updatedAt: '2022-03-15T20:39:19.892Z',
        type: 'generic_otp',
        userId: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
      },
    ]);
  });
});
