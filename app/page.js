'use client'
import React from "react"
import Image from "next/image";
import styles from "./page.module.css";
import { useEffect,useState } from "react";

export default function Home() {
  const [news,setnews] = useState({});
  const getDocuments = async () =>{
    const response = await fetch("http://localhost:3000/api/");
    const data = await response.json();
    /*const dataString = JSON.stringify({ 
      data1: data.data1 || 'No data', 
      data2: data.data2 || 'No data' 
    }, null, 2);*/
    setnews(data);
  }
  useEffect(()=>{
    getDocuments();
  },[])
 
  return (
    <div>
      <button onClick={getDocuments}>Click me</button>
      
      <p>{news.data1 ? news.data1 : 'No data'}</p>
      <p>{news.data2 ? news.data2 : 'No data'}</p>
    </div>
  );
}
