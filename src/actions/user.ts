"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function syncUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return;

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (existingUser) return;

    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email: user.emailAddresses[0].emailAddress,
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "",
      },
    });
    return dbUser;
  } catch (error) {
    console.error("Error syncing user", error);
    return null;
  }
}

export async function getUser(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });
    return user;
  } catch (error) {
    console.error("Error getting user", error);
    return null;
  }
}

export async function createRoom(roomId: string, userId: string) {
    try{
        const user = await getUser(userId);
        if(!user) return null;

        const room = await prisma.room.create({
            data:{
                roomId,
                users:{
                    connect:{
                        id: user.id,
                    }
                }
            }
        })

        return room;
    }
    catch(error){
        console.error("Error creating room", error);
        return null;
    }
}