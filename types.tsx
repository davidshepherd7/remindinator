import { v4 as uuid } from 'uuid';

export interface Reminder {
    id: string,
    title: string,
    body: string,
    time: {
        hour: number,
        minute: number
    }
}

export function mkReminder(title: string, body: string, hour: number, minute: number): Reminder {
    return {
        id: uuid(),
        title: title,
        body: body,
        time: { hour, minute },
    }
}
