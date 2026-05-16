

type Address = {
    addressId: number;
    addressLine: string;
    cityLine: string;
    postcode: string;
    isDefault: boolean;
    userUuid: string;
};

type UserRole = {
    roleID: number;
    userUuid: string;
    role?: Role;

};

type User = {
    userUuid: string;
    username: string;
    email: string;
    phone: string | null;
    lastActiveRole: string;
    userImage: string | null;
    gender: "Male" | "Female" | "Other" | null;
    dateOfBirth: string | null;
    userRole?: UserRole][];
    address?: Address[];
};

type Role = {
  roleId: number;
  roleName: string;
};
