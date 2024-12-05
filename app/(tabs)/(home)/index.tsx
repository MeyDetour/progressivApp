import {Link} from "expo-router";
import {Text, TouchableOpacity, View, Image, useColorScheme, StyleSheet, Button} from "react-native";
import Title1 from "@/components/Title1";
import useApi from "@/hooks/useApi";
import {useState} from "react";
import useAuth from "@/hooks/useAuth";


export default function Index() {
    const {} = useAuth();

    //CHUCK NORRIS JOKE
    const [url, setUrl] = useState("https://api.chucknorris.io/jokes/random"); // URL dynamique
    const {data, loading, error} = useApi(url, undefined, "GET",undefined,undefined); // Appel API basé sur l'URL
    const reloadJoke = () => {
        setUrl("https://api.chucknorris.io/jokes/random?" + new Date().getTime());
    };



    if (error) {
        return <Text>{error}</Text>;
    }


    //color
    const colorScheme = useColorScheme();
    console.log(colorScheme)
    const titleColor = colorScheme === "dark" ? styles.titleForDark : styles.titleForLight
    const backgroundColor = colorScheme === "dark" ? styles.backgroundForDark : styles.backgroundForLight


    return (
        data ? (
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
                    <Link style={styles.link} href="/(tabs)/(home)/details">show detail</Link>
                    <Link style={styles.link} href="/(tabs)/settings">show settings</Link>
                    <Link style={styles.link} href="/(tabs)/(user)/login">show Login</Link>
                    <Link style={styles.link} href="/(tabs)/camera">show Camera</Link>
                    <Link style={styles.link} href="/(tabs)/audio">show audio</Link>
                    <Link style={styles.link} href="/(tabs)/(user)/register">Register</Link>

                </View>
                <TouchableOpacity
                    onPress={reloadJoke}
                >
                    <Text style={{color: "red"}}>
                        {loading ? "Chargement..." : "Changer la blague"}
                    </Text>
                </TouchableOpacity>
                <Text>{data.value}</Text>

            </View>
        ) : null


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
        gap : 10,
        width: 550,
        alignItems : "center",
        justifyContent:"center"
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
