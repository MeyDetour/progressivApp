import {Stack} from "expo-router";
import {StyleSheet, View} from "react-native";

export default function RootLayout() {
    return (

        <Stack screenOptions={{}}>
            <Stack.Screen name="(home)"/>
            <Stack.Screen name="settings"/>
            <Stack.Screen name="camera"/>

        </Stack>

    )
}

