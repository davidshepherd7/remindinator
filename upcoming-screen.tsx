import { getAllScheduledNotificationsAsync, NotificationTrigger } from 'expo-notifications';
import { DateTime, Duration } from 'luxon';
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';

interface Notification {
    identifier: string
    title: string
    nextTrigger: DateTime | null
}

// Types for this seem to be all wrong
function guessNextTrigger(trigger: any): DateTime | null {
    console.log(trigger)
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

    // TODO other trigger types?

    return null
}

export function ListNotificationsScreen() {
    const [notifications, setNotifications] = useState<undefined | Notification[]>(undefined)

    useEffect(() => {
        const fetch = async () => {
            const notificationsRaw = await getAllScheduledNotificationsAsync()
            const notifications = notificationsRaw.map(n => {
                return {
                    identifier: n.identifier,
                    title: n.content.title || "<unknown>",
                    nextTrigger: guessNextTrigger(n.trigger),
                }
            })
            setNotifications(notifications)
        }
        fetch()
    }, [])

    return (
        <NotificationList notifications={notifications} />
    )
}

export function NotificationList({ notifications }: { notifications: undefined | Notification[] }) {

    let content
    if (notifications === undefined) {
        content = <Text>Loading</Text>
    }
    else if (notifications.length === 0) {
        content = <Text>No upcoming notifications</Text>
    }
    else {
        content = notifications.map((n) => <View key={n.identifier}>
            <Text> "{n.title}" {n.nextTrigger?.toRelative()} </Text>
        </View>)
    }

    return (
        <View style={styles.container}>
            {content}
        </View>
    )

}
