import { NextResponse } from "next/server";
import { JSDOM } from "jsdom";

export async function GET(request) {
  const url = new URL(request.url).searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" });
  }

  // try {
  //   // Fetch the profile page
  //   const res = await fetch(url);
  //   if (!res.ok) {
  //     return NextResponse.json({ error: "Failed to fetch the URL" });
  //   }
  //   const html = await res.text();

  //   // Parse the profile page using JSDOM
  //   const dom = new JSDOM(html);
  //   const document = dom.window.document;

  //   const stickyContainer = document.querySelector(".StickyContainer");
  //   if (!stickyContainer) {
  //     return NextResponse.json({ error: "StickyContainer not found" });
  //   }

  //   console.log("StickyContainer HTML:", stickyContainer.outerHTML); // Log the StickyContainer HTML

  //   // Find the navigation list within StickyContainer
  //   const stickyNav = stickyContainer.querySelector(".Nav__Secondary");
  //   if (!stickyNav) {
  //     return NextResponse.json({ error: "Sticky navbar not found" });
  //   }

  //   const bioLink = Array.from(stickyNav.querySelectorAll("li a")).find((a) =>
  //     a.querySelector("span")?.textContent.includes("Bio")
  //   );

  //   if (!bioLink) {
  //     return NextResponse.json({ error: "Stats page link not found" });
  //   }

  //   const bioHref = statsLink.getAttribute("href");
  //   if (!href) {
  //     return NextResponse.json({
  //       error: "Href attribute not found in stats link",
  //     });
  //   }

  //   // Construct the absolute URL for the stats page
  //   const baseUrl = "https://www.espn.com";
  //   const bioPageUrl = new URL(bioHref, baseUrl).href;

  //   // Find the link with the text or href pointing to the stats page
  //   const statsLink = Array.from(stickyNav.querySelectorAll("li a")).find((a) =>
  //     a.querySelector("span")?.textContent.includes("Stats")
  //   );

  //   if (!statsLink) {
  //     return NextResponse.json({ error: "Stats page link not found" });
  //   }

  //   const statsHref = statsLink.getAttribute("href");
  //   if (!href) {
  //     return NextResponse.json({
  //       error: "Href attribute not found in stats link",
  //     });
  //   }

  //   // Construct the absolute URL for the stats page
  //   const statsPageUrl = new URL(statsHref, baseUrl).href;

  //   // Log the URL for debugging
  //   console.log("Stats Page URL:", statsPageUrl);

  // Fetch the stats page using the found link
  try {
    const statsRes = await fetch(url);
    if (!statsRes.ok) {
      return NextResponse.json({ error: "Failed to fetch the stats page" });
    }
    const statsHtml = await statsRes.text();

    // Parse the stats page using JSDOM
    const statsDom = new JSDOM(statsHtml);
    const statsDocument = statsDom.window.document;

    // Locate and extract the relevant data from the stats page
    const titleElement = Array.from(
      statsDocument.querySelectorAll(".Table__Title")
    ).find((el) => el.textContent.trim() === "Regular Season Averages");

    if (!titleElement) {
      return NextResponse.json({
        error: "Title 'Regular Season Averages' not found",
      });
    }

    const responsiveTable = titleElement.closest(".ResponsiveTable");
    if (!responsiveTable) {
      return NextResponse.json({ error: "ResponsiveTable not found" });
    }

    const scrollerWrapperDiv = responsiveTable.querySelector(
      ".Table__ScrollerWrapper"
    );
    if (!scrollerWrapperDiv) {
      return NextResponse.json({ error: "ScrollerWrapper not found" });
    }

    const tableScrollerDiv =
      scrollerWrapperDiv.querySelector(".Table__Scroller");
    if (!tableScrollerDiv) {
      return NextResponse.json({ error: "Table Scroller not found" });
    }

    const targetTable = tableScrollerDiv.querySelector("table");
    if (!targetTable) {
      return NextResponse.json({ error: "Table not found" });
    }

    const headers = Array.from(targetTable.querySelectorAll("thead th")).map(
      (th) => th.getAttribute("title") || th.textContent.trim()
    );

    const rows = Array.from(targetTable.querySelectorAll("tbody tr"));
    const lastRow = rows[rows.length - 1];

    if (!lastRow) {
      return NextResponse.json({ error: "Last row not found" });
    }

    const cells = Array.from(lastRow.querySelectorAll("td")).map((td) =>
      td.textContent.trim()
    );
    const lastRowData = headers.reduce((acc, header, i) => {
      acc[header] = cells[i] || ""; // Handle missing cells
      return acc;
    }, {});

    return NextResponse.json({
      title: titleElement.textContent.trim(),
      ...lastRowData,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}
