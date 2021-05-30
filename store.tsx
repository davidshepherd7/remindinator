import AsyncStorage from "@react-native-async-storage/async-storage"
import { combineReducers, configureStore, createSlice, Dispatch, getDefaultMiddleware } from "@reduxjs/toolkit"
import { getAllScheduledNotificationsAsync } from "expo-notifications";
import { keyBy } from "lodash";
import { DateTime, Duration } from "luxon";
import { Platform } from "react-native";
import { FLUSH, PAUSE, PERSIST, persistReducer, PURGE, REGISTER, REHYDRATE } from "redux-persist"
import { clearNotifyState, scheduleNotify } from "./notifications";
import { mkReminder, Reminder, Notification } from "./types";


const reminderSlice = createSlice({
    name: 'reminders',
    initialState: {
        reminders: [] as Reminder[]
    },
    reducers: {
        addReminder: (state, action) => {
            const { title, body, hours, minutes } = action.payload
            const r = mkReminder(title, body, hours, minutes)
            scheduleNotify(r)
            return { reminders: [...state.reminders, r] }
        },
        updateNotifications: (state, action) => {
            const { notifications } = action.payload
            const cache = keyBy(notifications, 'reminderId')
            return { reminders: state.reminders.map((r) => ({ ...r, notification: cache[r.id] })) }
        },
        clearState: (_state, _action) => {
            clearNotifyState()
            return { reminders: [] }
        },
    }
})
export const { addReminder, updateNotifications, clearState } = reminderSlice.actions

const reducers = combineReducers({ reminders: reminderSlice.reducer })
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




// Types for this seem to be all wrong
function guessNextTrigger(trigger: any): DateTime {
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
            nextTrigger: guessNextTrigger(n.trigger).toISO(),
            reminderId: n.content.data.reminderId as string,
        }
    })
}

export async function updateScheduledNotifications(dispatch: Dispatch<any>): Promise<void> {
    const notifications = await fetchScheduledNotifications()
    dispatch(updateNotifications({ notifications }))
}
