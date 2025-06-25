import bcrypt from "bcryptjs"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * The function `saltAndHash` asynchronously generates a salt and hashes a password using bcrypt in
 * TypeScript.
 * @param {string} password - The `saltAndHash` function takes a `password` parameter of type string.
 * This function asynchronously generates a salt using `bcrypt.genSalt` and then hashes the password
 * using `bcrypt.hash`. Finally, it returns the hashed password as a string.
 * @returns The `saltAndHash` function returns a Promise that resolves to a hashed password string.
 */
export async function saltAndHash(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    return hash
  } catch (error) {
    throw new Error("Failed to hash password", { cause: error })
  }
}

/**
 * The function `verifyPassword` compares a password with its hash using bcrypt and returns a boolean
 * indicating if they match.
 * @param {string} password - The `password` parameter is a string that represents the user's input
 * password that needs to be verified.
 * @param {string} hash - The `hash` parameter in the `verifyPassword` function is typically a hashed
 * version of a password. It is the result of applying a cryptographic hash function to the original
 * password. This hashed password is stored securely in a database or elsewhere for verification
 * purposes. When a user attempts to log in, their
 * @returns The `verifyPassword` function returns a Promise that resolves to a boolean value indicating
 * whether the provided password matches the given hash.
 */
export async function verifyPassword({
  password,
  hash,
}: {
  password: string
  hash: string
}): Promise<boolean> {
  try {
    const result = await bcrypt.compare(password, hash)
    return result
  } catch (error) {
    throw new Error("Failed to verify password", { cause: error })
  }
}
