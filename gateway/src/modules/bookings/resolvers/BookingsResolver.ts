import GraphQLJSON from "graphql-type-json";
import { Ctx, Query, Resolver } from "type-graphql";
import { MyContext } from "../../../types/MyContext";
import { RESTDataSource } from "apollo-datasource-rest";

export class BookingAPI extends RESTDataSource {
  override baseURL = `http://bookings-api-service:5000/`;

  async getBookings(): Promise<Booking[]> {
    return this.get<Booking[]>("/bookings");
  }
}

type Booking = {
  id: string;
  name: string;
};

@Resolver()
export class BookingsResolver {
  @Query(() => GraphQLJSON)
  async getBookings(@Ctx() { dataSources }: MyContext): Promise<Booking[]> {
    try {
      console.log("baseurl", dataSources.bookingsAPI.baseURL);
      return dataSources.bookingsAPI.getBookings();
    } catch (error) {
      throw Error("failed to get bookings");
    }
  }
}
