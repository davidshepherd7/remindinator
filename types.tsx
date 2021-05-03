import { v4 as uuid } from 'uuid';

export interface Reminder {
    id: string,
    time: {
        hour: number,
        minute: number
    }
}

export function mkReminder(hour: number, minute: number): Reminder {
    return {
        id: uuid(),
        time: { hour, minute },
    }
}
