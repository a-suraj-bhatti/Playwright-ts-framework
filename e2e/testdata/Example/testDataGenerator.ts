import { faker } from "@faker-js/faker";

export function getRandomCustomerDetails() {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    zipCode: faker.location.zipCode("#####"),
  };
}
