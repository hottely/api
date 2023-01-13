import { MinLength } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
class PasswordInput {
  @Field()
  @MinLength(5)
  password: string;
}

export default PasswordInput;
