import { promisify } from "util";
import { unlink, writeFile } from "fs/promises";
import { BaseEncodingOptions, createWriteStream } from "fs";
import { pipeline } from "stream";
import PathService from "../service/PathService";
import FileData from "../types/FileData";
import Hash from "./Hash";
import path from "path";
const pump = promisify(pipeline);

export default class Storage {
    fileBinary: NodeJS.ReadableStream | Buffer;
    filename: string;
    dir: string;
    options?: BufferEncoding | BaseEncodingOptions;

    constructor(fileData: FileData, dir?: string, options?: BufferEncoding | BaseEncodingOptions) {
        this.fileBinary = fileData.file;
        this.filename = fileData.filename;
        this.dir = dir ?? PathService.storagePath("public");
        this.options = options;
    }

    public async write(): Promise<boolean> {
        try {
            if (Buffer.isBuffer(this.fileBinary)) {
                await writeFile(`${this.dir}/${this.filename}`, this.fileBinary, this.options);
            } else {
                await pump(
                    this.fileBinary,
                    createWriteStream(`${this.dir}/${this.filename}`),
                );
            }
            return true;
        } catch (error) {
            console.error(error);
        }
        return false;
    }

    public async trash(): Promise<boolean>{
        try {
            await unlink(`${this.dir}/${this.filename}`);
            return true;
        } catch (error) {
            console.error(error);
        }
        return false;
    }

    public static async delete(fileLocation: string): Promise<boolean>{
        try {
            await unlink(fileLocation);
            return true;
        } catch (error) {
            console.error(error);
        }
        return false;
    }

    public static store(data: FileData, dir?: string): Promise<boolean> {
        const store = new this(data, dir);
        return store.write();
    }

    public static storeToPublic(data: FileData, dir?: string): Promise<boolean> {
        const store = new this(data, PathService.publicPath(dir));
        return store.write();
    }

    public static async storeAs(file: NodeJS.ReadableStream | Buffer, ext: string, dir?: string): Promise<string | null> {
        const filename = Hash.uniqueId() + ext;
        return await this.store({ file, filename }, PathService.storagePath(dir)) ? filename : null;
    }

    public static storeAsUnique(data: FileData, dir?: string) {
        return this.storeAs(data.file, path.extname(data.filename), dir);
    }

    public static async storeAsUniqueToPublic(data: FileData, dir?: string) {
        const filename = Hash.uniqueId() + path.extname(data.filename);
        return await this.storeToPublic({ ...data, filename }, dir) ? filename : null;
    }
}