import * as React from 'react';
import * as renderer from 'react-test-renderer';

import { HomeScreen } from './App';


describe('<HomeScreen />', () => {
    it('renders', () => {
        const tree = renderer.create(<HomeScreen />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
