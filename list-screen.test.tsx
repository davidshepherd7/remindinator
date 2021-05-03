import React from "react";
import { ReminderList } from "./list-screen";
import { mkReminder } from "./store";
import * as renderer from 'react-test-renderer';


describe(`ListReminders`, () => {
    it('renders', () => {
        const reminders = [mkReminder("10", "30"), mkReminder("12", "0")]
        const tree = renderer.create(<ReminderList reminders={reminders} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
