import GraphQLJSON from "graphql-type-json";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { MyContext } from "../../../types/MyContext";
import { RESTDataSource } from "apollo-datasource-rest";
import CurrentUser from "../../../utils/decorators/currentUser";
import { User } from "../../../entity/User";
import { PropertyUploadInput } from "../inputs/PropertyUploadInput";

export class PropertyAPI extends RESTDataSource {
  override baseURL = `http://property-service:5000/`;

  async getProperties(): Promise<Property[]> {
    return this.get<Property[]>("properties");
  }
}

type Property = {
  id: string;
  name: string;
  description: string;
  pets: boolean;
  bathrooms: number;
  bedrooms: number;
  price: number;
  images: { url: string }[];
  amenities: { name: string }[];
  landlord_id: string;
};

const thumbnailUrl =
  "https://a0.muscache.com/im/pictures/a139a0fd-efbe-4b16-a5bb-18ec5671fe56.jpg?im_w=1200";

const propertiesMock: Property[] = [
  {
    id: "1",
    name: "Beautiful apartment in the heart of the city",
    description: "description",
    pets: true,
    bathrooms: 1,
    bedrooms: 2,
    price: 100,
    images: [{ url: thumbnailUrl }],
    amenities: [{ name: "parking" }],
    landlord_id: "1",
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
  }

  @Authorized()
  @Mutation(() => Boolean)
  async uploadProperty(
    @Ctx() { dataSources }: MyContext,
    @CurrentUser() currentUser: User,
    @Arg("data") data: PropertyUploadInput
  ) {
    const userId = currentUser.id;
    return true;
  }

  @Authorized()
  @Query(() => GraphQLJSON)
  async getListings(
    @Ctx() { dataSources }: MyContext,
    @CurrentUser() currentUser: User
  ): Promise<Property[]> {
    try {
      const userId = currentUser.id;

      // return dataSources.propertyAPI.getListings(userId);
      return propertiesMock;
    } catch (error) {
      throw Error("failed to get listings");
    }
  }
}
