import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const signUpUser = async (userData: {
  firebaseUid: string;
  email: string;
  firstName: string;
  lastName: string;
}) => {
  try {
    const { firebaseUid, email, firstName, lastName } = userData;

    if (!firebaseUid || !email || !firstName || !lastName) {
      throw new Error(
        "Firebase UID, email, first name, last name, and password are required."
      );
    }

    const user = await prisma.user.create({
      data: {
        userId: firebaseUid,
        firstName,
        lastName,
        email,
      },
    });

    return {
      message: "User created successfully in the database",
      userId: user.userId,
    };
  } catch (error: any) {
    throw new Error(`Failed to create user in the database: ${error.message}`);
  }
};
