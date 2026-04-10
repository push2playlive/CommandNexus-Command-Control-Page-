const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');

// These would be set in the environment of your Hetzner V12
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function dispatchScraper(targetUrl) {
  console.log(`[DISPATCHER] Initializing sweep of ${targetUrl}...`);
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required for many VPS environments
  });
  
  try {
    const page = await browser.newPage();
    await page.goto(targetUrl, { waitUntil: 'networkidle2' });

    // Identify forums, directories, and social threads
    // This is a generic selector; in practice, you'd tailor this to the target
    const leads = await page.evaluate(() => {
      const posts = Array.from(document.querySelectorAll('.post-content, .comment-body, .review-text'));
      
      // Simple keyword-based sentiment analysis
      const analyzeSentiment = (text) => {
        const positive = ['love', 'great', 'amazing', 'best', 'excellent', 'happy', 'recommend', 'perfect'];
        const negative = ['hate', 'bad', 'worst', 'terrible', 'awful', 'broken', 'slow', 'expensive', 'alternative', 'switch'];
        
        const lowerText = text.toLowerCase();
        let score = 0;
        
        positive.forEach(word => { if (lowerText.includes(word)) score++; });
        negative.forEach(word => { if (lowerText.includes(word)) score--; });
        
        if (score > 0) return 'positive';
        if (score < 0) return 'negative';
        return 'neutral';
      };

      return posts.map(post => {
        const text = post.innerText.substring(0, 500);
        return {
          text,
          source: window.location.href,
          target_competitor: window.location.hostname,
          timestamp: new Date().toISOString(),
          sentiment: analyzeSentiment(text)
        };
      });
    });

    console.log(`[DISPATCHER] Found ${leads.length} potential leads. Feeding the Nexus...`);

    // FEED THE BRAIN: Send leads to the Nexus for review
    for (let lead of leads) {
      const { error } = await supabase.from('nexus_market_leads').insert(lead);
      if (error) console.error(`[DISPATCHER] Error inserting lead: ${error.message}`);
    }

    console.log("Deed Declared: Market Intel Gathered and stored in nexus_market_leads.");
  } catch (error) {
    console.error(`[DISPATCHER] Critical Failure: ${error.message}`);
  } finally {
    await browser.close();
  }
}

// Example usage: node market-dispatcher.js https://reddit.com/r/design
const target = process.argv[2];
if (target) {
  dispatchScraper(target);
} else {
  console.log("Usage: node market-dispatcher.js <target_url>");
}
