export default interface Track {
    id: string;
    name: string;
    type: string;
    data: ArrayBuffer;
    tags: string[];
    description: string;
    playlistId: string | null;
}