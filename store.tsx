import AsyncStorage from "@react-native-async-storage/async-storage"
import { combineReducers, configureStore, createSlice, getDefaultMiddleware } from "@reduxjs/toolkit"
import { DateTime, Duration } from "luxon"
import { FLUSH, PAUSE, PERSIST, persistReducer, PURGE, REGISTER, REHYDRATE } from "redux-persist"
import { v4 as uuid } from 'uuid';
import * as Notifications from 'expo-notifications';

function MINUTES(m: number): Duration {
    return Duration.fromObject({ minutes: m })
}

function scheduleNotify(reminder: Reminder) {
    [0, 1, 2].map(i => {
        const when = reminder.time.plus(MINUTES(10 * i))
        Notifications.scheduleNotificationAsync({
            content: {
                title: "Do the thing",
                body: 'Please :)',
                data: {
                    reminderId: reminder.id,
                    reminderNumber: i
                }
            },
            trigger: {
                hour: when.hour,
                minute: when.minute,
                repeats: true
            },
        });
    })
}


export interface Reminder {
    id: string
    time: DateTime
}

export function mkReminder(hours: string, minutes: string): Reminder {
    return {
        id: uuid(),
        time: DateTime.fromObject({
            hour: parseInt(hours), minute: parseInt(minutes)
        })
    }
}



const reminderSlice = createSlice({
    name: 'reminders',
    initialState: {
        reminders: [] as Reminder[]
    },
    reducers: {
        addReminder: (state, action) => {
            const { hours, minutes } = action.payload
            const r = mkReminder(hours, minutes)
            scheduleNotify(r)
            return { reminders: [...state.reminders, r] }
        }
    }
})
export const { addReminder } = reminderSlice.actions



const reducers = combineReducers({ reminders: reminderSlice.reducer })
const persistConfig = {
    key: 'root',
    version: 1,
    storage: AsyncStorage,
}
const persistedReducer = persistReducer(persistConfig, reducers);
export const store = configureStore({
    reducer: persistedReducer, middleware: getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
        }
    })
})
