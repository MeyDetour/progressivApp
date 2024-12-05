import {TouchableOpacity, View, Text, Animated, Dimensions, SafeAreaView} from "react-native";
import {StyleSheet} from 'react-native';
import {SetStateAction, useEffect, useState} from "react";
import {Audio} from 'expo-av';
import * as FileSystem from "expo-file-system"
import {FontAwesome} from "@expo/vector-icons";
import {Link} from "expo-router";
import useApi, {SimpleFetch} from "@/hooks/useApi";
import env from '../../routes'
import ScrollView = Animated.ScrollView;
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;


const screenHeight = Dimensions.get('window').height;

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

    const [apiError, setApiError] = useState(null);

    const [bodyWithTextToGetResponse, setBodyWithTextToGetResponse] = useState(undefined);
    const [lastResponse, setLastResponse] = useState(null)
    const [responseToTextInUseState, setResponseToTextInUseState] = useState(null)

    useEffect(() => {

        try {
            SimpleFetch(env.WAV_TO_TEXT, null, bodyWithTextToGetResponse, undefined, null)
                .then(
                    (response: SetStateAction<null>) =>{
                    setResponseToTextInUseState(response);
                }
            )

        } catch (error) {
            console.log(error);
            setApiError(error)

        }
    }, [bodyWithTextToGetResponse]);



    const [urlToGetAudioFromText, setUrlToGetAudioFromText] = useState("");

    console.log("================================START===================================")

    console.log("AUDIO.TSX body :", bodyWithTextToGetResponse)
    console.log("AUDIO.TSX response to texte use state :", responseToTextInUseState)
    console.log("AUDIO.TSX last question to texte :", lastResponse)
    console.log("AUDIO.TSX url ", urlToGetAudioFromText)
    console.log("================================CHANGEMENTs===================================")




    useEffect(() => {
        if (responseToTextInUseState && bodyWithTextToGetResponse) {
                 setLastResponse(responseToTextInUseState);
                setResponseToTextInUseState(null)
                setBodyWithTextToGetResponse(undefined);

        }

    }, [responseToTextInUseState, bodyWithTextToGetResponse]);


    if (lastResponse && !responseToTextInUseState && !bodyWithTextToGetResponse) {
        console.log("bloc1")

        let responseToTextWithoutSpace = lastResponse.replaceAll(" ", "%20")

        setUrlToGetAudioFromText(env.RESPONSE_TO_WAV + responseToTextWithoutSpace)


        console.log("ON A LE FICHIER AUDIO :")

        setConversation([...conversation, {
            content: lastResponse,
            vocalName: null,
            vocalLink: env.RESPONSE_TO_WAV + responseToTextWithoutSpace,
        }])
        setLastResponse(null)
        setResponseToTextInUseState(lastResponse)
        setUrlToGetAudioFromText(null)
    }
    console.log("AUDIO.TSX body :", bodyWithTextToGetResponse)
    console.log("AUDIO.TSX response to texte use state :", responseToTextInUseState)
    console.log("AUDIO.TSX last question to texte :", lastResponse)
    console.log("AUDIO.TSX url ", urlToGetAudioFromText)

    console.log("==================================END=================================")

    useEffect(() => {
        async function getPermission() {
            await Audio.requestPermissionsAsync()
                .then((permission) => {
                    console.log("permission granted :" + permission.granted)
                    setAudioPermission(permission.granted)
                })
                .catch((err) => {
                    console.log("permission granted  error :" + err)
                    setApiError("Une erreur s'est produite.",err);

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
            setApiError("Une erreur s'est produite.",err);
        }
    }

    async function stopRecording() {
        try {
            if (recordingStatus === "recording") {

                console.log("stop recording")
                await recording.stopAndUnloadAsync()

                /*============ SAVE FILE==========*/
                const recordingUri = recording.getURI()
                const fileName = `recording-${Date.now()}.wav`
                await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'recordings/', {intermediates: true})
                await FileSystem.moveAsync({
                    from: recordingUri,
                    to: FileSystem.documentDirectory + 'recordings/' + fileName,
                })

                /*============  GET SAVED FILE ==========*/
                const fileInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'recordings/' + fileName);
                if (!fileInfo.exists) {
                    console.log("Le fichier n'existe pas");
                    return;
                }

                /*      const fileInFileType = await fetch(FileSystem.documentDirectory + 'recordings/' + fileName)
                          .then(async response => {
                              if (!response.ok) {
                                  throw new Error(`Failed to fetch file: ${response.statusText}`);
                              }
                              /!*return await response.blob();*!/
                              const blob = await response.blob();
                              return new File([blob], fileName, {type: "audio/wav"});
                          });
                      console.log("type du ficheri:", typeof fileInFileType)
                      console.log("File Details:", fileInFileType.name, fileInFileType.size, fileInFileType.type);

                      console.log("le file avec ['_data']", fileInFileType)
                      console.log("le file sans ['_data'] :", fileInFileType['_data'])
                      console.log("nom du fichier :", fileInFileType.name)
      */

                setRecording(null)
                setRecordingStatus('stopped')


                /*============ REQUEST TO GET TEXT FROM VOICE ==========*/
                const formData = new FormData()
                formData.append("model", "base")
                formData.append("language", "fr")
                formData.append("inital_prompt", "string")
                formData.append("vad_filter", false)
                formData.append("min_silence_duration_ms", 1000)
                formData.append("response_format", "text")


                /* formData.append("file", fileInFileType);*/
                formData.append("file", {
                    uri: FileSystem.documentDirectory + 'recordings/' + fileName, // Assurez-vous d'utiliser 'uri' pour React Native
                    type: "audio/wav",  // Le type MIME
                    name: fileName, // Nom du fichier
                });


                let textFromVoice: string = ""

                try {
                    let headers = {
                        "Authorization": "Bearer dummy_api_key",
                        "Content-Type": "multipart/form-data"
                    }
                    const responseJson = await SimpleFetch(env.WAV_TO_TEXT, null, 'POST', formData, headers);
                    textFromVoice = responseJson.text

                    if (textFromVoice != "") {


                        /*============ REQUEST TO GET TEXT RESPONSE TO TEXT SEND ==========*/
                        setBodyWithTextToGetResponse({
                            "model": "mistral",
                            "prompt": `${textFromVoice} +(français)`,
                            "stream": false
                        })
                        setConversation([...conversation, {
                            content: textFromVoice,
                            vocalName: fileName,
                            vocalLink: null,
                        }]);


                    }else{
                        setApiError("audio vide")
                    }

                } catch (error) {
                    console.error("Erreur lors de l'appel à l'API :", error);

                    setApiError("Une erreur s'est produite.",error);
                }


            }
        } catch (err) {
            console.log("faile to stop recordging : ", err)

            setApiError("Une erreur s'est produite.",err);
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


        console.log("play message :", message)

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

        if (!message.vocalName) {
            await newPlaybackObject.loadAsync({uri: message.vocalLink});

        } else {
            await newPlaybackObject.loadAsync({uri: FileSystem.documentDirectory + 'recordings/' + message.vocalName});

        }

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
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Link href={"/"}> <FontAwesome name={"backward"} size={32} color={"black"}></FontAwesome>
                </Link>
                <Text style={styles.titleConversation}>Chat with AI</Text>
                <FontAwesome name={"user"} size={32} color={"black"}></FontAwesome>

            </View>
            <ScrollView contentContainerStyle={styles.audioContainer}>
                {Array.isArray(conversation) && conversation.map((message, index) => (
                    <View key={index} style={[styles.message, index % 2 == 0 ? styles.message1 : styles.message2]}>
                        <Text> {message.content}</Text>
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


            </ScrollView>

            {/* Render microphone only if we dont listen something or if there are not request (en cour)*/}
            {
                !listenRecording && !bodyWithTextToGetResponse && !urlToGetAudioFromText &&
                <TouchableOpacity style={styles.microphone} onPress={handleRecordButtonPress}>

                    {apiError && <Text style={{ color: 'red' }}>{apiError}</Text>}
                    <FontAwesome name={recording ? "square" : "microphone"} size={32} color={"black"}></FontAwesome>
                </TouchableOpacity>
            }


        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        height: "100%",
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
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        gap: 10,
        paddingBottom: 20,
        height: screenHeight * 0.8,
        height: "80%",
    },

    message: {
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 0.5,
        borderStyle: "solid",
        maxWidth: "80%",
        width: "auto"
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