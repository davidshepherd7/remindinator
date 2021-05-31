import { addNotificationResponseReceivedListener, DEFAULT_ACTION_IDENTIFIER, dismissNotificationAsync, NotificationResponse, setNotificationCategoryAsync } from "expo-notifications"
import { Duration } from "luxon"
import { categoryId, NotificationData, rescheduleNotification } from "./notifications"
import { store, recacheScheduledNotifications } from "./store"

const doneId = "DONE"
const tenMinutesId = "10_MINUTES"
const hourId = "1_HOUR"


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

    recacheScheduledNotifications(store.dispatch)
}

export async function notificationDone(reminderId: string) {
    console.log(`Reminder ${reminderId} is done`)
}
