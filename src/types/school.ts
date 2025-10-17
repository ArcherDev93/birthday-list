export interface School {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  name: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolFormData {
  name: string;
}

export interface ClassFormData {
  name: string;
  schoolId: string;
}
