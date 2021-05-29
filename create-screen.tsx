import * as React from 'react';

import { useState } from "react"
import { useDispatch } from "react-redux"
import { addReminder } from "./store"
import { ScrollView, View } from 'react-native'
import { Button, TextInput } from 'react-native-paper';

const marginSize = 10;

export function CreateReminderScreen({ navigation }: any) {
    const [minutes, setMinutes] = useState('')
    const [hours, setHours] = useState('')

    const [title, setTitle] = useState('')

    const dispatch = useDispatch()
    const onPress = () => {
        dispatch(addReminder({ title, hours: parseInt(hours), minutes: parseInt(minutes) }))
        navigation.navigate("Home")
    }

    // TODO: validation

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1, height: '100%' }}>
                <TextInput style={{ margin: marginSize }} placeholder="Take my medicine..." onChangeText={t => setTitle(t)}></TextInput>
                <View style={{ margin: marginSize, flexDirection: 'row' }}>
                    <TextInput style={{ flex: 1, marginRight: marginSize }} placeholder="Hours" onChangeText={t => setHours(t)}></TextInput>
                    <TextInput style={{ flex: 1 }} placeholder="Minutes" onChangeText={t => setMinutes(t)}></TextInput>
                </View>
            </ScrollView >

            <Button mode="contained" onPress={onPress}>
                Create
            </Button>
        </View >
    )
}
