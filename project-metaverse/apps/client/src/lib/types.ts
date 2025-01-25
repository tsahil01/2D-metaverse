export interface SpaceCardProps {
    id: string;
    name: string;
    width: number;
    height: number;
    thumbnail: string | null;
    creatorId: string;
}


export interface ElementInterface {
    id: string;
    name: string;
    imageUrl: string;
    width: number;
    height: number;
    static: boolean;
}

export interface ElementWithPositionInterface extends ElementInterface {
    x: number;
    y: number;
}

export interface MapElementInterface {
    id: string;
    x: number;
    y: number;
    element: ElementInterface;
}

export interface MapInterface {
    id: string;
    name: string;
    thumbnail: string;
    height: number;
    width: number;
    mapElements: MapElementInterface[];
}

export interface AvatarInterface {
    avatarId: string;
    avatarUrl: string;
}

export interface OtherUser {
    userId: string;
    x: number;
    y: number;
    userName?: string;
}
