import AsyncStorage from "@react-native-async-storage/async-storage"
import { combineReducers, configureStore, createSlice, Dispatch, getDefaultMiddleware } from "@reduxjs/toolkit"
import { getAllScheduledNotificationsAsync } from "expo-notifications";
import { keyBy } from "lodash";
import { DateTime, Duration } from "luxon";
import { Platform } from "react-native";
import { FLUSH, PAUSE, PERSIST, persistReducer, PURGE, REGISTER, REHYDRATE } from "redux-persist"
import { clearNotifyState, guessNextTrigger, scheduleNotify } from "./notifications";
import { mkReminder, Reminder, Notification } from "./types";

interface ReminderState {
    reminders: Reminder[]
}

const initialState: ReminderState = {
    reminders: []
}
const reminderSlice = createSlice({
    name: 'reminders',
    initialState,
    reducers: {
        addReminder: (state, action) => {
            const { title, body, hours, minutes } = action.payload
            const r = mkReminder(title, body, hours, minutes)
            scheduleNotify(r)
            return { reminders: [...state.reminders, r] }
        },
        recacheNotificationData: (state, action) => {
            const { notifications } = action.payload
            // TODO: warn on duplicate reminder ids?
            const cache = keyBy(notifications, 'reminderId')
            return { reminders: state.reminders.map((r) => ({ ...r, notification: cache[r.id] })) }
        },
        clearState: (_state, _action) => {
            clearNotifyState()
            return { reminders: [] }
        },
    }
})
export const { addReminder, recacheNotificationData, clearState } = reminderSlice.actions


const reducers = combineReducers({ reminders: reminderSlice.reducer })
export interface RootState {
    reminders: ReminderState
}


const persistConfig = {
    key: 'root',
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

async function fetchScheduledNotifications(): Promise<Notification[]> {
    if (Platform.OS === "web") {
        return []
    }

    const notificationsRaw = await getAllScheduledNotificationsAsync()
    return notificationsRaw.map(n => {
        return {
            identifier: n.identifier,
            title: n.content.title || "<unknown>",
            nextTrigger: guessNextTrigger(n.trigger).toISO(),
            reminderId: n.content.data.reminderId as string,
        }
    })
}

export async function recacheScheduledNotifications(dispatch: Dispatch<any>): Promise<void> {
    const notifications = await fetchScheduledNotifications()
    dispatch(recacheNotificationData({ notifications }))
}
