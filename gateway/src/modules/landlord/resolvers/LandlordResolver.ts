import GraphQLJSON from "graphql-type-json";
import { Ctx, Query, Resolver } from "type-graphql";
import { MyContext } from "../../../types/MyContext";
import { RESTDataSource } from "apollo-datasource-rest";

export class LandlordAPI extends RESTDataSource {
  override baseURL = `http://landlord-service:3000/`;

  async getProperties(): Promise<Property[]> {
    return this.get<Property[]>("properties");
  }
}

type Property = {
  id: string;
  city: string;
  size: number;
};

@Resolver()
export class LandlordResolver {
  @Query(() => GraphQLJSON)
  async getProperties(@Ctx() { dataSources }: MyContext): Promise<Property[]> {
    try {
      return dataSources.landlordAPI.getProperties();
    } catch (error) {
      throw Error("failed to get bookings");
    }
  }
}
