import * as React from 'react';
import { v4 as uuid } from 'uuid';
import { useState } from "react"
import { useDispatch } from "react-redux"
import { addReminder, recacheScheduledNotifications } from "./store"
import { ScrollView, View } from 'react-native'
import { Button, HelperText, TextInput } from 'react-native-paper';

const marginSize = 10;

class ValidationError extends Error {
    constructor(public message: string) {
        super()
    }
}


function TextField({ onChangeText, placeholder, required }: { onChangeText: (a: string | null) => void, placeholder: string, required: boolean }) {

    const [error, setError] = useState('')
    const [touched, setTouched] = useState(false)

    function onChangeTextInner(x: string): void {
        if (x !== '') {
            setTouched(true)
        }

        if (touched) {
            if (required && x === '') {
                setError("Required")
                onChangeText(null)
                return
            }
        }

        setError('')
        onChangeText(x)
    }

    return (
        <View>
            <TextInput
                style={{ margin: marginSize }} placeholder={placeholder} onChangeText={onChangeTextInner}
                error={!!error}>
            </TextInput>
            <HelperText type="error" visible={!!error}>
                {error}
            </HelperText>
        </View>
    )
}

type Time = { hours: number, minutes: number }

function validateWholeNumber(x: string, min?: number, max?: number): number {
    if (x === '') {
        throw new ValidationError("Required")
    }

    const allDigits = /^[0-9]*$/
    if (!allDigits.test(x)) {
        throw new ValidationError("Must be digits")
    }

    const xNum = parseInt(x)
    if (isNaN(xNum)) {
        throw new ValidationError("Must be a number")
    }

    if (min !== undefined && xNum < min) {
        throw new ValidationError("Must be greater than min")
    }

    if (max !== undefined && xNum >= max) {
        throw new ValidationError("Must be less than max")
    }

    return xNum
}


function TimeField({ onChangeTime }: { onChangeTime: (a: Time | null) => void }) {
    const [hour, setHour] = useState<number | null>(null)
    const [hourError, setHourError] = useState('')
    const [minute, setMinute] = useState<number | null>(null)
    const [minuteError, setMinuteError] = useState('')

    function onHourChange(x: string): void {
        try {
            const hour = validateWholeNumber(x, 0, 23)
            setHourError('')
            setHour(hour)
            if (minute !== null) {
                onChangeTime({ hours: hour, minutes: minute })
            }
        }
        catch (e: unknown) {
            if (e instanceof ValidationError) {
                setHourError(e.message)
                setHour(null)
                onChangeTime(null)
            }
            else {
                throw e
            }
        }
    }

    function onMinuteChange(x: string): void {
        try {
            const minute = validateWholeNumber(x, 0, 59)
            setMinuteError('')
            setMinute(minute)
            if (hour !== null) {
                onChangeTime({ hours: hour, minutes: minute })
            }
        }
        catch (e: unknown) {
            if (e instanceof ValidationError) {
                setMinuteError(e.message)
                setMinute(null)
                onChangeTime(null)
            }
            else {
                throw e
            }
        }
    }

    return (
        <View style={{ margin: marginSize }}>
            <View style={{ flexDirection: 'row' }}>
                <TextInput style={{ flex: 1, marginRight: marginSize }} placeholder="Hours" onChangeText={t => onHourChange(t)} error={!!hourError}
                    keyboardType='number-pad'>
                </TextInput>
                <TextInput style={{ flex: 1 }} placeholder="Minutes" onChangeText={t => onMinuteChange(t)}
                    keyboardType='number-pad'>
                </TextInput>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <HelperText style={{ flex: 1 }} type="error" visible={!!hourError}>
                    {hourError}
                </HelperText>
                <HelperText style={{ flex: 1 }} type="error" visible={!!minuteError}>
                    {minuteError}
                </HelperText>
            </View>
        </View>
    )
}

export function CreateReminderScreen({ navigation }: any) {
    const [title, setTitle] = useState<null | string>(null)
    const [body, setBody] = useState<null | string>(null)
    const [time, setTime] = useState<null | Time>(null)
    const dispatch = useDispatch()

    function isValid(): boolean {
        return title !== null && time !== null
    }

    function onPress(): void {
        if (title === null || time === null) {
            return
        }
        const id = uuid()

        dispatch(addReminder({ id, title, body: body || "", hours: time.hours, minutes: time.minutes }))
        recacheScheduledNotifications(dispatch)
        navigation.navigate("Remindinator")
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1, height: '100%' }}>
                <TextField required={true} placeholder="Take my medicine..." onChangeText={t => setTitle(t)}></TextField>
                <TimeField onChangeTime={time => setTime(time)}></TimeField>
                <TextField required={false} placeholder="Details" onChangeText={t => setBody(t)}></TextField>
            </ScrollView >

            <Button mode="contained" onPress={onPress} disabled={!isValid()}>
                Create
            </Button>
        </View >
    )
}
