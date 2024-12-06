import {TouchableOpacity, View, Text, Animated, Dimensions, SafeAreaView} from "react-native";
import {StyleSheet} from 'react-native';
import {SetStateAction, useEffect, useState} from "react";
import {Audio} from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from "expo-file-system"
import {FontAwesome} from "@expo/vector-icons";
import {Link} from "expo-router";
import useApi, {SimpleFetch} from "@/hooks/useApi";
import env from '../../routes'
import ScrollView = Animated.ScrollView;
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;
import AsyncStorage from "@react-native-async-storage/async-storage";


const screenHeight = Dimensions.get('window').height;

export default function AudioScreen() {
    const [token, setToken] = useState(null);

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
    const [responseToText, setResponseToTextInUseState] = useState(null)


    const [formDataToGetTextFromVoice, setFormDataToGetTextFromVoice] = useState(undefined);
    const [headersToGetTextFromVoice, setHeadersToGetTextFromVoice] = useState(undefined);
    const [lastMessageWithTextFromVoice, setLastMessageWithTextFromVoice] = useState(null)
    const [lastFileNameOfTextFromVoice, setLastFileNameOfTextFromVoice] = useState(null)

    useEffect(() => {
        AsyncStorage.getItem('@token:value').then((token) => {
            setToken(token)
        })
    }, []);


    useEffect(() => {

        try {
            SimpleFetch(env.TEXT_TO_RESPONSE, bodyWithTextToGetResponse, 'POST', undefined, {"Authorization": "Bearer " + token})
                .then(
                    (response: SetStateAction<null>) => {
                        setResponseToTextInUseState(response.message)
                        setBodyWithTextToGetResponse(undefined);

                    }
                )

        } catch (error) {
            setApiError(error)

        }
    }, [bodyWithTextToGetResponse]);

    useEffect(() => {
        if (headersToGetTextFromVoice && formDataToGetTextFromVoice) {
            try {
                SimpleFetch(env.WAV_TO_TEXT, null, 'POST', formDataToGetTextFromVoice, headersToGetTextFromVoice)
                    .then(
                        (response: SetStateAction<null>) => {

                            setLastMessageWithTextFromVoice(response.text)
                            setLastFileNameOfTextFromVoice(formDataToGetTextFromVoice.get('file').name)
                            setFormDataToGetTextFromVoice(undefined);
                            setHeadersToGetTextFromVoice(undefined);
                            if (response.text == "") {
                                setApiError("audio vide")
                            }


                        }
                    )

            } catch (error) {
                console.error("Erreur lors de l'appel à la transformation Voice to Text :", error);

                setApiError("Une erreur s'est produite.", error);

            }
        }

    }, [formDataToGetTextFromVoice, headersToGetTextFromVoice]);


    const [urlToGetAudioFromText, setUrlToGetAudioFromText] = useState("");

    console.log("================================START===================================")

    console.log("AUDIO.TSX body :", lastMessageWithTextFromVoice)
    console.log("AUDIO.TSX response to texte use state :", responseToText)
    console.log("AUDIO.TSX url ", urlToGetAudioFromText)
    console.log("================================CHANGEMENTs===================================")

    if (lastMessageWithTextFromVoice) {
        if (lastMessageWithTextFromVoice != "") {
            setBodyWithTextToGetResponse({
                "prompt": `${lastMessageWithTextFromVoice} (français)`,
            })
            setConversation([...conversation, {
                content: lastMessageWithTextFromVoice,
                vocalName: lastFileNameOfTextFromVoice,
                vocalLink: null,
            }]);
            setLastMessageWithTextFromVoice(null);


        }
    }
    if (responseToText) {
        setApiError(null)
        console.log("bloc1")

        let responseToTextWithoutSpace = responseToText.replaceAll(" ", "%20")

        setUrlToGetAudioFromText(env.RESPONSE_TO_WAV + responseToTextWithoutSpace)


        console.log("ON A LE FICHIER AUDIO :")

        setConversation([...conversation, {
            content: responseToText,
            vocalName: null,
            vocalLink: env.RESPONSE_TO_WAV + responseToTextWithoutSpace,
        }])
        setResponseToTextInUseState(null)
        setUrlToGetAudioFromText(null)
    }
    console.log("AUDIO.TSX body :", bodyWithTextToGetResponse)
    console.log("AUDIO.TSX response to texte use state :", responseToText)
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
                    setApiError("Une erreur s'est produite.", err);

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

            setApiError(null)
            const newRecording = new Audio.Recording()
            console.log("start recording")
            await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY)
            await newRecording.startAsync()
            setRecording(newRecording)
            setRecordingStatus('recording')
        } catch (err) {
            console.log("faile to start recordging : ", err)
            setApiError("Une erreur s'est produite.", err);
        }
    }

    async function stopRecording() {
        try {

            setApiError(null)
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

                let headers = {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "multipart/form-data"
                }
                setHeadersToGetTextFromVoice(headers)
                setFormDataToGetTextFromVoice(formData)


                console.log(formData)

            }
        } catch (err) {
            console.log("faile to stop recordging : ", err)

            setApiError("Une erreur s'est produite.", err);
        }
    }

    async function handleRecordButtonPress() {
        if (recording) {

            setApiError(null)
            const audioUri = await stopRecording(recording)
            if (audioUri) {
                console.log("saved audio file to ", savedUri)
            }
        } else {
            await startRecording()
        }
    }

    async function playAudio(message: object) {

        setApiError(null)

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

        if (!message.vocalName) {
            console.log("ready to fetch")
            fetch(message.vocalLink, {
                method: 'POST',
                headers: {
                    "Authorization": "Bearer " + token,

                }
            }).then(async response => {
                console.log(response)

                const blob = await response.blob();
                const blobEdited = new Blob([blob], { type: "audio/wav" });

                const reader = new FileReader();

                reader.onloadend = function() {
                    // Stocker l'URL dans une variable
                    const audioUrl = reader.result;
                    console.log("Audio URL:", audioUrl);

                    // Charger et jouer l'audio
                    newPlaybackObject.loadAsync({uri: audioUrl})
                        .then(() => {
                            return newPlaybackObject.playAsync();
                        })
                        .catch(error => {
                            console.error("Error playing audio:", error);
                        });
                };

// Lire le blob en tant que Data URL
                reader.readAsDataURL(blobEdited);

            })

                .catch((error) => console.error("Erreur :", error));


        } else {
            await newPlaybackObject.loadAsync({uri: FileSystem.documentDirectory + 'recordings/' + message.vocalName});

            await newPlaybackObject.playAsync();
        }


        setPlaybackObject(newPlaybackObject);
        setRecordingListened(message.vocalName);
        setListenRecording(true)
        setIsAudioFinished(false)
    }

    async function pauseAudio() {

        setApiError(null)
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
                      <Text style={ index % 2 == 0 ? styles.title1 : styles.title2}> { index % 2 == 0  ? "You" : "Felix" }</Text>
                        <Text style={ index % 2 == 0 ? styles.messageContent1 : styles.messageContent2} > {message.content}</Text>
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
                                style={ index % 2 == 0 ? styles.iconeMessage1 : styles.iconeMessage2}
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

                    {apiError && <Text style={{color: 'red'}}>{apiError}</Text>}
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
        paddingBottom: 10,
        paddingHorizontal: 20,
        overflowY: "scroll",
    },

    message: {
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 0.5,
        borderStyle: "solid",
        width: "auto",
        paddingVertical: 30,
        display: "flex",
        flexDirection: "column",


    }, message1: {
        backgroundColor: "#faebeb",
        borderColor: "#eabbbb",
        alignSelf: "flex-start",

    }, message2: {
        backgroundColor: "#ebeffa",
        borderColor: "#bbc1ea",
        alignSelf: "flex-end",
        textAlign: "right",

    }
    ,
    messageContent2:{
        textAlign: "right",
    }

    , iconeMessage1: {
        position: "absolute",
        bottom: -28,
        left: -10,
    }, iconeMessage2: {
        position: "absolute",
        bottom: -28,
        right: -10,
    },
    microphone: {
        height: "10%",
    },
    title1 : {
      fontSize: 20,
      fontWeight: "bold",
        alignSelf: "flex-start",
        textAlign: "left",
    }, title2 : {
      fontSize: 20,
      fontWeight: "bold",
        alignSelf: "flex-end",
        textAlign: "right",
    }
})