import { NextResponse } from "next/server";
import { JSDOM } from "jsdom";
import fs from "fs";

export async function GET(request) {
  const url = new URL(request.url).searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" });
  }

  try {
    // Fetch the profile page
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch the URL" });
    }
    const html = await res.text();

    // Parse the profile page using JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const stickyContainer = document.querySelector(".StickyContainer");
    if (!stickyContainer) {
      return NextResponse.json({ error: "StickyContainer not found" });
    }

    // Find the navigation list within StickyContainer
    const stickyNav = stickyContainer.querySelector(".Nav__Secondary");
    if (!stickyNav) {
      return NextResponse.json({ error: "Sticky navbar not found" });
    }

    const responsiveWrapper = document.querySelector(".ResponsiveWrapper");

    const images = responsiveWrapper.querySelectorAll(
      "div.PlayerHeader div.Image__Wrapper"
    );

    const playerImage = images[1];

    let imageUrl;
    let name;

    if (playerImage) {
      const img = playerImage.querySelector("img");
      name = img.alt;
      imageUrl = img ? img.src : null;
      console.log("Image URL:", imageUrl);
    } else {
      console.log("Image with Image__Wrapper not found.");
    }

    const bioLink = Array.from(stickyNav.querySelectorAll("li a")).find((a) =>
      a.querySelector("span")?.textContent.includes("Bio")
    );

    if (!bioLink) {
      return NextResponse.json({ error: "Stats page link not found" });
    }

    const bioHref = bioLink.getAttribute("href");
    if (!bioHref) {
      return NextResponse.json({
        error: "Href attribute not found in stats link",
      });
    }

    // Construct the absolute URL for the stats page
    const baseUrl = "https://www.espn.com";
    const bioPageUrl = new URL(bioHref, baseUrl).href;

    console.log("Bio Page URL:", bioPageUrl);

    const apiUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

    // Find the link with the text or href pointing to the stats page
    const statsLink = Array.from(stickyNav.querySelectorAll("li a")).find((a) =>
      a.querySelector("span")?.textContent.includes("Stats")
    );

    if (!statsLink) {
      return NextResponse.json({ error: "Stats page link not found" });
    }

    const statsHref = statsLink.getAttribute("href");
    if (!statsHref) {
      return NextResponse.json({
        error: "Href attribute not found in stats link",
      });
    }

    // Construct the absolute URL for the stats page
    const statsPageUrl = new URL(statsHref, baseUrl).href;

    const playerBioResponse = await fetch(
      `${apiUrl}/api/player-bio?url=${encodeURIComponent(bioPageUrl)}`
    );

    // Check if the response is okay (status code in the range 200-299)
    if (!playerBioResponse.ok) {
      throw new Error(`HTTP error! Status: ${playerBioResponse.status}`);
    }

    // Parse the response as JSON
    const playerBio = await playerBioResponse.json();

    // Fetch player stats data
    const playerStatsResponse = await fetch(
      `${apiUrl}/api/player-stats?url=${encodeURIComponent(statsPageUrl)}`
    );

    // Check if the response is okay (status code in the range 200-299)
    if (!playerStatsResponse.ok) {
      throw new Error(`HTTP error! Status: ${playerStatsResponse.status}`);
    }

    // Parse the response as JSON
    const playerStats = await playerStatsResponse.json();

    const combinedPlayerData = {
      name: name,
      image: imageUrl,
      ...playerBio,
      playerStats,
    };
    return NextResponse.json(combinedPlayerData);
  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}
