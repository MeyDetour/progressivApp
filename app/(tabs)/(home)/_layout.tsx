import {Stack} from "expo-router";

export default function RootLayout() {

    return (<Stack screenOptions={{}}>
            <Stack.Screen name="index"/>
            <Stack.Screen name="details"/>
            <Stack.Screen name="audio"/>

        </Stack>
    )
}
