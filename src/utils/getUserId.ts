import { MyContext } from "../types";

export const getUserId = (context: MyContext): string => {
    const { currentUser } = context;

    if (!currentUser || !currentUser.id) {
        throw new Error("Unauthorized: User not logged in.");
    }

    return currentUser.id;
};

