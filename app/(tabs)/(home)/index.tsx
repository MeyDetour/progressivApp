import {Link, Redirect} from "expo-router";
import {Text, TouchableOpacity, View, Image, useColorScheme, StyleSheet, Button} from "react-native";
import Title1 from "@/components/Title1";
import useApi, {SimpleFetch} from "@/hooks/useApi";
import {SetStateAction, useEffect, useState} from "react";
import useAuth from "@/hooks/useAuth";
import env from "@/app/routes";
import useDestroyToken from "@/hooks/useDestroyToken";


export default function Index() {

    const isTokenDestroyed = useDestroyToken(true);
    console.log("IN UN AUTHENTICATED")
    //color
    const colorScheme = useColorScheme();
    console.log(colorScheme)
    const titleColor = colorScheme === "dark" ? styles.titleForDark : styles.titleForLight
    const backgroundColor = colorScheme === "dark" ? styles.backgroundForDark : styles.backgroundForLight


    return (
        isTokenDestroyed &&
            <View
                style={[{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",

                }, backgroundColor]}
            >


                <Image source={require('../../../assets/images/splash-icon.png')} style={{width: 50, height: 50}}/>

                <Title1 classes={titleColor}>Hello !</Title1>
                <View style={styles.linksContainer}>
                    <Link style={styles.link} href="/(tabs)/(user)/login">Login</Link>
                </View>


            </View>



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
    }
})
