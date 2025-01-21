import { atom } from "recoil";
import { ElementWithPositionInterface } from "../types";

export const spaceElementsAtom = atom({
    key: "spaceElements",
    default: [] as ElementWithPositionInterface[]
})