import { DateTime } from "luxon";
import { v4 as uuid } from 'uuid';

export interface Reminder {
    id: string
    time: DateTime
}

export function mkReminder(hours: string, minutes: string): Reminder {
    return {
        id: uuid(),
        time: DateTime.fromObject({
            hour: parseInt(hours), minute: parseInt(minutes)
        })
    }
}
