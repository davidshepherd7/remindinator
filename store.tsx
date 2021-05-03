import AsyncStorage from "@react-native-async-storage/async-storage"
import { combineReducers, configureStore, createSlice, getDefaultMiddleware } from "@reduxjs/toolkit"
import { FLUSH, PAUSE, PERSIST, persistReducer, PURGE, REGISTER, REHYDRATE } from "redux-persist"
import { scheduleNotify } from "./notifications";
import { mkReminder, Reminder } from "./types";

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
    storage: AsyncStorage,
    migrate: async (state: any) => ({
        ...state,
        reminders: {
            reminders: []
        }
    })
}
const persistedReducer = persistReducer(persistConfig, reducers);
export const store = configureStore({
    reducer: persistedReducer, middleware: getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
        }
    })
})
