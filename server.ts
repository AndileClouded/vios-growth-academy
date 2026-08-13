import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";
import multer from "multer";

dotenv.config();

// Lazy initialization to prevent startup crashes if key is missing
let resendClient: Resend | null = null;
const getResend = () => {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  // API Route for Social Media Feed
  app.get("/api/social-feed", async (req, res) => {
    try {
      const instagramToken = process.env.INSTAGRAM_ACCESS_TOKEN;
      const twitterToken = process.env.TWITTER_BEARER_TOKEN;

      let posts: any[] = [];

      // Fallback Mock Data (in case APIs fail or tokens are missing)
      const mockPosts = [
        {
          id: 'mock-1',
          platform: 'instagram',
          content: 'Transforming the cracks of rejection into the gold of dignity. Our latest workshop in Kampala was a testament to the human spirit. #Kintsugi #ViosGrowth',
          mediaUrl: 'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=800',
          link: 'https://www.instagram.com/p/DCH-9vMIn8R/',
          timestamp: new Date().toISOString(),
          type: 'IMAGE'
        },
        {
          id: 'mock-2',
          platform: 'twitter',
          content: 'Every great movement begins with a spark. Today we celebrate 12 years of restoring lives and building legacies. The journey continues! 🕊️ #Impact #Leadership',
          link: 'https://twitter.com',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          type: 'text'
        },
        {
          id: 'mock-3',
          platform: 'instagram',
          content: 'Our "Fearless Fridays" sessions are more than just meetings—they are a sanctuary for growth and empowerment. Join the movement. #FearlessWomen #GrowthAcademy',
          mediaUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=800',
          link: 'https://instagram.com',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          type: 'IMAGE'
        }
      ];

      // Fetch Instagram Posts (if token exists)
      if (instagramToken && instagramToken !== "YOUR_INSTAGRAM_TOKEN") {
        try {
          const igResponse = await axios.get(
            `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${instagramToken}`,
            { timeout: 5000 }
          );
          if (igResponse.data && igResponse.data.data) {
            const igPosts = igResponse.data.data.map((post: any) => ({
              id: post.id,
              platform: 'instagram',
              content: post.caption,
              mediaUrl: post.media_url,
              link: post.permalink,
              timestamp: post.timestamp,
              type: post.media_type
            }));
            posts = [...posts, ...igPosts];
          }
        } catch (error: any) {
          console.warn("Instagram API unavailable, using fallback. (Status: " + (error.response?.status || 'Network Error') + ")");
        }
      }

      // Fetch Twitter Posts (if token exists)
      if (twitterToken && twitterToken !== "YOUR_TWITTER_TOKEN") {
        try {
          const twitterResponse = await axios.get(
            `https://api.twitter.com/2/tweets/search/recent?query=from:ViosAcademy&tweet.fields=created_at&max_results=10`,
            {
              headers: { Authorization: `Bearer ${twitterToken}` },
              timeout: 5000
            }
          );
          if (twitterResponse.data && twitterResponse.data.data) {
            const twPosts = twitterResponse.data.data.map((tweet: any) => ({
              id: tweet.id,
              platform: 'twitter',
              content: tweet.text,
              link: `https://twitter.com/i/web/status/${tweet.id}`,
              timestamp: tweet.created_at,
              type: 'text'
            }));
            posts = [...posts, ...twPosts];
          }
        } catch (error: any) {
          console.warn("Twitter API unavailable, using fallback. (Status: " + (error.response?.status || 'Network Error') + ")");
        }
      }

      // If no real posts were fetched, use mock data
      if (posts.length === 0) {
        posts = mockPosts;
      }

      // Sort by timestamp
      posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      res.json(posts);
    } catch (error) {
      console.error("Social feed error:", error);
      res.status(500).json({ error: "Failed to fetch social feed" });
    }
  });

  // Handle Contact Form Submission (Mocking the PHP endpoint)
  app.post("/contact.php", (req, res) => {
    const { name, email, message } = req.body;
    
    // Basic server-side validation
    if (!name || !email || !message) {
      return res.status(400).json({ 
        errors: { 
          general: "All fields are required for submission." 
        } 
      });
    }

    console.log(`New Contact Form Submission:
      Name: ${name}
      Email: ${email}
      Message: ${message}
    `);

    // In a real app, you'd send an email here using a service like SendGrid or Mailgun
    
    res.json({ status: "success", message: "Thank you for your message!" });
  });

  // Handle Consultation Form Submission
  app.post("/api/consultation", (req, res) => {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    console.log(`New Consultation Request:
      Name: ${name}
      Email: ${email}
      Goals: ${message}
    `);

    // In a real app, you'd send an email here using a service like SendGrid or Mailgun
    
    res.json({ status: "success", message: "Consultation request received!" });
  });

  // API Route for Currency Lookup (Server-side to bypass CORS)
  app.get("/api/currency", async (req, res) => {
    try {
      let userCurrency = 'USD';
      let userCountry = '';
      
      // 1. Try to get user data based on IP
      const ipApis = [
        { url: 'https://ipwho.is/', currencyKey: 'currency.code', countryKey: 'country_code' },
        { url: 'https://ipapi.co/json/', currencyKey: 'currency', countryKey: 'country_code' },
        { url: 'https://freeipapi.com/api/json', currencyKey: 'currencyCode', countryKey: 'countryCode' },
        { url: 'https://ip-api.com/json/', currencyKey: '', countryKey: 'countryCode' } 
      ];

      for (let i = 0; i < ipApis.length; i++) {
        const api = ipApis[i];
        try {
          const response = await axios.get(api.url, { timeout: 3000 });
          const data = response.data;
          
          if (!data || data.success === false) continue;

          // Try to get currency code directly
          if (api.currencyKey) {
            const parts = api.currencyKey.split('.');
            let val = data;
            for (const part of parts) val = val?.[part];
            
            if (val && typeof val === 'string' && val.length === 3) {
              userCurrency = val.toUpperCase();
              break; 
            }
          }

          // Fallback: Use country code to map to currency
          const countryKey = api.countryKey as keyof typeof data;
          const countryCode = data[countryKey];
          if (countryCode && typeof countryCode === 'string') {
            userCountry = countryCode.toUpperCase();
            // A small map for major African and global regions if direct currency fails
            const countryToCurrency: Record<string, string> = {
              'NG': 'NGN', 'ZA': 'ZAR', 'KE': 'KES', 'UG': 'UGX', 'TZ': 'TZS', 
              'GH': 'GHS', 'ET': 'ETB', 'RW': 'RWF', 'EG': 'EGP', 'MA': 'MAD',
              'DZ': 'DZD', 'SD': 'SDG', 'AO': 'AOA', 'MZ': 'MZN', 'CI': 'XOF',
              'SN': 'XOF', 'CM': 'XAF', 'CD': 'CDF', 'ZM': 'ZMW', 'ZW': 'ZWL',
              'BW': 'BWP', 'NA': 'NAD', 'MU': 'MUR', 'GB': 'GBP', 'EU': 'EUR',
              'FR': 'EUR', 'DE': 'EUR', 'CN': 'CNY', 'IN': 'INR', 'BR': 'BRL'
            };
            
            if (countryToCurrency[userCountry]) {
              userCurrency = countryToCurrency[userCountry];
              break;
            }
          }
        } catch (e) {
          // Only log a warning if this is the last API in the list
          if (i === ipApis.length - 1) {
             console.warn(`All IP APIs failed. Defaulting to USD.`);
          } else {
             console.info(`IP API ${api.url} unavailable, trying next...`);
          }
        }
      }

      console.log(`Detected: Country: ${userCountry}, Currency: ${userCurrency}`);

      // 2. Get exchange rates (supports 160+ currencies including all of Africa)
      let rate = 1;
      try {
        const rateResponse = await axios.get(`https://open.er-api.com/v6/latest/USD`, { timeout: 4000 });
        if (rateResponse.data?.rates) {
          rate = rateResponse.data.rates[userCurrency] || 1;
        }
      } catch (e) {
        console.warn('Exchange rate API failed, defaulting to rate 1.0');
      }

      res.json({
        code: userCurrency,
        rate: rate
      });
    } catch (error) {
      console.error('Final fallback: Failed to fetch currency data server-side:', error);
      res.json({ code: 'USD', rate: 1 });
    }
  });

  // API Route for Sending Donation Receipts
  app.post("/api/send-receipt", async (req, res) => {
    const { email, firstName, amount, localAmount, currencyCode, transactionId } = req.body;

    if (!email || !firstName || !amount || !transactionId) {
      return res.status(400).json({ error: "Missing required fields for receipt." });
    }

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "") {
      console.warn("RESEND_API_KEY is missing. Mocking success for demo purposes.");
      return res.json({ 
        status: "success", 
        message: "Email receipt mocked (API Key missing)", 
        data: { id: "mock-email-id" } 
      });
    }

    const showLocal = currencyCode && currencyCode !== 'USD' && localAmount;

    try {
      const client = getResend();
      if (!client) {
        throw new Error("Resend client not initialized");
      }
      const { data, error } = await client.emails.send({
        from: "Vios Growth Academy <onboarding@resend.dev>", // Note: For production, use a verified domain
        to: [email],
        subject: "Your Investment in Dignity - Receipt",
        html: `
          <div style="font-family: 'serif', 'Georgia', serif; color: #064e3b; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f3f4f6; border-radius: 24px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #c5a059; font-size: 24px; letter-spacing: 0.2em; text-transform: uppercase;">Vios Growth Academy</h1>
              <p style="font-style: italic; color: #064e3b; opacity: 0.6;">"Restoring Dignity, Building Legacies"</p>
            </div>
            
            <div style="margin-bottom: 40px;">
              <h2 style="font-size: 28px; margin-bottom: 16px;">Thank You, ${firstName}!</h2>
              <p style="line-height: 1.6; font-size: 16px;">
                Your generous contribution has been received. You are now part of the Kintsugi journey, helping us transform rejection into rhythm and heartbreak into healing.
              </p>
            </div>

            <div style="background-color: #f9fafb; padding: 32px; border-radius: 16px; margin-bottom: 40px;">
              <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #c5a059; margin-bottom: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px;">Investment Details</h3>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="font-size: 14px; opacity: 0.6;">Amount:</span>
                <div style="text-align: right;">
                  <strong style="font-size: 18px; display: block;">${showLocal ? localAmount : `$${Number(amount).toLocaleString()} USD`}</strong>
                  ${showLocal ? `<span style="font-size: 12px; color: #888; font-style: italic;">≈ $${Number(amount).toLocaleString()} USD</span>` : ''}
                </div>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="font-size: 14px; opacity: 0.6;">Transaction ID:</span>
                <code style="font-size: 12px; background: #eee; padding: 2px 6px; border-radius: 4px;">${transactionId}</code>
              </div>
              
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 14px; opacity: 0.6;">Date:</span>
                <span style="font-size: 14px;">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>

            <div style="text-align: center; border-top: 1px solid #f3f4f6; pt: 32px;">
              <p style="font-size: 14px; opacity: 0.6; margin-bottom: 24px;">
                Your support directly funds our core pillars: protecting children, empowering men and boys, uplifting women, and providing financial guidance.
              </p>
              <p style="font-size: 12px; color: #c5a059; font-weight: bold;">
                Coach Vio & The Vios Growth Academy Team
              </p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error("Resend Error:", error);
        return res.status(400).json({ error });
      }

      res.json({ status: "success", data });
    } catch (err: any) {
      console.error("Email sending error:", err);
      res.status(500).json({ error: "Internal server error while sending email." });
    }
  });

  // Admin API - Verify server is running
  app.get("/api/admin/status", (req, res) => {
    res.json({ status: "ok", message: "Admin API is running" });
  });

  // Site Content API - Read/Write from local JSON file with SSE broadcast
  const contentFilePath = path.join(process.cwd(), "data", "site-content.json");
  const sseClients = new Set<express.Response>();

  const readContent = (): Record<string, string> => {
    try {
      if (fs.existsSync(contentFilePath)) {
        return JSON.parse(fs.readFileSync(contentFilePath, "utf-8"));
      }
    } catch (e) {
      console.error("Error reading content file:", e);
    }
    return {};
  };

  const writeContent = (data: Record<string, string>) => {
    const dir = path.dirname(contentFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(contentFilePath, JSON.stringify(data, null, 2));
  };

  const broadcastContent = (content: Record<string, string>) => {
    const payload = `data: ${JSON.stringify(content)}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(payload);
      } catch {
        sseClients.delete(client);
      }
    }
  };

  app.get("/api/site-content", (req, res) => {
    const content = readContent();
    res.json(content);
  });

  app.get("/api/site-content/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    res.write(`data: ${JSON.stringify(readContent())}\n\n`);

    sseClients.add(res);
    req.on("close", () => sseClients.delete(res));
  });

  app.post("/api/site-content", (req, res) => {
    try {
      const { content } = req.body;
      if (!content || typeof content !== "object") {
        return res.status(400).json({ error: "Invalid content data" });
      }
      writeContent(content);
      broadcastContent(content);
      res.json({ status: "ok", message: "Content saved successfully" });
    } catch (err) {
      console.error("Error saving content:", err);
      res.status(500).json({ error: "Failed to save content" });
    }
  });

  // Image Upload API
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".jpg";
      const name = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
      cb(null, name);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed"));
      }
    },
  });

  app.use("/uploads", express.static(uploadsDir));

  app.post("/api/upload", (req, res) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        console.error("Upload error:", err);
        return res.status(400).json({ error: err.message || "Upload failed" });
      }
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }
      const url = `/uploads/${req.file.filename}`;
      res.json({ status: "ok", url });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const publicPath = path.join(process.cwd(), 'public');
    app.use('/uploads', express.static(path.join(publicPath, 'uploads')));
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
