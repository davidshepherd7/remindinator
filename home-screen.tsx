import { View } from 'react-native'
import { styles } from './styles';
import * as React from 'react';
import { clearState } from './store';
import { useDispatch } from 'react-redux';
import { Button } from 'react-native-paper';


export function HomeScreen({ navigation }: any) {

    const dispatch = useDispatch()
    const reset = () => {
        dispatch(clearState({}))
    }

    return (
        <View style={styles.container}>
            <Button mode="contained" onPress={() => navigation.navigate('Create')}>Remind me to...</Button>
            <Button onPress={() => navigation.navigate('List')}>All reminders</Button>
            <Button onPress={reset}>Factory reset</Button>
        </View>
    );
}
