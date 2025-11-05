import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// Using Node 18+ global fetch; no need for node-fetch

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Vespa configuration
const VESPA_HOST = process.env.VESPA_HOST || "localhost";
const VESPA_PORT = process.env.VESPA_PORT || "8080";
const VESPA_APP_URL = `http://${VESPA_HOST}:${VESPA_PORT}`;

// Simple product data for demo
const sampleProducts = [
  {
    id: "1",
    title: "iPhone 15 Pro",
    description:
      "Latest Apple smartphone with titanium design and advanced camera system",
    category: "Electronics",
    price: 999.99,
    description_vector: createRandomVector(),
    title_vector: createRandomVector(),
  },
  {
    id: "2",
    title: "MacBook Air M2",
    description:
      "Thin and light laptop with Apple Silicon chip for everyday computing",
    category: "Computers",
    price: 1199.99,
    description_vector: createRandomVector(),
    title_vector: createRandomVector(),
  },
  {
    id: "3",
    title: "Nike Air Max",
    description: "Comfortable running shoes with air cushioning technology",
    category: "Sports",
    price: 129.99,
    description_vector: createRandomVector(),
    title_vector: createRandomVector(),
  },
  {
    id: "4",
    title: "Samsung 4K TV",
    description:
      "High definition television with smart features and HDR support",
    category: "Electronics",
    price: 599.99,
    description_vector: createRandomVector(),
    title_vector: createRandomVector(),
  },
  {
    id: "5",
    title: "Organic Coffee Beans",
    description: "Premium Arabica coffee beans from sustainable farms",
    category: "Food",
    price: 24.99,
    description_vector: createRandomVector(),
    title_vector: createRandomVector(),
  },
];

// Helper function to create random vectors (in real app, you'd use actual embeddings)

function createRandomVector() {
  const vector = [];
  for (let i = 0; i < 512; i++) {
    vector.push(Math.random() * 2 - 1);
  }
  return vector;
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Vespa Node.js app is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/products", async (req, res) => {
  try {
    res.json({
      products: sampleProducts,
      count: sampleProducts.length,
      message: "Sample products (in production, fetch from Vespa)",
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Search products using Vespa (demo version with local search)
app.post("/api/search", async (req, res) => {
  try {
    const { query, searchType = "text" } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // For demo, we'll do simple text matching
    // In production, this would call Vespa's query API
    let results;

    if (searchType === "text") {
      // Simple text search (case insensitive)
      results = sampleProducts.filter(
        (product) =>
          product.title.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase())
      );
    } else if (searchType === "semantic") {
      // Simulate vector similarity search
      results = sampleProducts
        .map((product) => ({
          ...product,
          similarity: Math.random() * 100, // Random similarity score for demo
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3);
    } else {
      // Hybrid search
      const textResults = sampleProducts.filter((product) =>
        product.title.toLowerCase().includes(query.toLowerCase())
      );
      const vectorResults = sampleProducts
        .map((product) => ({
          ...product,
          similarity: Math.random() * 100,
        }))
        .sort((a, b) => b.similarity - a.similarity);

      // Combine and deduplicate
      const textIds = new Set(textResults.map((p) => p.id));
      const combinedResults = [
        ...textResults,
        ...vectorResults.filter((p) => !textIds.has(p.id)),
      ];
      results = combinedResults.slice(0, 5);
    }

    res.json({
      query,
      searchType,
      results,
      count: results.length,
      message: `Found ${results.length} products using ${searchType} search`,
    });
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

// Add a new product
app.post("/api/products", async (req, res) => {
  try {
    const { title, description, category, price } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title and description are required" });
    }

    const newProduct = {
      id: (sampleProducts.length + 1).toString(),
      title,
      description,
      category: category || "General",
      price: price || 0,
      description_vector: createRandomVector(),
      title_vector: createRandomVector(),
    };

    sampleProducts.push(newProduct);

    res.status(201).json({
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// Vespa-specific endpoints (will be implemented when Vespa is properly connected)
app.get("/api/vespa/status", async (req, res) => {
  try {
    const response = await fetch(`${VESPA_APP_URL}/ApplicationStatus`);
    const status = await response.text();

    res.json({
      vespaStatus: response.status,
      status,
      connected: response.status === 200,
    });
  } catch (error) {
    res.json({
      vespaStatus: "disconnected",
      error: error.message,
      connected: false,
    });
  }
});

// Search using Vespa query API (placeholder for real implementation)
app.post("/api/vespa/search", async (req, res) => {
  try {
    const { yql, params } = req.body;

    // In real implementation, this would construct and send Vespa query
    res.json({
      message: "Vespa query endpoint (placeholder)",
      query: yql,
      parameters: params,
      note: "Connect this to real Vespa query API",
    });
  } catch (error) {
    console.error("Error in Vespa search:", error);
    res.status(500).json({ error: "Vespa search failed" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 API Documentation:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   GET  /api/products - Get all products`);
  console.log(`   POST /api/search - Search products`);
  console.log(`   POST /api/products - Add new product`);
  console.log(`   GET  /api/vespa/status - Check Vespa connection`);
  console.log(`   POST /api/vespa/search - Search using Vespa`);
  console.log(`\n🔍 Try searching for: "iPhone", "laptop", "shoes"`);
});
