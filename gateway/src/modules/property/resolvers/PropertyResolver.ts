import { RequestOptions, RESTDataSource } from "apollo-datasource-rest";
import GraphQLJSON from "graphql-type-json";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../../../entity/User";
import { MyContext } from "../../../types/MyContext";
import CurrentUser from "../../../utils/decorators/currentUser";
import { PropertyUploadInput } from "../inputs/PropertyUploadInput";

export class PropertyAPI extends RESTDataSource {
  override baseURL = `http://property-service:5000/`;

  protected willSendRequest?(request: RequestOptions) {
    if (this.context.req.headers?.authorization) {
      request.headers.set(
        "Authorization",
        this.context.req.headers.authorization
      );
    }

    request.headers.set("Content-Type", "application/json");
  }

  async getProperties(): Promise<Property[]> {
    return this.get<Property[]>("properties");
  }

  async getProperty(propertyId: string): Promise<Property> {
    return this.get<Property>(`properties/${propertyId}`);
  }

  async getListings(): Promise<Property[]> {
    return this.get<Property[]>(`listings`);
  }

  async createProperty(data: PropertyUploadInput): Promise<unknown> {
    const reqData = {
      ...data,
      amenities: data.amenities.map((a) => {
        return {
          name: a,
        };
      }),
      images: data.images.map((src) => {
        return {
          url: src,
        };
      }),
    };

    console.log("Data to send", reqData);

    return this.post<unknown>(`properties`, reqData);
  }

  async getFavorites(): Promise<Property[]> {
    return this.get<Property[]>(`favorites`);
  }

  async addToFavorites(propertyId: string): Promise<unknown> {
    return this.post<unknown>(`properties/${propertyId}/favorite`);
  }

  async removeFromFavorites(propertyId: string): Promise<unknown> {
    return this.post<unknown>(`properties/${propertyId}/unfavorite`);
  }

  async deleteAll(): Promise<unknown> {
    return this.delete<unknown>(`properties/clean`);
  }
}

export type Property = {
  id: string;
  name: string;
  description: string;
  pets: boolean;
  bathrooms: number;
  bedrooms: number;
  price: number;
  images: { url: string }[];
  amenities: { name: string }[];
  landlord_id: number;
  favorite: boolean;
};

@Resolver()
export class PropertyResolver {
  @Query(() => GraphQLJSON)
  async getProperties(@Ctx() { dataSources }: MyContext): Promise<Property[]> {
    try {
      return dataSources.propertyAPI.getProperties();
    } catch (error) {
      throw Error("failed to get properties");
    }
  }

  @Query(() => GraphQLJSON)
  async getProperty(
    @Ctx() { dataSources }: MyContext,
    @Arg("propertyId", () => String) propertyId: string
  ) {
    return dataSources.propertyAPI.getProperty(propertyId);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async uploadProperty(
    @Ctx() { dataSources }: MyContext,
    @CurrentUser() currentUser: User,
    @Arg("data") data: PropertyUploadInput
  ) {
    try {
      await dataSources.propertyAPI.createProperty(data);
      return true;
    } catch (error) {
      console.log("error at createProperty", error);
      throw Error("failed to create property");
    }
  }

  @Authorized()
  @Query(() => GraphQLJSON)
  async getListings(
    @Ctx() { dataSources }: MyContext,
    @CurrentUser() currentUser: User
  ): Promise<Property[]> {
    try {
      return dataSources.propertyAPI.getListings();
    } catch (error) {
      throw Error("failed to get listings");
    }
  }

  @Authorized()
  @Query(() => GraphQLJSON)
  async getFavorites(
    @Ctx() { dataSources }: MyContext,
    @CurrentUser() currentUser: User
  ): Promise<Property[]> {
    try {
      return dataSources.propertyAPI.getFavorites();
    } catch (error) {
      throw Error("failed to get favorites");
    }
  }

  @Authorized()
  @Mutation(() => Boolean)
  async addToFavorites(
    @Ctx() { dataSources }: MyContext,
    @CurrentUser() currentUser: User,
    @Arg("propertyId", () => String) propertyId: string
  ) {
    try {
      await dataSources.propertyAPI.addToFavorites(propertyId);
      return true;
    } catch (error) {
      throw Error("failed to add to favorites");
    }
  }

  @Authorized()
  @Mutation(() => Boolean)
  async removeFromFavorites(
    @Ctx() { dataSources }: MyContext,
    @CurrentUser() currentUser: User,
    @Arg("propertyId", () => String) propertyId: string
  ) {
    try {
      await dataSources.propertyAPI.removeFromFavorites(propertyId);
      return true;
    } catch (error) {
      throw Error("failed to add to favorites");
    }
  }
}
