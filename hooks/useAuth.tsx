import {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function useAuth(loadToken:boolean) {
    const [data, setData] = useState(null);
    useEffect(() => {
        if (!loadToken){
            return;
        }
        console.log("GET DATA IN COOCKIES")
        async function getSotrage() {
            try {


                const sotredData = await AsyncStorage.getItem('@token:value');
                console.log("this is stored data :",sotredData);
                if (sotredData !== null) {
                    console.log("Data from AsyncStorage:", sotredData);  // Log the data to console
                    setData(sotredData);

                } else {
                    console.log('No data found');
                }
            } catch (error) {
                console.error('Error with AsyncStorage', error);
            }
        }

        getSotrage()


    }, [])

    return data


}
