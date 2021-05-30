import { Reminder } from "./types";
import { addNotificationResponseReceivedListener, cancelAllScheduledNotificationsAsync, DEFAULT_ACTION_IDENTIFIER, deleteNotificationCategoryAsync, dismissAllNotificationsAsync, dismissNotificationAsync, NotificationContent, NotificationResponse, scheduleNotificationAsync, setNotificationCategoryAsync } from "expo-notifications";
import { DateTime, Duration } from "luxon";

const categoryId = "STANDARD_REMINDER";

const doneId = "DONE"
const tenMinutesId = "10_MINUTES"
const hourId = "1_HOUR"

interface XNotificationData {
    reminderId: string;
}
type NotificationData = XNotificationData & {
    [key: string]: any
}

function MINUTES(m: number): Duration {
    return Duration.fromObject({ minutes: m })
}

function HOURS(m: number): Duration {
    return Duration.fromObject({ hours: m })
}

export async function configureCategories() {
    await setNotificationCategoryAsync(categoryId, [
        {
            identifier: doneId,
            buttonTitle: "✓ Done!",
        },
        {
            identifier: tenMinutesId,
            buttonTitle: "snooze 10 mins"
        },
        {
            identifier: hourId,
            buttonTitle: "snooze 1 hour"
        }
    ])
}

export function configureListeners() {
    addNotificationResponseReceivedListener(handleNotificationClick)
}


export async function clearNotifyState() {
    return await Promise.all([
        dismissAllNotificationsAsync(),
        cancelAllScheduledNotificationsAsync(),
        deleteNotificationCategoryAsync(categoryId)
    ])
}

export function handleNotificationClick(event: NotificationResponse): void {
    const data = event.notification.request.content.data as NotificationData
    switch (event.actionIdentifier) {
        case DEFAULT_ACTION_IDENTIFIER: //fall-through
        case doneId:
            notificationDone(data.reminderId)
            dismissNotificationAsync(event.notification.request.identifier)
            break
        case tenMinutesId:
            rescheduleNotification(event.notification.request.content, MINUTES(10))
            dismissNotificationAsync(event.notification.request.identifier)
            break
        case hourId:
            rescheduleNotification(event.notification.request.content, HOURS(1))
            dismissNotificationAsync(event.notification.request.identifier)
            break
    }
}


export async function notificationDone(reminderId: string) {
    console.log(`Reminder ${reminderId} is done`)
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
