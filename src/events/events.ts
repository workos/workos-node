import { WorkOS } from '../workos';
import { Event } from './interfaces/event.interface';
import { List } from '../common/interfaces/list.interface';
import {GetEventOptions} from './interfaces';

export class Events{
  constructor(private readonly workos: WorkOS) {}

  async getEvents(
    options: GetEventOptions
  ): Promise<List<Event>>{
    const { data } = await this.workos.get(`/events`, {
      query: options,
    });
    return data;
  }
}
