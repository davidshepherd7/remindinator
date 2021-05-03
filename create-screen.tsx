import * as React from 'react';

import { useState } from "react"
import { useDispatch } from "react-redux"
import { addReminder } from "./store"
import { View, Button, TextInput } from 'react-native'
import { styles } from "./styles"



export function CreateReminderScreen({ navigation }: any) {
    const [minutes, setMinutes] = useState('')
    const [hours, setHours] = useState('')

    const [title, setTitle] = useState('')

    const dispatch = useDispatch()
    const onPress = () => {
        dispatch(addReminder({ title, hours: parseInt(hours), minutes: parseInt(minutes) }))
        navigation.navigate("Home")
    }

    return (
        <View style={styles.container}>
            <TextInput placeholder="Label+" onChangeText={t => setTitle(t)}></TextInput>
            <TextInput placeholder="Hours" onChangeText={t => setHours(t)}></TextInput>
            <TextInput placeholder="Minutes" onChangeText={t => setMinutes(t)}></TextInput>
            <Button title="Create" onPress={onPress} />
        </View >
    )
}
