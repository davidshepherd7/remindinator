import { DateTime } from "luxon";
import React from "react";
import { View, Text } from "react-native";
import { useSelector } from "react-redux";
import { styles } from "./styles";
import { Reminder } from "./types";


function asDateTime(reminder: Reminder) {
    return DateTime.fromObject(reminder.time)
}


export function ListRemindersScreen() {
    const reminders = useSelector<any>(state => state.reminders.reminders) as Reminder[]

    return (
        <ReminderList reminders={reminders}></ReminderList>
    )
}

export function ReminderList({ reminders }: { reminders: Reminder[] }) {
    let content;
    if (reminders.length === 0) {
        content = <Text>No reminders yet, why not create one?</Text>
    }
    else {
        content = reminders.map((r) => <View key={r.id}><Text>
            Remember to {r.title} at {asDateTime(r).toFormat("HH:mm")} every day.
        </Text></View>)
    }

    return (
        <View style={styles.container}>
            {content}
        </View>
    )
}
