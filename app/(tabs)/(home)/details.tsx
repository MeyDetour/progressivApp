import {View,Text} from "react-native";
import {Link} from "expo-router";
import Title1 from "@/components/Title1";


export default function DetailScreen(){
    return (
        <View  >


            <Title1>Details</Title1>
            <Link href="/details/1">show detail1</Link>
            <Link href={{pathname :"/details/[id]",params : {id:'2'}}}>show detail2</Link>
            <Link href="/(tabs)/settings">show settings</Link>
            <Link href="/">show Home</Link>
        </View>
    )
}