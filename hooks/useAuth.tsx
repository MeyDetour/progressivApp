
import {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function useAuth() {
const [data,setData] = useState(null);
    useEffect(() => {

        async function setToStorage() {
            try {

                console.log("SEND IN STORAGE")
                await AsyncStorage.setItem(
                    '@token:value',
                    'aaabbbbbbccccccddd',
                );

                const sotredData = await AsyncStorage.getItem('@token:value');
                console.log(sotredData);

                if(sotredData !== null){
                    setData(sotredData);
                    console.log("Data from AsyncStorage:", sotredData);  // Log the data to console
                } else {
                    console.log('No data found');
                }
            } catch (error) {
                console.error('Error with AsyncStorage', error);
            }
        }

        setToStorage()


    }, [])

    return {data}


}
