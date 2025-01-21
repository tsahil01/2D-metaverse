import { atom } from "recoil";
import { AvatarInterface } from "../types";

export const avatarAtom = atom({
    key: "avatar",
    default: null as AvatarInterface | null,
})