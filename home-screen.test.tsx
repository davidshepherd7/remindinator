import React from "react";
import { ReminderList } from "./home-screen";
import * as renderer from 'react-test-renderer';


// describe(`ListReminders`, () => {
//     it(`does something nice for no reminders`, () => {
//         const tree = renderer.create(<ReminderList reminders={[]} notifications={undefined} />).toJSON();
//         expect(tree).toMatchSnapshot();
//     });

//     it('renders some reminders', () => {
//         const reminders = [mkReminder("Test 1", "stuff", 10, 30), mkReminder("Test 2", "more stuff", 12, 0)]
//         const tree = renderer.create(<ReminderList reminders={reminders} notifications={undefined} />).toJSON();
//         expect(tree).toMatchSnapshot();
//     });
// });
