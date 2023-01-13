import { Authorized, Ctx, Query, Resolver } from "type-graphql";
import { User } from "../../../entity/User";
import { MyContext } from "../../../types/MyContext";
import CurrentUser from "../../../utils/decorators/currentUser";

@Resolver()
export class MeResolver {
  @Authorized()
  @Query(() => User, { nullable: true, complexity: 5 })
  async me(
    @Ctx() context: MyContext,
    @CurrentUser() currentUser: User
  ): Promise<User | undefined> {
    const user = await User.findOne(currentUser.id);
    return user;
  }
}
