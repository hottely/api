import GraphQLJSON from "graphql-type-json";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { MyContext } from "../../../types/MyContext";
import { RESTDataSource } from "apollo-datasource-rest";
import {
  propertiesMock,
  Property,
} from "../../property/resolvers/PropertyResolver";
import CurrentUser from "../../../utils/decorators/currentUser";
import { User } from "../../../entity/User";
import { v4 } from "uuid";
import moment from "moment";

export class BookingAPI extends RESTDataSource {
  override baseURL = `http://bookings-api-service:5000/`;

  async getBookings(): Promise<Booking[]> {
    return this.get<Booking[]>("/bookings");
  }

  async getBookingsForUser(userId): Promise<Booking[]> {
    return this.get<Booking[]>(`/bookings/user/${userId}`);
  }

  async getBookingsForProperty(propertyId): Promise<Booking[]> {
    return this.get<Booking[]>(`/bookings${propertyId}`);
  }

  async createBooking(
    userId: number,
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<unknown> {
    return this.post<unknown>(
      `/bookings${propertyId}/${startDate}/${endDate}/${userId}`
    );
  }
}

type Booking = {
  id: string;
  userId: number;
  property: Property;
  startDate: string;
  endDate: string;
};

@Resolver()
export class BookingsResolver {
  @Query(() => GraphQLJSON)
  async getBookings(@Ctx() { dataSources }: MyContext): Promise<Booking[]> {
    try {
      return dataSources.bookingsAPI.getBookings();
    } catch (error) {
      throw Error("failed to get bookings");
    }
  }

  @Authorized()
  @Query(() => GraphQLJSON)
  async getMyBookings(
    @Ctx() { dataSources }: MyContext,
    @CurrentUser() currentUser: User
  ): Promise<Booking[]> {
    try {
      const bookingMock = [
        {
          id: v4(),
          userId: currentUser.id,
          property: propertiesMock[0],
          startDate: moment().add(8, "weeks").toISOString(),
          endDate: moment().add(9, "weeks").toISOString(),
        },
      ];

      return bookingMock;
      // return dataSources.bookingsAPI.getBookingsForUser(currentUser.id);
    } catch (error) {
      throw Error("failed to get bookings");
    }
  }

  @Authorized()
  @Query(() => GraphQLJSON)
  async getBookingsForProperty(
    @Ctx() { dataSources }: MyContext,
    @CurrentUser() currentUser: User,
    @Arg("propertyId", () => String) propertyId: string
  ): Promise<Booking[]> {
    try {
      const bookingMock = [
        {
          id: v4(),
          userId: currentUser.id,
          property: propertiesMock[0],
          startDate: moment().add(8, "weeks").toISOString(),
          endDate: moment().add(9, "weeks").toISOString(),
        },
      ];

      return bookingMock;
      // return dataSources.bookingsAPI.getBookingsForProperty(propertyId);
    } catch (error) {
      throw Error("failed to get bookings");
    }
  }

  @Authorized()
  @Mutation(() => Boolean)
  async createBooking(
    @Ctx() { dataSources }: MyContext,
    @CurrentUser() currentUser: User,
    @Arg("propertyId", () => String) propertyId: string,
    @Arg("startDate", () => String) startDate: string,
    @Arg("endDate", () => String) endDate: string
  ) {
    try {
      // await dataSources.bookingsAPI.createBooking(
      //   currentUser.id,
      //   propertyId,
      //   startDate,
      //   endDate
      // );

      return true;
    } catch (error) {
      throw Error("failed to create booking");
    }
  }
}
