import {Text, StyleSheet, SafeAreaView, TextInput, View, Button} from "react-native"
import {Controller, useForm} from "react-hook-form";
import {SetStateAction, useEffect, useState} from "react";
import Title1 from "@/components/Title1";
import useApi from "@/hooks/useApi";
import {Link} from "expo-router";

import env from "../../routes"


export default function LoginScreen() {
    const {control, getValues, formState: {errors}} = useForm();
    const [submittedData, setSubmittedData] = useState(undefined);
    const {data, loading, error} = useApi(env.REGISTER_URL, submittedData, "POST" ,null,null)
    const [customErrors, setCustomErrors] = useState("");

    console.log("sur le form register")
    const onSubmit = ( ) =>{

        console.log("formulaire soumis ave cle boutton")

        const formData= getValues()
        console.log("Form Data:", formData);
        setSubmittedData(formData);
    };

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
            <Title1>Register</Title1>
            <View style={styles.container}>
                {error && <Text style={styles.errorText}>{error}</Text>}


                {/* Form Girdileri */}
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



                <Button title="Submit" onPress={onSubmit}/>


            </View>

            <Link href="/(tabs)/(user)/login">Go To login</Link>
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
});