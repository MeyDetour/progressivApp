
import {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function useSetAuth(value:string) {

    useEffect(() => {

        async function setToStorage() {
            try {

                console.log("SEND IN STORAGE")
                await AsyncStorage.setItem(
                    '@token:value',
                    value,
                );

            } catch (error) {
                console.error('Error with AsyncStorage', error);
            }
        }

        setToStorage()


    }, [])

    return


}
