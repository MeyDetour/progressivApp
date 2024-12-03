import {Text, StyleSheet, SafeAreaView, TextInput, View, Button, TouchableOpacity} from "react-native"
import {Controller, useForm} from "react-hook-form";
import {SetStateAction, useEffect, useState} from "react";
import Title1 from "@/components/Title1";
import {Link} from "expo-router";
import useApi from "@/hooks/useApi";

export default function LoginScreen() {
const {control, getValues, formState: {errors}} = useForm();
    const [submittedData, setSubmittedData] = useState(null);
    const {data,loading,error}= useApi("http://192.168.8.221:3000/login",submittedData, "POST")
    const [customErrors, setCustomErrors] = useState("");
    console.log("sur le form login")
    const onSubmit = ( ) =>{

        console.log("formulaire soumis ave cle boutton")

        const formData= getValues()
        console.log("Form Data:", formData);
        setSubmittedData(formData); // Met à jour les données soumises
    };
    console.log(submittedData);
    console.log(data)
    useEffect(() => {
        if (error){
            console.log("Error:", error);
        }
        if (data){
            console.log("token:", data.token);
        }
    },[data,error])
    return (
        <SafeAreaView>

            <Title1>Login</Title1>
            <View style={styles.container}>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange} // Met à jour la valeur dans React Hook Form
                        />
                    )}
                    name="email"
                    rules={{
                        required: 'You must enter your email',
                        pattern: {value: /^\S+@\S+$/i, message: 'Enter a valid email address'}
                    }}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

                <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
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
                        <Text style={styles.submittedTitle}>Submitted Data:</Text>
                        <Text>Name: {submittedData.name}</Text>
                        <Text>Email: {submittedData.email}</Text>
                    </View>
                )}
            </View>

            <Link href="/(tabs)/(user)/register">Go To register</Link>
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