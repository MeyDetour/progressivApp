import {Link, Redirect} from "expo-router";
import {Text, TouchableOpacity, View, Image, useColorScheme, StyleSheet, Button} from "react-native";
import Title1 from "@/components/Title1";
import useApi, {SimpleFetch} from "@/hooks/useApi";
import {SetStateAction, useEffect, useState} from "react";
import useAuth from "@/hooks/useAuth";
import env from "@/app/routes";
import useSetAuth from "@/hooks/useSetAuth";
import useDestroyToken from "@/hooks/useDestroyToken";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function Home() {
    console.log("IN INDEX")

    //color
    const colorScheme = useColorScheme();
    const titleColor = colorScheme === "dark" ? styles.titleForDark : styles.titleForLight
    const backgroundColor = colorScheme === "dark" ? styles.backgroundForDark : styles.backgroundForLight


    const [customError, setError] = useState(null);
    const [presentationOfAI, setPresentationOfAI] = useState(null);

    console.log("presentation : ",presentationOfAI);

    useEffect(() => {
        AsyncStorage.getItem('@token:value').then((token) => {

            SimpleFetch(env.TEXT_TO_RESPONSE, {"prompt": "Bonjour, qui es-tu ? Repond moi en deux phrases "}, "POST", undefined, {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }).then((response) => {

                    setPresentationOfAI(response.message)
                }
            )
        })
    }, []);


    return (
        presentationOfAI ? (
            <View
                style={[{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",

                }, backgroundColor]}
            >


                <Image source={require('../../../assets/images/splash-icon.png')} style={{width: 50, height: 50}}/>

                <Title1 classes={titleColor}>Home</Title1>
                <View style={styles.linksContainer}>
                    <Link style={styles.link} href="/(tabs)/audio">Try Felix !</Link>

                </View>

                <Text style={styles.textPresentation}>{presentationOfAI}</Text>

            </View>
        ) : customError && (<Text style={styles.errorText}>{error}</Text>)


    )

}

const styles = StyleSheet.create({
    titleForLight: {
        color: "#000000",
        fontFamily: "CinzelDecorative_400Regular"
    }
    ,
    titleForDark: {
        color: "#ffffff",
    },
    backgroundForLight: {
        backgroundColor: "#ffffff",
    }, backgroundForDark: {
        backgroundColor: "#000000",
    },
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    linksContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        width: 550,
        alignItems: "center",
        justifyContent: "center"
    },
    link: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 10,
        backgroundColor: "#9bbbe6",
        padding: "10"
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    textPresentation :{
        textAlign : "center"
    }
})
