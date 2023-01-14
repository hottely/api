import { createParamDecorator } from "type-graphql";
import { MyContext } from "../../types/MyContext";

export default function CurrentUser() {
  return createParamDecorator<MyContext>(({ context }) => context.currentUser);
}
