import {useEffect, useState} from "react";
import uri from "ajv/lib/runtime/uri";


export default function useApi(link: string, body: object | undefined | null, method: string = 'GET', formData: object | undefined | null, headers: object | null | undefined): {
    data: any;
    loading: boolean;
    error: any
} {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {

            if (link == "") {

                console.log('=======================  REQUEST PASSED ==');
                return;
            }
        if (method === 'POST' && !body  || method === 'POST' && !formData) {

                console.log('=======================  REQUEST PASSED ==');
                setLoading(false);
                return;
            }
            console.log('=======================  DONT PASS THIS REQUEST==');


            async function fetchData() {

                try {
                    console.log('======================= DEBUT DE LA Tentative de requête ==');


                    let response = await fetch(link, {
                        method: method,
                        headers: {
                            ...(headers || {"Content-type": "application/json"})
                        },
                        body: method !== "GET" ? (formData || JSON.stringify(body)) : undefined,
                    });


                    let responseJS = await response.json();

                    if (!response.ok) {

                        console.log("pas ok : ", responseJS.message);
                        setError(responseJS.message);
                    }
                    console.log('URL = ', link)
                    console.log('BODY = ', body)
                    console.log('METHOD = ', method)
                    console.log('FORMDATA = ', formData)
                    console.log('HEADER = ', headers)
                    console.log('REPONSE = ', responseJS)
                    console.log("======================= FIN DE LA Tentative de requête ==")
                    return responseJS;
                } catch (err) {
                    console.error('Erreur lors de la requête fetch:', err);
                    setError("Erreur lors de la récupération des données" + err);
                } finally {
                    setLoading(false);
                }
            }

            fetchData().then(r => setData(r));
        }, [link, body, method, formData, headers]
    )

    return {data, loading, error};

}


export async function SimpleFetch(link: string, body: object | undefined | null, method: string = 'GET', formData: object | undefined | null, headers: object|null|undefined): any {


    if (method === 'POST' && !body  || method === 'POST' && !formData) {

        console.log('=======================  REQUEST PASSED ==');
        return null;
    }

    if (link == "") {

        console.log('=======================  REQUEST PASSED ==');
        return;
    }

    console.log('=======================  DONT PASS THIS REQUEST==');

    try {
        console.log('======================= DEBUT DE LA Tentative de requête Simple fetch ==');


        let response = await fetch(link, {
            method: method,
            headers: {
                ...(headers || {"Content-type": "application/json"})
            },
            body: method !== "GET" ? (formData || JSON.stringify(body)) : undefined,
        })

        if (!response.ok) {
            console.error("Erreur lors de l'envoi :", response.status, response.statusText);
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }


        // Tentative de désérialisation du corps de la réponse
        const responseJS = await response.json();
        console.log('URL = ', link)
        console.log('BODY = ', body)
        console.log('METHOD = ', method)
        console.log('FORMDATA = ', formData)
        console.log('HEADER = ', headers)
        console.log('REPONSE = ', responseJS)
        console.log("======================= FIN DE LA Tentative de requête ==")

        return responseJS;

    } catch (err) {
        console.error('Erreur lors de la requête fetch:', err);

        throw err; // Relancer l'erreur pour la gestion en amont
    }


}
