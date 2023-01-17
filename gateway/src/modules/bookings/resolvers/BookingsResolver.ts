import { RESTDataSource } from "apollo-datasource-rest";
import GraphQLJSON from "graphql-type-json";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../../../entity/User";
import { MyContext } from "../../../types/MyContext";
import CurrentUser from "../../../utils/decorators/currentUser";
import { Property } from "../../property/resolvers/PropertyResolver";

export class BookingAPI extends RESTDataSource {
  override baseURL = `http://bookings-api-service:5000/`;

  async getBookings(): Promise<BookingRaw[]> {
    return this.get<BookingRaw[]>("/bookings");
  }

  async getBookingsForUser(userId): Promise<BookingRaw[]> {
    return this.get<BookingRaw[]>(`/bookings/user/${userId}`);
  }

  async getBookingsForProperty(propertyId): Promise<BookingRaw[]> {
    return this.get<BookingRaw[]>(`/bookings/${propertyId}`);
  }

  async createBooking(
    userId: number,
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<unknown> {
    return this.post<unknown>(
      `/create_booking/${propertyId}/${startDate}/${endDate}/${userId}`
    );
  }

  async deleteBookings(): Promise<unknown> {
    return this.delete<unknown>("/bookings");
  }
}

type Booking = {
  id: string;
  userId: number;
  property: Property;
  startDate: string;
  endDate: string;
};

type BookingRaw = {
  id: string;
  userId: number;
  property_id: string;
  startDate: string;
  endDate: string;
};

@Resolver()
export class BookingsResolver {
  @Query(() => GraphQLJSON)
  async getBookings(@Ctx() { dataSources }: MyContext): Promise<Booking[]> {
    try {
      const [raw, allProperties] = await Promise.all([
        dataSources.bookingsAPI.getBookings(),
        dataSources.propertyAPI.getProperties(),
      ]);

      const bookings = raw.map((booking) => {
        return {
          ...booking,
          property: allProperties.find(
            (property) => property.id === booking.property_id
          ),
        };
      });

      return bookings;
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
      const [raw, allProperties] = await Promise.all([
        dataSources.bookingsAPI.getBookingsForUser(currentUser.id),
        dataSources.propertyAPI.getProperties(),
      ]);

      const bookings = raw.map((booking) => {
        return {
          ...booking,
          property: allProperties.find(
            (property) => property.id === booking.property_id
          ),
        };
      });

      return bookings;
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
      const [raw, allProperties] = await Promise.all([
        dataSources.bookingsAPI.getBookingsForProperty(propertyId),
        dataSources.propertyAPI.getProperties(),
      ]);

      const bookings = raw.map((booking) => {
        return {
          ...booking,
          property: allProperties.find(
            (property) => property.id === booking.property_id
          ),
        };
      });

      return bookings;
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
      await dataSources.bookingsAPI.createBooking(
        currentUser.id,
        propertyId,
        startDate,
        endDate
      );

      return true;
    } catch (error) {
      throw Error("failed to create booking");
    }
  }
}
