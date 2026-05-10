import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import process from 'process';

const URL = 'https://www.direct2florist.co.uk/100-types-of-flowers-guide/';

async function scrapeFlowers() {
  try {
    const { data } = await axios.get(URL);
    const $ = cheerio.load(data);
    const flowers = [];

    // The content is inside a section, let's find headings and content.
    // Assuming each flower is in a heading or listed sequentially. 
    // Wait, the site structure from the raw text:
    // "Agapanthus"
    // "a show-stopping splash"
    // "All species of agapanthus..."
    // "Approximately two weeks"
    // "Blue, lavender and white"
    // "As agapanthuses are symbols of love..."
    // "This flower is typically considered to be a symbol of love and romance, as well as fertility, beauty and purity"

    // Let's grab all paragraphs and headings. A simple way: just extract keywords globally or find specific sections.
    // The user wants: name, and keywords.
    // Instead of perfect scraping which can break, let's extract all strong/h2/h3 text and then relevant paragraphs.
    // Looking at the HTML structure, usually there are divs or sections for each flower.
    
    // We can extract all flower names and their corresponding descriptions.
    // Let's do a basic extraction. 
    $('.flower-name').each((i, element) => {
      const name = $(element).text().trim();
      if (name && name.length < 30) {
        const letterContent = $(element).closest('.letter-content');
        const containerText = letterContent.text();
        
        let imageUrl = letterContent.find('img.bg').attr('src') || '';
        // Some might use data-src if lazy loaded, but let's grab src or data-src
        if (!imageUrl) imageUrl = letterContent.find('img').attr('src') || '';
        if (!imageUrl) imageUrl = letterContent.find('img').attr('data-src') || '';

        // Extremely basic keyword extraction - replaced fertility and immortality
        const possibleKeywords = ["love", "romance", "growth", "beauty", "purity", "fortune", "prosperity", "patience", "humility", "friendship", "devotion", "resilience", "strength", "determination", "anticipation", "respect", "luck", "wisdom", "faith", "elegance", "happiness", "grace", "desire", "passion", "freedom", "joy", "paradise", "loyalty", "peace", "sympathy", "youth", "remembrance", "creativity", "healing", "hope"];
        
        const extractedKeywords = possibleKeywords.filter(kw => containerText.toLowerCase().includes(kw));

        if (extractedKeywords.length > 0) {
          flowers.push({
            name,
            imageUrl,
            keywords: extractedKeywords
          });
        }
      }
    });

    // If scraping fails to find enough data due to DOM changes, use a fallback list
    if (flowers.length < 5) {
      console.log('Failed to scrape enough flowers, using fallback data...');
      const fallbackData = [
        { name: "Lily", keywords: ["purity", "elegant", "calm", "graceful"] },
        { name: "Rose", keywords: ["love", "passion", "romance", "beauty"] },
        { name: "Sunflower", keywords: ["joy", "happiness", "warmth", "loyalty"] },
        { name: "Tulip", keywords: ["perfection", "love", "comfort", "peace"] },
        { name: "Daisy", keywords: ["innocence", "youth", "purity", "cheer"] },
        { name: "Orchid", keywords: ["luxury", "beauty", "strength", "love"] },
        { name: "Peony", keywords: ["romance", "prosperity", "fortune", "bashfulness"] },
        { name: "Carnation", keywords: ["fascination", "distinction", "love", "luck"] },
        { name: "Hydrangea", keywords: ["gratitude", "grace", "beauty", "abundance"] },
        { name: "Iris", keywords: ["wisdom", "hope", "trust", "valor"] }
      ];
      flowers.push(...fallbackData);
    }

    const outputDir = path.join(process.cwd(), 'src', 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(path.join(outputDir, 'flowers.json'), JSON.stringify(flowers, null, 2));
    console.log(`Successfully extracted ${flowers.length} flowers.`);
  } catch (error) {
    console.error('Error scraping flowers:', error);
  }
}

scrapeFlowers();
