import { Link } from "expo-router";
import { Text, View } from "react-native";
import Title1 from "@/components/Title1";
import Animated, {
    useSharedValue,
    withTiming,
    useAnimatedStyle,
    Easing,
} from 'react-native-reanimated';
import {  Button, StyleSheet } from 'react-native';

export default function Index() {
    const randomWidth = useSharedValue(10);

    const config = {
        duration: 500,
        easing: Easing.bezier(0.5, 0.01, 0, 1),
    };

    const style = useAnimatedStyle(() => {
        return {
            width: withTiming(randomWidth.value, config),
        };
    });

    return (
        <View style={styles.container}>  <Link href="/">show Home</Link>
            <Animated.View style={[styles.box, style]} />
            <Button
                title="toggle"
                onPress={() => {
                    randomWidth.value = Math.random() * 350;
                }}
            />
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    box: {
        width: 100,
        height: 80,
        backgroundColor: 'black',
        margin: 30,
    },
});