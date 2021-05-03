import { Text, View, Button } from 'react-native'
import { styles } from './styles';
import * as React from 'react';


export function HomeScreen({ navigation }: any) {
    return (
        <View style={styles.container}>
            <Text>Remind me to:</Text>
            <Button title="Take my meds every day" onPress={(_) => navigation.navigate('Create')}></Button>
            <Button title="All reminders" onPress={() => navigation.navigate('List')}></Button>
        </View>
    );
}
