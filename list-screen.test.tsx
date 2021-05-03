import React from "react";
import { ReminderList } from "./list-screen";
import * as renderer from 'react-test-renderer';
import { mkReminder } from "./types";


describe(`ListReminders`, () => {
    it(`does something nice for no reminders`, () => {
        const tree = renderer.create(<ReminderList reminders={[]} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it('renders some reminders', () => {
        const reminders = [mkReminder(10, 30), mkReminder(12, 0)]
        const tree = renderer.create(<ReminderList reminders={reminders} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});

