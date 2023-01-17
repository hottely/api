import { Field, Float, InputType, Int } from "type-graphql";

@InputType()
export class PropertyUploadInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field((type) => Int)
  bedrooms: number;

  @Field((type) => Int)
  bathrooms: number;

  @Field((type) => Float)
  price: number;

  @Field((type) => Boolean)
  pets: boolean;

  @Field(() => [String])
  amenities: string[];

  @Field(() => [String])
  images: string[];
}
