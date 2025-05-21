import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getWeatherData, searchCities } from "./weather-api";
import { weatherCache } from "./redis-cache";
import { weatherSearchSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { log } from "./vite";

export async function registerRoutes(app: Express): Promise<Server> {
  // Weather API routes
  const weatherRouter = express.Router();
  
  // Get weather data for a location
  weatherRouter.get("/weather", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      
      if (!query) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      
      // Check cache first
      const cacheKey = `weather:${query.toLowerCase()}`;
      const cachedData = await weatherCache.get(cacheKey);
      
      if (cachedData) {
        return res.json(cachedData);
      }
      
      // If not in cache, fetch from API
      const weatherData = await getWeatherData(query);
      
      // Cache the results
      await weatherCache.set(cacheKey, weatherData);
      
      return res.json(weatherData);
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      }
      
      log(`Weather API error: ${error.message}`, "weather-route");
      return res.status(500).json({ message: "Error fetching weather data" });
    }
  });
  
  // Search for cities
  weatherRouter.get("/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.length < 2) {
        return res.status(400).json({ 
          message: "Query parameter 'q' must be at least 2 characters long" 
        });
      }
      
      const suggestions = await searchCities(query);
      return res.json(suggestions);
    } catch (error: any) {
      log(`City search error: ${error.message}`, "search-route");
      return res.status(500).json({ message: "Error searching for cities" });
    }
  });
  
  // Register weather API routes
  app.use("/api", weatherRouter);
  
  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
