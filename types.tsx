
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

export interface Notification {
    identifier: string
    title: string
    nextTrigger: string | undefined
    reminderId: string
}
