import {Text, StyleSheet, SafeAreaView, TextInput, View, Button, TouchableOpacity} from "react-native"
import {Controller, useForm} from "react-hook-form";
import {SetStateAction, useEffect, useState} from "react";
import Title1 from "@/components/Title1";
import {Link, Redirect} from "expo-router";
import useApi from "@/hooks/useApi";
import env from "../../routes"
import useSetAuth from "@/hooks/useSetAuth";
import useAuth from "@/hooks/useAuth";
import {booleanLiteral} from "@babel/types";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function LoginScreen() {

    console.log("IN LOGIN FORM")

    const {control, getValues, formState: {errors}} = useForm();
    const [submittedData, setSubmittedData] = useState(undefined);
    const [token, setToken] = useState<string | null>(null);

    const {data, loading, error} = useApi(env.LOGIN_URL, submittedData, "POST", undefined, null)

    console.log("=============================")
    console.log("the current token ", token)
    const [customErrors, setCustomErrors] = useState("");

    const onSubmit = () => {

        console.log("formulaire soumis ave cle boutton")

        const formData = getValues()
        setSubmittedData(formData);
    };

    useEffect(() => {
        if (error) {
            console.log("Error:", error);
            setCustomErrors(error)
        }
        if (data) {

            console.log("Try to SEND IN STORAGE")

            AsyncStorage.setItem(
                '@token:value',
                data.token,
            ).then(
                () => {
                    console.log("successfully set")
                    setToken(data.token)
                }
            )

        }
    }, [data, error])
    if (error){
        return      <Text style={styles.errorText}>{error}</Text>
    }

    if (token) {

        return <Redirect href="/(tabs)/(home)/home"/>;
    }

    if (submittedData) {
        return <SafeAreaView style={{flex: 1}}><Text>Loading ... </Text></SafeAreaView>;
    }




    return (

        !token &&
        <SafeAreaView>

            <Title1>Login</Title1>
            <View style={styles.container}>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <Controller
                    control={control}
                    render={({field: {onChange, onBlur, value}}) => (
                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange} // Met à jour la valeur dans React Hook Form
                        />
                    )}
                    name="username"
                    rules={{
                        required: 'You must enter your Username',
                    }}
                />
                {errors.email && <Text style={styles.errorText}>{errors.username.message}</Text>}

                <Controller
                    control={control}
                    render={({field: {onChange, onBlur, value}}) => (
                        <TextInput
                            textContentType={"password"}
                            style={styles.input}
                            placeholder="Your password"
                            secureTextEntry
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange} // Met à jour la valeur dans React Hook Form
                        />
                    )}
                    name="password"
                    rules={{required: 'You must enter your password'}}
                />
                {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}


                <TouchableOpacity style={styles.button} onPress={onSubmit}>
                    <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>

                {/* Gönderilen Veriler */}
                {submittedData && (
                    <View style={styles.submittedContainer}>
                        <Text>Name: {submittedData.username}</Text>
                        <Text>Token: {data?.token}</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    )

}
const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        padding: 8,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    button: {
        backgroundColor: "#007BFF",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
    },
    buttonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },

});