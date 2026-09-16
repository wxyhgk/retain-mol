type MapLike<K, V> = {
    has(key: K): boolean;
    get(key: K): V | undefined;
};
export declare function getOrThrow<K, V>(map: MapLike<K, V>, key: K, message: string): V;
export {};
