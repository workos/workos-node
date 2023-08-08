import { AtLeastOnePropertyOf } from '../../common/interfaces';

interface BaseUpdateUserOptions {
  userId: string;
}

interface UpdateUserOptionsProperties {
  firstName: string;
  lastName: string;
}

export type UpdateUserOptions = BaseUpdateUserOptions &
  AtLeastOnePropertyOf<UpdateUserOptionsProperties>;

export interface SerializedUpdateUserOptionsProperties {
  first_name: string;
  last_name: string;
}

export type SerializedUpdateUserOptions =
  AtLeastOnePropertyOf<SerializedUpdateUserOptionsProperties>;
