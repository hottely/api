import { IsEmail, Length } from "class-validator";
import { Field, InputType, Int } from "type-graphql";
import { IsEmailAlreadyExist } from "../validators/isEmailAlreadyExist";
import PasswordInput from "./PasswordInput";

@InputType()
export class RegisterInput extends PasswordInput {
  @Field()
  @Length(1, 255)
  firstName: string;

  @Field()
  @Length(1, 255)
  lastName: string;

  @Field()
  @IsEmail()
  @IsEmailAlreadyExist({ message: "already-taken" })
  email: string;
}
