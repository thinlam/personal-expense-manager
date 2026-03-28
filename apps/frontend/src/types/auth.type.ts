export type UserDTO = {
  id: string;
  name: string;
  email: string;
};

export type AuthSuccessDTO = {
  message: string;
  data: any;
  token: string;
  user: UserDTO;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};
