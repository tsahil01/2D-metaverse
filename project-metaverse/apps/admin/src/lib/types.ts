export interface ElementInterface {
    id: string;
    width: number;
    height: number;
    imageUrl: string;
    static: boolean;
    name: string;
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
    id: string;
    name: string;
    imageUrl: string;
}