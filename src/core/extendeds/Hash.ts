import { customAlphabet, nanoid } from "nanoid";
import { compare, hash } from "bcrypt";

export default class Hash {

    public static uuid(size?: number): string {
        return customAlphabet(this.makeCustomHashString(), size || 21)();
    }

    public static uniqueId(size?: number): string {
        return nanoid(size);
    }

    public static uuidGetOnly(size?: number, only: "lowercase" | "uppercase" | "decimal" | "lowercase&decimal" | "uppercase&decimal" | "lowercase&uppercase" = "lowercase&uppercase"): string {
        return customAlphabet(this.makeCustomHashString(
            ["lowercase", "lowercase&decimal", "lowercase&uppercase"].includes(only),
            ["uppercase", "uppercase&decimal", "lowercase&uppercase"].includes(only),
            ["lowercase&decimal", "uppercase&decimal", "decimal"].includes(only)), size || 21)();
    }

    public static uuidDecimalOnly(size?: number): string {
        return customAlphabet(this.makeCustomHashString(false, false, true), size || 6)();
    }

    public static make(data: string, round = 10): Promise<string> {
        return hash(data, round);
    }

    public static check(data: string, encrypted: string): Promise<boolean> {
        return compare(data, encrypted);
    }

    private static makeCustomHashString(lowerCase = true, upperCase = true, decimal = true): string {
        return `${lowerCase ? this.getLowerCaseLetters() : ""}${upperCase ? this.getUpperCaseLetters() : ""}${decimal ? this.getDecimalNumbers() : ""}`;
    }
    private static getLowerCaseLetters(i = 9): string {
        return ++i < 36 ? i.toString(36) + this.getLowerCaseLetters(i) : "";
    }
    private static getUpperCaseLetters(): string {
        return this.getLowerCaseLetters().toUpperCase();
    }
    private static getDecimalNumbers(): number {
        return Number(Array(10).fill("").map((v, i) => i).join(""));
    }
}