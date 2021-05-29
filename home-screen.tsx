import { View, Text, ScrollView, Platform } from "react-native";
import React, { useEffect, useState } from "react";
import { clearState } from './store';
import { useDispatch } from 'react-redux';
import { Button, Card, Paragraph } from 'react-native-paper';
import { getAllScheduledNotificationsAsync } from "expo-notifications";
import { DateTime, Duration } from "luxon";
import { useSelector } from "react-redux";
import { Reminder } from "./types";
import { keyBy, sortBy, chain } from 'lodash';



interface Notification {
    identifier: string
    title: string
    nextTrigger: DateTime | undefined
    reminderId: string
}

type ReminderWithNotification = Reminder & { notification: Notification | undefined }

// Types for this seem to be all wrong
function guessNextTrigger(trigger: any): DateTime {
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
    else {
        throw Error(`Unhandled trigger type ${trigger.type}`)
    }
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


function asDateTime(reminder: Reminder): DateTime {
    return DateTime.fromObject(reminder.time)
}


const cardStyle = {
    margin: 5,
}

export function ReminderList({ reminders }: { reminders: ReminderWithNotification[] }) {
    let content;
    if (reminders.length === 0) {
        content = <Card style={cardStyle}>
            <Card.Content>
                <Paragraph>No reminders yet, why not create one?</Paragraph>
            </Card.Content>
        </Card >
    }
    else {
        content = chain(reminders)
            .sortBy(r => r.notification?.nextTrigger)
            .map((r) => {
                return (
                    <Card key={r.id} style={cardStyle}>
                        <Card.Title title={r.title} />
                        <Card.Content>
                            <Paragraph>
                                Reminder at {asDateTime(r).toFormat("HH:mm")} every day.
                        </Paragraph>
                            <Paragraph>
                                Next {r.notification?.nextTrigger?.toRelative() || '...'}.
                        </Paragraph>
                        </Card.Content>
                    </Card >
                )
            })
            .value()
    }

    return (
        <ScrollView>
            {content}
        </ScrollView>
    )
}

export function HomeScreen({ navigation }: any) {

    const dispatch = useDispatch()
    const reset = () => {
        dispatch(clearState({}))
    }

    // TODO: this doesn't refresh often/quickly enough
    const [notifications, setNotifications] = useState<undefined | Notification[]>(undefined)

    useEffect(() => {
        fetchScheduledNotifications()
            .then((notifications) => {
                setNotifications(notifications)
            })
    }, [])

    const reminders = useSelector<any>(state => state.reminders.reminders) as Reminder[]

    if (notifications === undefined) {
        return (
            <View>
                <Text>Loading...</Text>
            </View>
        )
    }
    else {
        const cache = keyBy(notifications, 'reminderId')
        const combined = reminders.map((r) => ({ ...r, notification: cache[r.id] }))

        return (
            < View style={{ flex: 1 }}>
                <Button mode="contained" onPress={() => navigation.navigate('New Reminder')}>Remind me to...</Button>
                <ReminderList reminders={combined}></ReminderList>
            </View >
        )
    }
}
