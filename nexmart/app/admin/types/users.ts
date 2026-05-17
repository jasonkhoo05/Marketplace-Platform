

export type Address = {
    // addressId: number;
    address_line: string;
    city: string;
    postcode: string;
    is_default: boolean;
    // userUuid: string;
};

export type User = {
    user_uuid: string;
    username: string;
    email: string;
    phone: string | null;
    last_active_role: string;
    user_image: string | null;
    gender: "Male" | "Female" | "Other" | null;
    date_of_birth: string | null;
    // userRole?: UserRole[];
    // address?: Address[];
};

export type UserDetails = User & {
    roles: string[];
    address: Address[];
};

// export type UserRole = {
//     roleId: number;
//     userUuid: string;
//     role?: Role;
// };


// export type Role = {
//   roleId: number;
//   roleName: string;
// };
