import {CameraView, CameraType, useCameraPermissions} from 'expo-camera';
import {useRef, useState} from 'react';
import {Button, PixelRatio, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Link} from "expo-router";
import {captureRef} from 'react-native-view-shot';


export default function Index() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null); // Ref pour capturer la vue


    if (!permission) {
        // Camera permissions are still loading.
        return <View/>;
    }

    if (!permission.granted) {
        <Link href="/">show Home</Link>
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission"/>
            </View>
        );
    }

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    const screnshot = async () => {


    }
    const takeScreenshot = async () => {
        try {
            const targetPixelCount = 1080; // Full HD resolution
            const pixelRatio = PixelRatio.get(); // Ratio du périphérique
            const pixels = targetPixelCount / pixelRatio;

            // Capture la vue référencée
            const result = await captureRef(cameraRef, {
                result: 'tmpfile', // Sauvegarder dans un fichier temporaire
                height: pixels,
                width: pixels,
                quality: 1, // Qualité maximale
                format: 'png',
            });

            console.log('Screenshot saved at:', result);
            alert('Screenshot saved at: ' + result);
        } catch (error) {
            console.log('Error taking screenshot:' , error);
        }
    };

    return (
        <View style={styles.container} ref={cameraRef}>
            <CameraView style={styles.camera} facing={facing}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                        <Text style={styles.text}>Flip Camera</Text>
                    </TouchableOpacity>
                </View>
            </CameraView>
            <TouchableOpacity style={styles.screenshotButton} onPress={takeScreenshot}>
                <Text style={styles.text}>Take Screenshot</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    screenshotButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        margin: 20,
    },
});