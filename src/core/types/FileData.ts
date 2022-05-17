export default interface FileData {
    file: NodeJS.ReadableStream | Buffer;
    mimetype?: string;
    filename: string;
}