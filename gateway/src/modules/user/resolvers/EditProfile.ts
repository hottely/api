import { Arg, Authorized, Ctx, Mutation, Resolver } from "type-graphql";
import { User } from "../../../entity/User";
import { MyContext } from "../../../types/MyContext";
import { EditProfileInput } from "../inputs/EditProfileInput";

@Resolver()
export class EditProfileResolver {
  @Authorized()
  @Mutation(() => User, { nullable: true, complexity: 5 })
  async editProfile(
    @Ctx() ctx: MyContext,
    @Arg("data")
    { email, firstName, lastName }: EditProfileInput
  ): Promise<User | null> {
    try {
      const user = await User.findOne(ctx.currentUser!.id);
      const data = { email, firstName, lastName };

      if (user) {
        await User.update(ctx.currentUser!.id, data);

        const updatedUser = User.merge(user, data);
        return updatedUser;
      }

      return null;
    } catch (error) {
      return null;
    }
  }
}
