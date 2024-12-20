import {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function useSetAuth(value: string | null): boolean {
    const [isTokenSet, setIsTokenSet] = useState<boolean>(false);
    console.log("SET TOKEN IN COOCKEIS :" ,value);
    useEffect(() => {
        if (!value) {
            setIsTokenSet(false);
            return;
        }

        console.log("Try to SEND IN STORAGE")
        async function setToStorage() {
            try {

                console.log("SEND IN STORAGE")
                await AsyncStorage.setItem(
                    '@token:value',
                    value,
                );
                setIsTokenSet(true);
                return ;

            } catch (error) {
                console.error('Error with AsyncStorage', error);
            }
        }

        setToStorage()

    }, [])

    return isTokenSet


}
