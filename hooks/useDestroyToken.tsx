import {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function useDestroyToken(authorization: boolean): boolean {
    const [isTokenDestroyed, setIsDestroyedToken] = useState<boolean>(false);
    console.log("DESTROY TOKEN IN COOCKEIS :" ,authorization);
    useEffect(() => {
        if (!authorization) {
            setIsDestroyedToken(true);
            return;
        }

        async function destroyToken() {
            try {

                console.log("SEND IN STORAGE")
                await AsyncStorage.setItem(
                    '@token:value',
                    "",
                );

                setIsDestroyedToken(true);
            } catch (error) {
                console.error('Error with AsyncStorage', error);
            }
        }

        destroyToken()

    }, [])

    return isTokenDestroyed


}
