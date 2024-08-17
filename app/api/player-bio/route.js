// import { NextResponse } from "next/server";
// import { JSDOM } from "jsdom";

// export async function GET(request) {
//   const url = new URL(request.url).searchParams.get("url");

//   if (!url) {
//     return NextResponse.json({ error: "URL parameter is required" });
//   }

//   try {
//     // Fetch the stats page using the found link
//     const bioRes = await fetch(url);
//     if (!bioRes.ok) {
//       return NextResponse.json({ error: "Failed to fetch the stats page" });
//     }
//     const bioHtml = await bioRes.text();

//     // Parse the stats page using JSDOM
//     const bioDom = new JSDOM(bioHtml);
//     const bioDocument = bioDom.window.document;

//     const pageLayouts = bioDocument.querySelectorAll(".PageLayout");

//     let targetPageLayout = null;

//     pageLayouts.forEach((pageLayout) => {
//       const cardBioSection = pageLayout.querySelector(
//         ".PageLayout__Main .CardBio"
//       );
//       if (cardBioSection) {
//         targetPageLayout = pageLayout; // Found the correct PageLayout
//       }
//     });

//     if (!targetPageLayout) {
//       return NextResponse.json({
//         error: "PageLayout with Card Bio section not found",
//       });
//     }

//     // const mainDiv = bioDocument.querySelector(".PageLayout__Main");
//     // console.log(mainDiv);
//     // if (!mainDiv) {
//     //   return NextResponse.json({ error: "Main container not found" });
//     // }

//     // const cardBio = mainDiv.querySelector(".Card Bio");
//     // if (!cardBio) {
//     //   return NextResponse.json({ error: "Card bio not found" });
//     // }

//     const cardContent = cardBio.querySelector(".Wrapper Card__Content");
//     if (!cardContent) {
//       return NextResponse.json({ error: "Card content not found" });
//     }

//     let team = "Team not found";
//     let position = "Position not found";

//     const bioItems = cardContent.querySelectorAll(".Bio__Item");

//     bioItems.forEach((item) => {
//       // Get the title and value spans
//       const spans = item.querySelectorAll("div > span");
//       if (spans.length === 2) {
//         const title = spans[0].textContent.trim();
//         const valueSpan = spans[1];

//         let value = "";
//         if (title === "Team") {
//           const anchor = valueSpan.querySelector("a");
//           value = anchor
//             ? anchor.textContent.trim()
//             : valueSpan.textContent.trim();
//         } else if (title === "Position") {
//           value = valueSpan.textContent.trim();
//         }

//         // Assign the value accordingly
//         if (title === "Team") {
//           team = value;
//         } else if (title === "Position") {
//           position = value;
//         }
//       }
//     });

//     // Combine extracted data into a single object
//     const extractedData = {
//       team,
//       position,
//     };

//     // Return the extracted data as JSON
//     return NextResponse.json(extractedData);

//     // Locate and extract the relevant data from the stats page
//   } catch (error) {
//     return NextResponse.json({ error: error.message });
//   }
// }

import { NextResponse } from "next/server";
import { JSDOM } from "jsdom";

export async function GET(request) {
  const url = new URL(request.url).searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" });
  }

  try {
    // Fetch the stats page
    const bioRes = await fetch(url);
    if (!bioRes.ok) {
      return NextResponse.json({ error: "Failed to fetch the stats page" });
    }
    const bioHtml = await bioRes.text();

    // Parse the stats page using JSDOM
    const bioDom = new JSDOM(bioHtml);
    const bioDocument = bioDom.window.document;

    // Find all instances of PageLayout__Main
    const pageLayouts = bioDocument.querySelectorAll(".PageLayout__Main");

    let targetPageLayout = null;

    // Iterate through all PageLayout__Main elements to find the one with "Card Bio"
    pageLayouts.forEach((pageLayout, idx) => {
      const cardBioSection = pageLayout.querySelector("section.Card.Bio");
      if (cardBioSection) {
        targetPageLayout = pageLayout; // Found the correct PageLayout
      }
    });

    if (!targetPageLayout) {
      return NextResponse.json({
        error: "PageLayout with Card Bio section not found",
      });
    }

    // Find all the Bio__Item elements within the Card Bio section
    const bioItems = targetPageLayout.querySelectorAll(".Bio__Item");

    let team = "Team not found";
    let position = "Position not found";

    // Iterate through each Bio__Item to find the Team and Position
    bioItems.forEach((item) => {
      const labelElement = item.querySelector(".Bio__Label");
      const label = labelElement?.textContent?.trim();

      // Find the adjacent sibling which contains the value
      const valueElement = labelElement?.nextElementSibling;

      const value = valueElement
        ? valueElement.textContent?.trim() || "Value not found"
        : "Value not found";

      if (label === "Team") {
        team = value || "Team not found";
      } else if (label === "Position") {
        position = value || "Position not found";
      }
    });
    // Combine extracted data into a single object
    const extractedData = {
      team,
      position,
    };

    // Return the extracted data as JSON
    return NextResponse.json(extractedData);
  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}
