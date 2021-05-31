import { View, ScrollView } from "react-native";
import React from "react";
import { removeReminder, RootState } from './store';
import { Button, Card, Paragraph } from 'react-native-paper';
import { DateTime } from "luxon";
import { useDispatch, useSelector } from "react-redux";
import { Reminder } from "./types";
import { chain } from 'lodash';

function asDateTime(reminder: Reminder): DateTime {
    return DateTime.fromObject(reminder.time)
}

const cardStyle = {
    margin: 5,
}

export function ReminderList({ reminders }: { reminders: Reminder[] }) {
    const dispatch = useDispatch()



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
                                    onPress={() => dispatch(removeReminder({ reminder: r }))}> Delete </Button>
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

export function HomeScreen({ navigation }: any) {
    const reminders = useSelector((state: RootState) => state.reminders.reminders)
    return (
        < View style={{ flex: 1 }}>
            <Button mode="contained" onPress={() => navigation.navigate('New Reminder')}>Remind me to...</Button>
            <ReminderList reminders={reminders}></ReminderList>
        </View >
    )
}
