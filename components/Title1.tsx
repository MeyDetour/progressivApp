import {Text, StyleSheet} from "react-native";
import {red} from "react-native-reanimated/lib/typescript/Colors";
import {ReactNode, useEffect} from "react";
import {useFonts} from "expo-font";
import {SplashScreen} from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function Title1({children, classes}: { children: ReactNode; classes?: string | object }) {


    const [loaded, error] = useFonts({
        'CamptonBook': require("../assets/fonts/campton/CamptonBook.otf"), // Chemin corrigé
    });

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }
    return (
        <Text style={[styles.title,classes]}>{children}</Text>
    )
}


const styles = StyleSheet.create({
    title: {
        fontSize: 40,
        color: "#abcefd",
        fontFamily: "CamptonBook"
    }
})