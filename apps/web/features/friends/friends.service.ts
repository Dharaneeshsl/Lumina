import * as repository from "./friends.repository";

export async function sendFriendRequest(
  senderId: string,
  receiverId: string
) {
  if (senderId === receiverId) {
    throw new Error("You cannot send a friend request to yourself.");
  }

  const receiver = await repository.findUserById(receiverId);

  if (!receiver) {
    throw new Error("User not found.");
  }

  const existingRequest = await repository.findFriendRequest(
    senderId,
    receiverId
  );

  if (existingRequest) {
    throw new Error("Friend request already exists.");
  }

  return repository.createFriendRequest(senderId, receiverId);
}

export async function acceptFriendRequest(
  userId: string,
  requestId: string
) {
  const request = await repository.findFriendRequestById(requestId);

  if (!request) {
    throw new Error("Friend request not found.");
  }

  if (request.receiverId !== userId) {
    throw new Error("Unauthorized.");
  }

  if (request.status !== "PENDING") {
    throw new Error("Friend request is no longer pending.");
  }

  return repository.updateFriendRequestStatus(
    requestId,
    "ACCEPTED"
  );
}

export async function rejectFriendRequest(
  userId: string,
  requestId: string
) {
  const request = await repository.findFriendRequestById(requestId);

  if (!request) {
    throw new Error("Friend request not found.");
  }

  if (request.receiverId !== userId) {
    throw new Error("Unauthorized.");
  }

  if (request.status !== "PENDING") {
    throw new Error("Friend request is no longer pending.");
  }

  return repository.updateFriendRequestStatus(
    requestId,
    "REJECTED"
  );
}

export async function cancelFriendRequest(
  userId: string,
  requestId: string
) {
  const request = await repository.findFriendRequestById(requestId);

  if (!request) {
    throw new Error("Friend request not found.");
  }

  if (request.senderId !== userId) {
    throw new Error("Unauthorized.");
  }

  if (request.status !== "PENDING") {
    throw new Error("Only pending requests can be cancelled.");
  }

  return repository.updateFriendRequestStatus(
    requestId,
    "CANCELLED"
  );
}

export async function unfriend(
  userId: string,
  friendId: string
) {
  const friendship = await repository.findAcceptedFriendship(
    userId,
    friendId
  );

  if (!friendship) {
    throw new Error("Friendship not found.");
  }

  return repository.deleteFriendship(friendship.id);
}

export async function getMyFriends(userId: string) {
  return repository.getMyFriends(userId);
}

export async function getIncomingRequests(userId: string) {
  return repository.getIncomingRequests(userId);
}

export async function getOutgoingRequests(userId: string) {
  return repository.getOutgoingRequests(userId);
}

export async function getMutualFriends(
  userId: string,
  otherUserId: string
) {
  return repository.getMutualFriends(userId, otherUserId);
}