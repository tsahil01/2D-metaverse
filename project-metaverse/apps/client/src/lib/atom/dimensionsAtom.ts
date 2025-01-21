import { atom } from "recoil";

export const dimensionsAtom = atom({
    key: "dimensionsAtom",
    default: null as string | null,
})