import {Stack} from "expo-router";

export default function RootLayout() {
    return (<Stack screenOptions={{}}>
            <Stack.Screen name="(home)"/>
            <Stack.Screen name="settings"/>
            <Stack.Screen name="camera"/>

        </Stack>
    )
}
