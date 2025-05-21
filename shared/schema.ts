import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Keep existing users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Define weather search schema
export const weatherSearchSchema = z.object({
  city: z.string().min(2, "City name must be at least 2 characters"),
  country: z.string().optional(),
});

export type WeatherSearch = z.infer<typeof weatherSearchSchema>;

// Define weather data schema
export const weatherDataSchema = z.object({
  location: z.object({
    name: z.string(),
    country: z.string(),
    region: z.string().optional(),
    lat: z.number(),
    lon: z.number(),
    localtime: z.string(),
  }),
  current: z.object({
    temp_c: z.number(),
    temp_f: z.number(),
    condition: z.object({
      text: z.string(),
      icon: z.string(),
      code: z.number(),
    }),
    wind_kph: z.number(),
    wind_dir: z.string(),
    humidity: z.number(),
    feelslike_c: z.number(),
    feelslike_f: z.number(),
    uv: z.number(),
    vis_km: z.number(),
    pressure_mb: z.number(),
    is_day: z.number(),
  }),
  forecast: z.object({
    forecastday: z.array(
      z.object({
        date: z.string(),
        day: z.object({
          maxtemp_c: z.number(),
          mintemp_c: z.number(),
          maxtemp_f: z.number(),
          mintemp_f: z.number(),
        }),
        astro: z.object({
          sunrise: z.string(),
          sunset: z.string(),
        }),
      })
    ).optional(),
  }).optional(),
  cached: z.boolean().optional(),
  cachedAt: z.string().optional(),
});

export type WeatherData = z.infer<typeof weatherDataSchema>;

// Define weather suggestions schema
export const weatherSuggestionSchema = z.object({
  id: z.number(),
  name: z.string(),
  region: z.string(),
  country: z.string(),
  lat: z.number(),
  lon: z.number(),
});

export type WeatherSuggestion = z.infer<typeof weatherSuggestionSchema>;
export type WeatherSuggestions = WeatherSuggestion[];
