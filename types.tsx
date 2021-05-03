import { v4 as uuid } from 'uuid';

export interface Reminder {
    id: string,
    title: string,
    time: {
        hour: number,
        minute: number
    }
}

export function mkReminder(title:string, hour: number, minute: number): Reminder {
    return {
        id: uuid(),
        title: title,
        time: { hour, minute },
    }
}
