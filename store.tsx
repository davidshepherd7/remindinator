import AsyncStorage from "@react-native-async-storage/async-storage"
import { combineReducers, configureStore, createSlice, Dispatch, getDefaultMiddleware, PayloadAction } from "@reduxjs/toolkit"
import { getAllScheduledNotificationsAsync } from "expo-notifications";
import { keyBy } from "lodash";
import { Platform } from "react-native";
import { FLUSH, PAUSE, PERSIST, persistReducer, PURGE, REGISTER, REHYDRATE } from "redux-persist"
import { clearNotifyState, guessNextTrigger, removeNotify, scheduleNotify } from "./notifications";
import { Reminder, Notification } from "./types";

interface ReminderState {
    reminders: Reminder[]
    lastRemoved: Reminder | null
}

const initialState: ReminderState = {
    reminders: [],
    lastRemoved: null,
}
const reminderSlice = createSlice({
    name: 'reminders',
    initialState,
    reducers: {
        addReminder: (state, action: PayloadAction<{ id: string, title: string, body: string, hours: number, minutes: number }>) => {
            const { id, title, body, hours, minutes } = action.payload
            const r: Reminder = {
                id, title, body, time: { hour: hours, minute: minutes }
            }
            scheduleNotify(r)
            return {
                reminders: [...state.reminders, r],
                lastRemoved: state.lastRemoved,
            }
        },
        recacheNotificationData: (state, action: PayloadAction<{ notifications: Notification[] }>) => {
            const { notifications } = action.payload
            // TODO: warn on duplicate reminder ids?
            const cache = keyBy(notifications, 'reminderId')
            return {
                reminders: state.reminders.map((r) => ({ ...r, notification: cache[r.id] })),
                lastRemoved: state.lastRemoved,
            }
        },
        removeReminder: (state, action: PayloadAction<{ reminder: Reminder }>) => {
            const { reminder } = action.payload
            // TODO: validate that reminder exists?
            removeNotify(reminder)
            return {
                reminders: state.reminders.filter(r => r.id !== reminder.id),
                lastRemoved: reminder,
            }
        },
        undoRemoveReminder: (state) => {
            if (state.lastRemoved === null)
                return
            scheduleNotify(state.lastRemoved)
            return {
                reminders: [...state.reminders, state.lastRemoved],
                lastRemoved: null,
            }
        },
        clearState: (_state) => {
            clearNotifyState()
            return { reminders: [], lastRemoved: null }
        },
    }
})
export const { addReminder, recacheNotificationData, removeReminder, undoRemoveReminder, clearState } = reminderSlice.actions



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
