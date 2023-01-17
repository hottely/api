import { Request, Response } from "express";
import { BookingAPI } from "../modules/bookings/resolvers/BookingsResolver";
import { PropertyAPI } from "../modules/property/resolvers/PropertyResolver";

export interface MyContext {
  req: Request;
  res: Response;
  currentUser?: { id: number };
  dataSources: { bookingsAPI: BookingAPI; propertyAPI: PropertyAPI };
}
