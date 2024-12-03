import {Stack} from "expo-router";

export default function RootLayout() {

    return (<Stack screenOptions={{}}>
            <Stack.Screen name="register"/>
            <Stack.Screen name="login"/>

        </Stack>
    )
}
