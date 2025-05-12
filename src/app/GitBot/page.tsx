'use client'
import { useEffect, useState } from 'react';
import { Suspense } from 'react';
export default function GitBot() {
    const [data, setData] = useState();
    const fetchData = async () => {
        
       const response = await fetch('/api/gitbot',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            prompt:'You have access to a database called gitfund which contains a table named projects. Each record in projects includes a description of the project. I am a complete beginner looking to start contributing to open-source. Based on the project descriptions, suggest projects'
        })
       }).then((res) => console.log(res));
        console.log(data);
        return response;
    }
    return (
        <>
        <Suspense>
            <div>
                <button onClick={fetchData}>Fetch Data</button>
            </div>
            </Suspense>
        </>
    )
}