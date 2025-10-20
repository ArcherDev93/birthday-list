export interface Group {
  id: string;
  name: string;
  categories: string[]; // array of categories like ["school", "friends", "family", "work"]
  userId: string; // owner of the group
  trustCode: string; // unique code for sharing/joining the group
  members: string[]; // array of user IDs who have joined this group
  createdAt: string;
  updatedAt: string;
}

export interface GroupFormData {
  name: string;
  categories: string[];
}

export interface JoinGroupRequest {
  trustCode: string;
  userId: string;
}
