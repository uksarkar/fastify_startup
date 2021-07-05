/**
 * @param class A class instence
 * @param function Function name of the class to be call
 * @param ...args Rest of the arguments, that will pass to the function
 * @returns Object:{valid: bolean, data: any | null, hint?:string}
 * 
 * ```
 * Class A {
 *    logMessage(msg) {
 *      console.log(msg);
 *      return true;
 *    }
 * }
 * const a = new A();
 * let data = await dynamicFunctionCaller(a,'logMessage','Print this message!');
 * // {valid: true, data: true}
 * let data = await dynamicFunctionCaller(a,'noFunction','Print this message!');
 * // {valid: false, data: null, hint: "NOT_A_FUNCTION"}
 * ```
 */
export async function dynamicFunctionCaller() {
  try {
    const [obj, fun, ...args] = arguments;

    if (obj[fun] && obj[fun] instanceof Function) {
      return { valid: true, data: await obj[fun](...args) };
    }
    return { valid: false, data: null, hint: "NOT_A_FUNCTION" };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
