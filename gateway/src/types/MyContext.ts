import { Request, Response } from "express";
import { BookingAPI } from "../modules/bookings/resolvers/BookingsResolver";
import { LandlordAPI } from "../modules/landlord/resolvers/LandlordResolver";

export interface MyContext {
  req: Request;
  res: Response;
  currentUser?: { id: number };
  dataSources: { bookingsAPI: BookingAPI; landlordAPI: LandlordAPI };
}
