import { atom } from "recoil";

export const playerPositionAtom = atom({
    key: "playerPositionAtom",
    default: { x: 0, y: 0 },
})