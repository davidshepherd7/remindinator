import { Reminder } from "./types";
import { cancelAllScheduledNotificationsAsync, cancelScheduledNotificationAsync, deleteNotificationCategoryAsync, dismissAllNotificationsAsync, getNextTriggerDateAsync, NotificationContent, scheduleNotificationAsync } from "expo-notifications";
import { DateTime, Duration } from "luxon";
import { range } from "lodash";


export const categoryId = "STANDARD_REMINDER";

interface XNotificationData {
    reminderId: string;
}
export type NotificationData = XNotificationData & {
    [key: string]: any
}

// Types for this seem to be all wrong
export function guessNextTrigger(trigger: any): DateTime {
    const now = DateTime.now()
    if (trigger.type === 'daily') {
        const { hour, minute } = trigger
        const datePart = (now.hour > hour || (now.hour === hour && now.minute >= minute)) ?
            now.plus(Duration.fromObject({ day: 1 })) :
            now;
        return datePart.set({ hour: hour, minute: minute, second: 0, millisecond: 0 })
    }
    else if (trigger.type === "date") {
        return DateTime.fromMillis(trigger.value)
    }
    else {
        throw Error(`Unhandled trigger type ${trigger.type}`)
    }
}

export async function clearNotifyState() {
    return await Promise.all([
        dismissAllNotificationsAsync(),
        cancelAllScheduledNotificationsAsync(),
        deleteNotificationCategoryAsync(categoryId)
    ])
}


export async function rescheduleNotification(content: NotificationContent, delay: Duration) {
    const when = DateTime.now().plus(delay)
    return await scheduleNotificationAsync({
        content: {
            title: content.title || undefined,
            body: content.body || undefined,
            data: content.data,
            categoryIdentifier: categoryId,
        },
        trigger: {
            date: when.toJSDate(),
        },
    });

}

export async function scheduleNotify(reminder: Reminder): Promise<string> {
    const data: NotificationData = {
        reminderId: reminder.id,
    }

    return await scheduleNotificationAsync({
        content: {
            title: reminder.title,
            body: reminder.body,
            data: data,
            categoryIdentifier: categoryId,
        },
        trigger: {
            hour: reminder.time.hour,
            minute: reminder.time.minute,
            repeats: true
        },
    });
}

export async function removeNotify(reminder: Reminder): Promise<void> {
    const id = reminder.notification?.identifier
    if (id) {
        await cancelScheduledNotificationAsync(id)
    }
}
