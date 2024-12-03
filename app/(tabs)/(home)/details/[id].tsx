import {useLocalSearchParams} from "expo-router";
import {View,Text} from "react-native";

export default function DetailScreen(){
    const {id} = useLocalSearchParams()

    return (
        <View>
            <Text>Detail Screen {id}</Text>
        </View>
    )
}