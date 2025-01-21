import { atom } from "recoil";
import { OtherUser } from "../types";

export const otherPlayersAtom = atom<OtherUser[]>({
	key: "otherPlayersAtom",
	default: [] as OtherUser[],
})