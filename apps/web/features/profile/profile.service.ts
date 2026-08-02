import * as repository from "./profile.repository";

export async function getMyProfile(userId: string) {
  return repository.findByUserId(userId);
}

export async function updateMyProfile(
  userId: string,
  data: unknown
) {
  return repository.updateProfile(userId, data);
}

export async function getProfileByUsername(
  username: string
) {
  return repository.findByUsername(username);
}