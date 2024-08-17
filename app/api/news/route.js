import { NextResponse } from "next/server";
import {JSDOM} from "jsdom"

export async function GET() {
    const res = await fetch('https://www.nytimes.com/athletic/news/', {
        cache: 'no-store', // Prevents caching
      });
  const html = await res.text();
  
  const dom = new JSDOM(html);
  const document = dom.window.document;
 // sc-1aea98ba-9 kjJKfi
 //sc-a5f374a-0 ldQEFC
 //sc-a5f374a-0 jnVyeX
  const downloads1 = document.querySelector('.kjJKfi')?.textContent
  const downloads2 = document.querySelector('.jnVyeX')?.textContent
  
  console.log("Major highlight: "+ downloads1);
  console.log("Other highlights: "+ downloads2);


  return NextResponse.json({ data1: downloads1,
    data2:downloads2
   });
}
