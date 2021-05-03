import { View, Button } from 'react-native'
import { styles } from './styles';
import * as React from 'react';
import { clearState } from './store';
import { useDispatch } from 'react-redux';


export function HomeScreen({ navigation }: any) {

    const dispatch = useDispatch()
    const reset = () => {
        dispatch(clearState({}))
    }

    return (
        <View style={styles.container}>
            <Button title="Remind me to..." onPress={(_) => navigation.navigate('Create')}></Button>
            <Button title="All reminders" onPress={() => navigation.navigate('List')}></Button>
            <Button title="Factory reset" onPress={reset} />
        </View>
    );
}
