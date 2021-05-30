import { DateTime } from 'luxon';
import { v4 as uuid } from 'uuid';

export interface Reminder {
    id: string,
    title: string,
    body: string,
    time: {
        hour: number,
        minute: number
    }
    notification?: Notification
}

export function mkReminder(title: string, body: string, hour: number, minute: number): Reminder {
    return {
        id: uuid(),
        title: title,
        body: body,
        time: { hour, minute },
    }
}

export interface Notification {
    identifier: string
    title: string
    nextTrigger: string | undefined
    reminderId: string
}
