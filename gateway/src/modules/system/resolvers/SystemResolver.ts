import { Ctx, Mutation, Resolver } from "type-graphql";
import { MyContext } from "../../../types/MyContext";

@Resolver()
export class SystemResolver {
  @Mutation(() => Boolean)
  async deleteAll(@Ctx() { dataSources }: MyContext) {
    try {
      await dataSources.propertyAPI.deleteAll();
      await dataSources.bookingsAPI.deleteBookings();
      return true;
    } catch (error) {
      throw Error("failed to delete all");
    }
  }
}
