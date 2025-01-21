import { atom } from "recoil";

export const userNameAtom = atom({
    key: "userNameAtom",
    default: null as string | null,
})