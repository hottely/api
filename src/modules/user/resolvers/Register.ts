import { hash } from "bcryptjs";
import { Arg, Ctx, Field, Mutation, ObjectType, Resolver } from "type-graphql";
import { User } from "../../../entity/User";
import { MyContext } from "../../../types/MyContext";
import { createAccessToken, createRefreshToken } from "../../../utils/auth";
import { sendRefreshToken } from "../../../utils/sendRefreshToken";
import { RegisterInput } from "../inputs/RegisterInput";

@ObjectType("RegisterResponse")
export class RegisterResponse {
  @Field()
  accessToken: string;
  @Field(() => User)
  user: User;
}

@Resolver()
export class RegisterResolver {
  @Mutation(() => RegisterResponse)
  async register(
    @Arg("data")
    { email, firstName, lastName, password }: RegisterInput,
    @Ctx() { res }: MyContext
  ): Promise<RegisterResponse> {
    try {
      const hashedPassword = await hash(password, 12);

      const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      }).save();

      sendRefreshToken(res, createRefreshToken(user));

      return {
        accessToken: createAccessToken(user),
        user,
      };
    } catch (err) {
      throw err;
    }
  }
}
