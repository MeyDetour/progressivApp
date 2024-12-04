import {TouchableOpacity, View, Text} from "react-native";
import {StyleSheet} from 'react-native';
import {useEffect, useState} from "react";
import {Audio} from 'expo-av';
import * as FileSystem from "expo-file-system"
import {FontAwesome} from "@expo/vector-icons";
import {Link} from "expo-router";
import useApi, {SimpleFetch} from "@/hooks/useApi";
import env from '../../routes'

export default function AudioScreen() {

    const [recording, setRecording] = useState(null)
    const [recordingStatus, setRecordingStatus] = useState('idle')
    const [audioPermission, setAudioPermission] = useState(null)
    const [conversation, setConversation] = useState([])

    const [listenRecording, setListenRecording] = useState(false)
    const [recordingListened, setRecordingListened] = useState(null)
    const [playbackObject, setPlaybackObject] = useState(null);
    const [position, setPosition] = useState(0);
    const [isAudioFinished, setIsAudioFinished] = useState(false);

    useEffect(() => {
        async function getPermission() {
            await Audio.requestPermissionsAsync()
                .then((permission) => {
                    console.log("permission granted :" + permission.granted)
                    setAudioPermission(permission.granted)
                })
                .catch((err) => {
                    console.log("permission granted  error :" + err)
                })
        }

        getPermission()

        return () => {
            if (recording) {
                stopRecording()
            }
        }

    }, [])


    async function startRecording() {
        try {
            const newRecording = new Audio.Recording()
            console.log("start recording")
            await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY)
            await newRecording.startAsync()
            setRecording(newRecording)
            setRecordingStatus('recording')
        } catch (err) {
            console.log("faile to start recordging : ", err)
        }
    }

    async function stopRecording() {
        try {
            if (recordingStatus === "recording") {

                console.log("stop recording")
                await recording.stopAndUnloadAsync()


                const recordingUri = recording.getURI()
                const fileName = `recording-${Date.now()}.wav`
                await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'recordings/', {intermediates: true})
                await FileSystem.moveAsync(
                    {
                        from: recordingUri,
                        to: FileSystem.documentDirectory + 'recordings/' + fileName,
                    }
                )

                console.log("save in : ", FileSystem.documentDirectory + 'recordings/' + fileName)

                setRecording(null)
                setRecordingStatus('stopped')
                setConversation([...conversation, {
                    content: "message " + (conversation.length + 1),
                    vocalName: fileName,
                }]);
                console.log("nouvelle conv : ", conversation)
                console.log("recording -stoped :", recordingStatus)

                const fileInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'recordings/' + fileName);
                if (!fileInfo.exists) {
                    console.log("Le fichier n'existe pas");
                    return;
                }
                console.log(FileSystem.documentDirectory + 'recordings/')
                const fileBlob = await fetch(FileSystem.documentDirectory + 'recordings/')
                    .then(response => response.blob()) // Convertir le fichier en Blob
                    .catch(error => {
                        console.error("Erreur lors de la conversion en Blob :", error);
                        throw error;
                    });


                const formData = new FormData()
                formData.append("file", fileBlob,fileName)
                formData.append("model", "base")
                formData.append("language", "fr")
                formData.append("inital_prompt", "string")
                formData.append("vad_filter", "false")
                formData.append("min_silence_duration_ms", "1000")
                formData.append("response_format", "text")

                let headers = {
                   "Authorization": "Bearer Token dummy_api_key",

                }
                const response = SimpleFetch(env.WAV_TO_TEXT, undefined, 'POST', fileToSend,headers)

                console.log("Réponse API :", response);

            }
        } catch (err) {
            console.log("faile to stop recordging : ", err)
        }
    }

    async function handleRecordButtonPress() {
        if (recording) {
            const audioUri = await stopRecording(recording)
            if (audioUri) {
                console.log("saved audio file to ", savedUri)
            }
        } else {
            await startRecording()
        }
    }

    async function playAudio(message: object) {


        console.log("play message :", message.content)
        //si on reprend le meme audio
        if (playbackObject && (recordingListened == message.vocalName)) {
            await playbackObject.playAsync()
            setIsAudioFinished(false)
            setListenRecording(true)
            return
        }

        //si on play un autre audio on veut couper l'autre et commencer un nouveau
        if (playbackObject && (recordingListened != message.vocalName)) {
            await playbackObject.stopAsync()
            await playbackObject.unloadAsync()
        }

        //Commencer le nouvel audi
        const newPlaybackObject = new Audio.Sound();

        newPlaybackObject.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
                setListenRecording(false);
                setRecordingListened(null);
                setIsAudioFinished(true);
                setPlaybackObject(null);
                setPosition(0);
            } else if (status.isPlaying) {
                setPosition(status.positionMillis);
            }
        });
        await newPlaybackObject.loadAsync({uri: FileSystem.documentDirectory + 'recordings/' + message.vocalName});
        await newPlaybackObject.playAsync();


        setPlaybackObject(newPlaybackObject);
        setRecordingListened(message.vocalName);
        setListenRecording(true)
        setIsAudioFinished(false)
    }

    async function pauseAudio() {
        if (playbackObject) {
            await playbackObject.pauseAsync()
            const status = await playbackObject.getStatusAsync();
            setPosition(status.positionMillis); // Update current position
            setListenRecording(false)

            console.log("stoppé à la position :", position)
        }
    }


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Link href={"/"}> <FontAwesome name={"backward"} size={32} color={"black"}></FontAwesome>
                </Link>
                <Text style={styles.titleConversation}>Chat with AI</Text>
                <FontAwesome name={"user"} size={32} color={"black"}></FontAwesome>

            </View>
            <View style={styles.audioContainer}>
                {Array.isArray(conversation) && conversation.map((message, index) => (
                    <View key={index} style={[styles.message, index % 2 == 0 ? styles.message1 : styles.message2]}>
                        <Text>vocal {message.vocalName}</Text>
                        <Text>vocal {message.content}</Text>
                        <TouchableOpacity
                            onPress={() => {
                                if (listenRecording && recordingListened === message.vocalName) {
                                    pauseAudio();
                                } else {
                                    // Otherwise, play the audio
                                    playAudio(message);
                                }
                            }}
                        >
                            <FontAwesome
                                name={listenRecording && recordingListened == message.vocalName ? "pause" : "play"}
                                size={20}
                                color={"black"}></FontAwesome>
                        </TouchableOpacity>
                    </View>
                ))}


            </View>

            <TouchableOpacity style={styles.microphone} onPress={handleRecordButtonPress}>
                <FontAwesome name={recording ? "square" : "microphone"} size={32} color={"black"}></FontAwesome>
            </TouchableOpacity>

        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: "90%",
        padding: 20
    },
    header: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        height: "10%"
    },
    titleConversation: {
        fontSize: 20,
        fontWeight: "bold",
        color: "black",
    },
    audioContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        gap: 10,
        height: "80%",
        overflowY: "scroll",
    },

    message: {
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 0.5,
        borderStyle: "solid",
    }, message1: {
        backgroundColor: "#faebeb",
        borderColor: "#eabbbb",
        alignSelf: "flex-start",
    }, message2: {
        backgroundColor: "#ebeffa",
        borderColor: "#bbc1ea",
        alignSelf: "flex-end",
    },
    microphone: {
        height: "10%",
    }
})