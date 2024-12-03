import {useEffect, useState} from "react";
import uri from "ajv/lib/runtime/uri";


export default function useApi(link: string, body: object | undefined, method: string = 'GET'): {
    data: any;
    loading: boolean;
    error: any
} {
    console.log(link, body, method);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    console.log("after ")
    useEffect(() => {
            if (!body && method === 'POST') {

                console.log("pas de body avec une requet post: ")
                console.log(body, method)
                setLoading(false);
                return;
            }

            async function fetchData() {

                console.log('COUCOU')
                try {
                    console.log('Tentative de requête');

                    console.log("URL:", link);
                    console.log("Body:", JSON.stringify(body));


                    let response = await fetch(link, {
                        method: method,
                        headers: {
                            "Content-type": "application/json",

                        },
                        body: method !== "GET" ? JSON.stringify(body) : undefined,
                    });
                    console.log('COUCOU')

                    console.log('Requête envoyée, status:', response.status);

                    console.log('COUCOU 2')

                    let responseJS = await response.json();
                    console.log('COUCOU AVANT 3')

                    if (!response.ok) {

                        console.log('COUCOU 3')

                        console.log("pas ok : ", responseJS.message);
                        setError(responseJS.message);
                    }
                    console.log("les donnée envoyésé", body)
                    return responseJS;
                } catch (err) {
                    console.error('Erreur lors de la requête fetch:', err);
                    setError("Erreur lors de la récupération des données" + err);
                } finally {
                    setLoading(false);
                }
            }

            fetchData().then(r => setData(r));
        }, [link, body, method]
    )

    return {data, loading, error};

}