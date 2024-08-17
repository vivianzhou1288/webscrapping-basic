import { NextResponse } from "next/server";
import { JSDOM } from "jsdom";

export async function GET(request) {
  const url = new URL(request.url).searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" });
  }
  try {
    const statsRes = await fetch(url);
    if (!statsRes.ok) {
      return NextResponse.json({ error: "Failed to fetch the stats page" });
    }
    const statsHtml = await statsRes.text();

    // Parse the stats page using JSDOM
    const statsDom = new JSDOM(statsHtml);
    const statsDocument = statsDom.window.document;

    const titleElement = statsDocument.querySelector(".Table__Title");
    const tableTitle = titleElement
      ? titleElement.textContent.trim()
      : "No title";

    if (!titleElement) {
      return NextResponse.json({
        error: "Cannot find chart",
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
      title: tableTitle,
      ...lastRowData,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}
