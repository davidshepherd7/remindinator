import { getAllScheduledNotificationsAsync } from "expo-notifications";
import { DateTime, Duration } from "luxon";
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Platform } from "react-native";
import { Card, Paragraph, Title } from "react-native-paper";
import { useSelector } from "react-redux";
import { styles } from "./styles";
import { Reminder } from "./types";

interface Notification {
    identifier: string
    title: string
    nextTrigger: DateTime | undefined
    reminderId: string
}

// Types for this seem to be all wrong
function guessNextTrigger(trigger: any): DateTime | undefined {
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

    return
}


async function fetchScheduledNotifications(): Promise<Notification[]> {
    if (Platform.OS === "web") {
        return []
    }

    const notificationsRaw = await getAllScheduledNotificationsAsync()
    return notificationsRaw.map(n => {
        return {
            identifier: n.identifier,
            title: n.content.title || "<unknown>",
            nextTrigger: guessNextTrigger(n.trigger),
            reminderId: n.content.data.reminderId as string,
        }
    })
}


function asDateTime(reminder: Reminder) {
    return DateTime.fromObject(reminder.time)
}


export function ListRemindersScreen() {
    const [notifications, setNotifications] = useState<undefined | Notification[]>(undefined)

    useEffect(() => {
        fetchScheduledNotifications()
            .then((notifications) => {
                setNotifications(notifications)
            })
    }, [])

    const reminders = useSelector<any>(state => state.reminders.reminders) as Reminder[]

    return (
        <ReminderList reminders={reminders} notifications={notifications}></ReminderList>
    )
}

const cardStyle = {
    margin: 5,
}

export function ReminderList({ reminders, notifications }: { reminders: Reminder[], notifications: Notification[] | undefined }) {
    let content;
    if (reminders.length === 0) {
        content = <Text>No reminders yet, why not create one?</Text>
    }
    else {
        content = reminders.map((r) => {
            const nextTrigger = notifications?.find(e => e.reminderId === r.id)?.nextTrigger
            return (
                <Card key={r.id} style={cardStyle}>
                    <Card.Title title={r.title} />
                    <Card.Content>
                        <Paragraph>
                            Reminder at {asDateTime(r).toFormat("HH:mm")} every day.
                        </Paragraph>
                        <Paragraph>
                            Next notification at {nextTrigger?.toRelative()}.
                        </Paragraph>
                    </Card.Content>
                </Card >
            )
        })
    }

    return (
        <ScrollView>
            {content}
        </ScrollView>
    )
}
