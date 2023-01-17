import GraphQLJSON from "graphql-type-json";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { MyContext } from "../../../types/MyContext";
import { RequestOptions, RESTDataSource } from "apollo-datasource-rest";
import CurrentUser from "../../../utils/decorators/currentUser";
import { User } from "../../../entity/User";
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
    return this.post<unknown>(`properties`, data);
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
};

const thumbnailUrl =
  "https://a0.muscache.com/im/pictures/a139a0fd-efbe-4b16-a5bb-18ec5671fe56.jpg?im_w=1200";

const secondImage =
  "https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

export const propertiesMock: Property[] = [
  {
    id: "1",
    name: "Beautiful apartment in the heart of the city",
    description: "description",
    pets: true,
    bathrooms: 1,
    bedrooms: 2,
    price: 100,
    images: [{ url: thumbnailUrl }, { url: secondImage }],
    amenities: [{ name: "parking" }],
    landlord_id: 1,
  },
];

@Resolver()
export class PropertyResolver {
  @Query(() => GraphQLJSON)
  async getProperties(@Ctx() { dataSources }: MyContext): Promise<Property[]> {
    try {
      // return dataSources.propertyAPI.getProperties();
      return propertiesMock;
    } catch (error) {
      throw Error("failed to get properties");
    }
  }

  @Query(() => GraphQLJSON)
  async getProperty(
    @Ctx() { dataSources }: MyContext,
    @Arg("propertyId", () => String) propertyId: string
  ) {
    return propertiesMock[0];
    // return dataSources.propertyAPI.getProperty(propertyId);
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
      return propertiesMock;
      // return dataSources.propertyAPI.getListings();
    } catch (error) {
      throw Error("failed to get listings");
    }
  }
}
