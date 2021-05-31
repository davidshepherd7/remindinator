import { View, Text, ScrollView } from "react-native";
import React, { useState } from "react";
import { removeReminder, RootState, undoRemoveReminder } from './store';
import { Button, Card, Paragraph } from 'react-native-paper';
import { DateTime } from "luxon";
import { useDispatch, useSelector } from "react-redux";
import { Reminder } from "./types";
import { chain } from 'lodash';
import Toast from 'react-native-root-toast';

function asDateTime(reminder: Reminder): DateTime {
    return DateTime.fromObject(reminder.time)
}

const cardStyle = {
    margin: 5,
}

export function ReminderList({ reminders, onDelete }: { reminders: Reminder[], onDelete: (r: Reminder) => void }) {
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
                const nextTrigger = r.notification?.nextTrigger ?
                    DateTime.fromISO(r.notification?.nextTrigger) :
                    undefined

                return (
                    <Card key={r.id} style={cardStyle}>
                        <Card.Title title={r.title} />
                        <Card.Content>
                            <Paragraph>
                                Reminder at {asDateTime(r).toFormat("HH:mm")} every day.
                            </Paragraph>
                            <Paragraph>
                                Next {nextTrigger?.toRelative() || '...'}.
                            </Paragraph>
                            {
                                r.body ?
                                    <Paragraph style={{
                                        borderTopColor: 'gainsboro',
                                        marginTop: 8,
                                        paddingTop: 8,
                                        borderTopWidth: 1,
                                    }}>{r.body}</Paragraph> :
                                    undefined
                            }
                            <Card.Actions>
                                <Button
                                    icon="trash-can"
                                    mode="outlined"
                                    color="red"
                                    onPress={() => onDelete(r)}> Delete </Button>
                            </Card.Actions>
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

function UndoDeletionToast({ lastRemoved, onUndoDelete }: { lastRemoved: Reminder, onUndoDelete: () => void }) {
    const maxLen = 15
    let label
    if (lastRemoved.title.length <= maxLen) {
        label = lastRemoved.title
    }
    else {
        label = lastRemoved.title.slice(0, maxLen - 3) + "..."
    }

    return (
        <Toast
            visible={true}
            hideOnPress={false}
        >
            <View style={{ flex: 1, flexDirection: "row", justifyContent: 'center' }}>
                <Text style={{ color: "white", height: "100%", textAlignVertical: "center" }}>
                    Deleted "{label}"
                </Text>
                <Button color="yellow" onPress={() => onUndoDelete()}>
                    Undo
            </Button>
            </View>
        </Toast>
    )
}


export function HomeScreen({ navigation }: any) {
    const reminders = useSelector((state: RootState) => state.reminders.reminders)
    const lastRemoved = useSelector((state: RootState) => state.reminders.lastRemoved)
    const dispatch = useDispatch()
    const [showToast, setShowToast] = useState(false)

    let timeoutId: ReturnType<typeof setTimeout>
    function onDelete(reminder: Reminder): void {
        dispatch(removeReminder({ reminder }))
        setShowToast(true)
        clearTimeout(timeoutId)
        timeoutId = setTimeout(function() { setShowToast(false) }, 10000)
    }

    function onUndoDelete(): void {
        dispatch(undoRemoveReminder({}))
        clearTimeout(timeoutId)
        setShowToast(false)
    }

    return (
        < View style={{ flex: 1 }}>
            <Button mode="contained" onPress={() => navigation.navigate('New Reminder')}>
                Remind me to...
            </Button>
            <ReminderList reminders={reminders} onDelete={onDelete}></ReminderList>
            {
                (showToast && lastRemoved !== null) ?
                    <UndoDeletionToast lastRemoved={lastRemoved} onUndoDelete={onUndoDelete} /> :
                    undefined
            }
        </View >
    )
}
